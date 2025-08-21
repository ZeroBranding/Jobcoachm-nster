import nodemailer from 'nodemailer'
import { compile } from 'handlebars'
import fs from 'fs/promises'
import path from 'path'
import { Logger } from 'pino'

export class EmailService {
  private transporter: nodemailer.Transporter
  private templates: Map<string, HandlebarsTemplateDelegate> = new Map()
  private logger: Logger

  constructor(logger: Logger) {
    this.logger = logger

    // Configure transporter based on environment
    if (process.env.NODE_ENV === 'production') {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })
    } else {
      // Use Ethereal for development
      this.transporter = nodemailer.createTransporter({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: process.env.SMTP_USER || 'ethereal.user',
          pass: process.env.SMTP_PASS || 'ethereal.pass',
        },
      })
    }

    // Load email templates
    this.loadTemplates()
  }

  private async loadTemplates() {
    try {
      const templatesDir = path.join(__dirname, '../templates/email')
      const templateFiles = await fs.readdir(templatesDir)

      for (const file of templateFiles) {
        if (file.endsWith('.hbs')) {
          const templateName = file.replace('.hbs', '')
          const templateContent = await fs.readFile(
            path.join(templatesDir, file),
            'utf-8'
          )
          this.templates.set(templateName, compile(templateContent))
        }
      }

      this.logger.info(`Loaded ${this.templates.size} email templates`)
    } catch (error) {
      this.logger.error({ error }, 'Failed to load email templates')
    }
  }

  private async renderTemplate(templateName: string, data: any): Promise<string> {
    const template = this.templates.get(templateName)
    
    if (!template) {
      // Fallback to simple text if template not found
      return this.getPlainTextEmail(templateName, data)
    }

    return template(data)
  }

  private getPlainTextEmail(type: string, data: any): string {
    const templates: Record<string, string> = {
      welcome: `
Willkommen bei JobCoach Münster!

Hallo ${data.vorname},

vielen Dank für Ihre Registrierung bei JobCoach Münster.

Sie können nun Anträge für verschiedene Sozialleistungen stellen und verwalten.

Mit freundlichen Grüßen
Ihr JobCoach Team
      `,
      antragEingegangen: `
Ihr Antrag ist eingegangen

Hallo ${data.vorname},

Ihr Antrag mit der Referenznummer ${data.referenzNummer} ist bei uns eingegangen.

Antragstyp: ${data.leistungstyp}
Eingegangen am: ${data.datum}

Wir werden Ihren Antrag schnellstmöglich bearbeiten.

Mit freundlichen Grüßen
Ihr JobCoach Team
      `,
      statusUpdate: `
Statusänderung Ihres Antrags

Hallo ${data.vorname},

der Status Ihres Antrags ${data.referenzNummer} hat sich geändert.

Neuer Status: ${data.neuerStatus}
${data.kommentar ? `Kommentar: ${data.kommentar}` : ''}

Sie können den aktuellen Stand jederzeit in Ihrem Dashboard einsehen.

Mit freundlichen Grüßen
Ihr JobCoach Team
      `,
      reminder: `
Erinnerung: Frist läuft ab

Hallo ${data.vorname},

dies ist eine Erinnerung, dass die Frist für Ihren Antrag ${data.referenzNummer} am ${data.frist} abläuft.

Bitte reichen Sie fehlende Unterlagen rechtzeitig ein.

Mit freundlichen Grüßen
Ihr JobCoach Team
      `,
      dokumentAngefordert: `
Dokumente angefordert

Hallo ${data.vorname},

für Ihren Antrag ${data.referenzNummer} benötigen wir noch folgende Dokumente:

${data.dokumente.map((d: string) => `- ${d}`).join('\n')}

Bitte laden Sie diese in Ihrem Dashboard hoch.

Mit freundlichen Grüßen
Ihr JobCoach Team
      `,
    }

    return templates[type] || 'JobCoach Münster - Benachrichtigung'
  }

  async sendMail(options: {
    to: string
    subject: string
    template?: string
    text?: string
    html?: string
    data?: any
    attachments?: any[]
  }) {
    try {
      let html = options.html
      let text = options.text

      // Render template if provided
      if (options.template && options.data) {
        html = await this.renderTemplate(options.template, options.data)
        text = text || this.getPlainTextEmail(options.template, options.data)
      }

      const mailOptions = {
        from: process.env.SMTP_FROM || '"JobCoach Münster" <noreply@jobcoach-muenster.de>',
        to: options.to,
        subject: options.subject,
        text: text || 'JobCoach Münster',
        html: html || text,
        attachments: options.attachments,
      }

      const info = await this.transporter.sendMail(mailOptions)

      this.logger.info({
        messageId: info.messageId,
        to: options.to,
        subject: options.subject,
      }, 'Email sent successfully')

      return info
    } catch (error) {
      this.logger.error({ error, to: options.to }, 'Failed to send email')
      throw error
    }
  }

  // Specific email methods

  async sendWelcomeEmail(email: string, vorname: string) {
    return this.sendMail({
      to: email,
      subject: 'Willkommen bei JobCoach Münster',
      template: 'welcome',
      data: { vorname },
    })
  }

  async sendAntragEingegangenEmail(
    email: string,
    vorname: string,
    referenzNummer: string,
    leistungstyp: string
  ) {
    return this.sendMail({
      to: email,
      subject: `Antrag eingegangen - ${referenzNummer}`,
      template: 'antragEingegangen',
      data: {
        vorname,
        referenzNummer,
        leistungstyp,
        datum: new Date().toLocaleDateString('de-DE'),
      },
    })
  }

  async sendStatusUpdateEmail(
    email: string,
    vorname: string,
    referenzNummer: string,
    neuerStatus: string,
    kommentar?: string
  ) {
    return this.sendMail({
      to: email,
      subject: `Statusänderung - ${referenzNummer}`,
      template: 'statusUpdate',
      data: {
        vorname,
        referenzNummer,
        neuerStatus,
        kommentar,
      },
    })
  }

  async sendReminderEmail(
    email: string,
    vorname: string,
    referenzNummer: string,
    frist: Date
  ) {
    return this.sendMail({
      to: email,
      subject: `Erinnerung: Frist läuft ab - ${referenzNummer}`,
      template: 'reminder',
      data: {
        vorname,
        referenzNummer,
        frist: frist.toLocaleDateString('de-DE'),
      },
    })
  }

  async sendDokumenteAngefordertEmail(
    email: string,
    vorname: string,
    referenzNummer: string,
    dokumente: string[]
  ) {
    return this.sendMail({
      to: email,
      subject: `Dokumente angefordert - ${referenzNummer}`,
      template: 'dokumentAngefordert',
      data: {
        vorname,
        referenzNummer,
        dokumente,
      },
    })
  }

  async sendPDFEmail(
    email: string,
    vorname: string,
    referenzNummer: string,
    pdfBuffer: Buffer,
    filename: string
  ) {
    return this.sendMail({
      to: email,
      subject: `Ihr Antrag als PDF - ${referenzNummer}`,
      text: `Hallo ${vorname},\n\nanbei finden Sie Ihren Antrag ${referenzNummer} als PDF.\n\nMit freundlichen Grüßen\nIhr JobCoach Team`,
      attachments: [
        {
          filename,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    })
  }

  // Test connection
  async verifyConnection() {
    try {
      await this.transporter.verify()
      this.logger.info('Email service connection verified')
      return true
    } catch (error) {
      this.logger.error({ error }, 'Email service connection failed')
      return false
    }
  }
}