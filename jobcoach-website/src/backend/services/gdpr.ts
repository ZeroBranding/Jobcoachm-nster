import { PrismaClient } from '@prisma/client'
import { Logger } from 'pino'
import crypto from 'crypto'
import fs from 'fs/promises'
import path from 'path'

export class GDPRService {
  private prisma: PrismaClient
  private logger: Logger
  private encryptionKey: Buffer

  constructor(prisma: PrismaClient, logger: Logger) {
    this.prisma = prisma
    this.logger = logger
    
    // Use environment variable or generate a key (should be stored securely)
    const key = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex')
    this.encryptionKey = Buffer.from(key, 'hex')
  }

  // Encrypt sensitive data
  encrypt(text: string): string {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, iv)
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return iv.toString('hex') + ':' + encrypted
  }

  // Decrypt sensitive data
  decrypt(text: string): string {
    const parts = text.split(':')
    const iv = Buffer.from(parts[0], 'hex')
    const encryptedText = parts[1]
    const decipher = crypto.createDecipheriv('aes-256-cbc', this.encryptionKey, iv)
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  }

  // Anonymize personal data
  anonymizePersonalData(data: any): any {
    const anonymized = { ...data }
    
    // Hash email but keep domain for statistics
    if (anonymized.email) {
      const [, domain] = anonymized.email.split('@')
      anonymized.email = `${crypto.createHash('sha256').update(anonymized.email).digest('hex').substring(0, 8)}@${domain}`
    }

    // Anonymize name
    if (anonymized.vorname) {
      anonymized.vorname = anonymized.vorname[0] + '***'
    }
    if (anonymized.nachname) {
      anonymized.nachname = anonymized.nachname[0] + '***'
    }

    // Remove sensitive numbers
    if (anonymized.telefon) {
      anonymized.telefon = anonymized.telefon.substring(0, 4) + '****'
    }
    if (anonymized.steuerIdNummer) {
      anonymized.steuerIdNummer = '***REDACTED***'
    }
    if (anonymized.sozialversicherungsNummer) {
      anonymized.sozialversicherungsNummer = '***REDACTED***'
    }

    // Anonymize address
    if (anonymized.strasse) {
      anonymized.strasse = '***'
    }
    if (anonymized.hausnummer) {
      anonymized.hausnummer = '***'
    }

    return anonymized
  }

  // Clean up expired data according to GDPR
  async cleanupExpiredData() {
    const now = new Date()
    let deletedCount = 0

    try {
      // 1. Delete applications marked for deletion
      const antraegeFuerLoeschung = await this.prisma.antrag.findMany({
        where: {
          loeschungGeplanntAm: {
            lte: now
          }
        },
        include: {
          dokumente: true,
        }
      })

      for (const antrag of antraegeFuerLoeschung) {
        // Delete associated files
        for (const dokument of antrag.dokumente) {
          try {
            await fs.unlink(dokument.speicherPfad)
            this.logger.info({ dokumentId: dokument.id }, 'Deleted document file')
          } catch (error) {
            this.logger.error({ error, dokumentId: dokument.id }, 'Failed to delete document file')
          }
        }

        // Delete the application (cascades to related records)
        await this.prisma.antrag.delete({
          where: { id: antrag.id }
        })
        deletedCount++

        this.logger.info({ antragId: antrag.id }, 'Deleted application per GDPR')
      }

      // 2. Anonymize old completed applications (after 3 years)
      const threeYearsAgo = new Date()
      threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3)

      const oldAntraege = await this.prisma.antrag.findMany({
        where: {
          status: {
            in: ['BEWILLIGT', 'ABGELEHNT', 'ZURUECKGEZOGEN']
          },
          updatedAt: {
            lte: threeYearsAgo
          }
        },
        include: {
          person: true,
        }
      })

      for (const antrag of oldAntraege) {
        // Anonymize personal data
        const anonymizedData = this.anonymizePersonalData(antrag.formularDaten)
        
        await this.prisma.antrag.update({
          where: { id: antrag.id },
          data: {
            formularDaten: anonymizedData,
            status: 'ARCHIVIERT'
          }
        })

        // Anonymize person data
        await this.prisma.person.update({
          where: { id: antrag.person.id },
          data: {
            vorname: antrag.person.vorname[0] + '***',
            nachname: antrag.person.nachname[0] + '***',
            email: `anon-${antrag.person.id}@deleted.local`,
            telefon: null,
            steuerIdNummer: null,
            sozialversicherungsNummer: null,
            personalausweisnummer: null,
          }
        })

        this.logger.info({ antragId: antrag.id }, 'Anonymized old application')
      }

      // 3. Delete old sessions
      const deletedSessions = await this.prisma.session.deleteMany({
        where: {
          expiresAt: {
            lte: now
          }
        }
      })

      this.logger.info({ count: deletedSessions.count }, 'Deleted expired sessions')

      // 4. Clean up orphaned documents
      const orphanedDocs = await this.prisma.dokument.findMany({
        where: {
          AND: [
            { antragId: null },
            { personId: null },
            {
              createdAt: {
                lte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days old
              }
            }
          ]
        }
      })

      for (const doc of orphanedDocs) {
        try {
          await fs.unlink(doc.speicherPfad)
          await this.prisma.dokument.delete({
            where: { id: doc.id }
          })
          this.logger.info({ dokumentId: doc.id }, 'Deleted orphaned document')
        } catch (error) {
          this.logger.error({ error, dokumentId: doc.id }, 'Failed to delete orphaned document')
        }
      }

      this.logger.info({ 
        deletedApplications: deletedCount,
        anonymizedApplications: oldAntraege.length,
        deletedSessions: deletedSessions.count,
        deletedOrphanedDocs: orphanedDocs.length
      }, 'GDPR cleanup completed')

      return {
        deletedApplications: deletedCount,
        anonymizedApplications: oldAntraege.length,
        deletedSessions: deletedSessions.count,
        deletedOrphanedDocs: orphanedDocs.length
      }
    } catch (error) {
      this.logger.error({ error }, 'GDPR cleanup failed')
      throw error
    }
  }

  // Export user data for GDPR data request
  async exportUserData(email: string): Promise<any> {
    try {
      const person = await this.prisma.person.findUnique({
        where: { email },
        include: {
          antraege: {
            include: {
              dokumente: true,
              statusHistorie: true,
              nachrichten: true,
            }
          },
          haushalte: {
            include: {
              haushalt: true
            }
          },
          adresse: true,
        }
      })

      if (!person) {
        return null
      }

      // Create export object
      const exportData = {
        exportDate: new Date().toISOString(),
        personalData: {
          id: person.id,
          anrede: person.anrede,
          titel: person.titel,
          vorname: person.vorname,
          nachname: person.nachname,
          geburtsdatum: person.geburtsdatum,
          geburtsort: person.geburtsort,
          staatsangehoerigkeit: person.staatsangehoerigkeit,
          familienstand: person.familienstand,
          email: person.email,
          telefon: person.telefon,
          mobiltelefon: person.mobiltelefon,
          createdAt: person.createdAt,
          updatedAt: person.updatedAt,
        },
        address: person.adresse,
        households: person.haushalte.map(hm => ({
          household: hm.haushalt,
          role: hm.rolle,
          isMainApplicant: hm.istHauptantragsteller,
        })),
        applications: person.antraege.map(antrag => ({
          id: antrag.id,
          referenceNumber: antrag.referenzNummer,
          type: antrag.typ,
          status: antrag.status,
          priority: antrag.prioritaet,
          formData: antrag.formularDaten,
          reason: antrag.begruendung,
          submittedAt: antrag.eingereichtAm,
          processedAt: antrag.bearbeitetAm,
          decidedAt: antrag.entschiedenAm,
          deadline: antrag.fristBis,
          documents: antrag.dokumente.map(d => ({
            id: d.id,
            type: d.typ,
            name: d.name,
            description: d.beschreibung,
            fileName: d.dateiName,
            fileSize: d.dateiGroesse,
            mimeType: d.mimeType,
            isConfidential: d.istVertraulich,
            isVerified: d.istVerifiziert,
            createdAt: d.createdAt,
          })),
          statusHistory: antrag.statusHistorie,
          messages: antrag.nachrichten.map(n => ({
            id: n.id,
            subject: n.betreff,
            content: n.inhalt,
            read: n.gelesen,
            readAt: n.gelesenAm,
            createdAt: n.createdAt,
          })),
          createdAt: antrag.createdAt,
          updatedAt: antrag.updatedAt,
        })),
      }

      // Save export to file
      const exportDir = path.join(process.cwd(), 'exports')
      await fs.mkdir(exportDir, { recursive: true })
      
      const filename = `gdpr-export-${person.id}-${Date.now()}.json`
      const filepath = path.join(exportDir, filename)
      
      await fs.writeFile(filepath, JSON.stringify(exportData, null, 2))

      this.logger.info({ personId: person.id, filepath }, 'User data exported')

      return {
        exportData,
        filepath,
        filename,
      }
    } catch (error) {
      this.logger.error({ error, email }, 'Failed to export user data')
      throw error
    }
  }

  // Delete all user data (right to be forgotten)
  async deleteUserData(email: string): Promise<boolean> {
    try {
      const person = await this.prisma.person.findUnique({
        where: { email },
        include: {
          antraege: {
            include: {
              dokumente: true
            }
          }
        }
      })

      if (!person) {
        return false
      }

      // Delete all associated files
      for (const antrag of person.antraege) {
        for (const dokument of antrag.dokumente) {
          try {
            await fs.unlink(dokument.speicherPfad)
            this.logger.info({ dokumentId: dokument.id }, 'Deleted document file for user deletion')
          } catch (error) {
            this.logger.error({ error, dokumentId: dokument.id }, 'Failed to delete document file')
          }
        }
      }

      // Delete person (cascades to all related records)
      await this.prisma.person.delete({
        where: { id: person.id }
      })

      this.logger.info({ personId: person.id, email }, 'User data completely deleted')

      return true
    } catch (error) {
      this.logger.error({ error, email }, 'Failed to delete user data')
      throw error
    }
  }

  // Schedule deletion of application
  async scheduleApplicationDeletion(antragId: string, days: number = 30) {
    const deletionDate = new Date()
    deletionDate.setDate(deletionDate.getDate() + days)

    await this.prisma.antrag.update({
      where: { id: antragId },
      data: {
        loeschungGeplanntAm: deletionDate
      }
    })

    this.logger.info({ 
      antragId, 
      scheduledDate: deletionDate 
    }, 'Application scheduled for deletion')
  }
}