import { Router, Request, Response } from 'express'
import { prisma } from '../index'
import { ApplicationType, ApplicationStatus } from '@prisma/client'

const router = Router()

// Create new application
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      type,
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      address,
      city,
      postalCode,
      formData,
      signature,
      gdprConsent,
    } = req.body

    // Set expiration date (30 days from now)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    const application = await prisma.application.create({
      data: {
        type: type as ApplicationType,
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth: new Date(dateOfBirth),
        address,
        city,
        postalCode,
        formData,
        signature,
        signedAt: signature ? new Date() : null,
        gdprConsent,
        gdprConsentAt: gdprConsent ? new Date() : null,
        expiresAt,
      },
    })

    res.status(201).json({
      success: true,
      data: application,
      message: 'Antrag erfolgreich eingereicht',
    })
  } catch (error) {
    console.error('Error creating application:', error)
    res.status(500).json({
      success: false,
      error: 'Fehler beim Erstellen des Antrags',
    })
  }
})

// Get application by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const application = await prisma.application.findUnique({
      where: { id },
      include: { documents: true },
    })

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Antrag nicht gefunden',
      })
    }

    res.json({
      success: true,
      data: application,
    })
  } catch (error) {
    console.error('Error fetching application:', error)
    res.status(500).json({
      success: false,
      error: 'Fehler beim Abrufen des Antrags',
    })
  }
})

// Update application status
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!Object.values(ApplicationStatus).includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Ungültiger Status',
      })
    }

    const application = await prisma.application.update({
      where: { id },
      data: { status: status as ApplicationStatus },
    })

    res.json({
      success: true,
      data: application,
      message: 'Status erfolgreich aktualisiert',
    })
  } catch (error) {
    console.error('Error updating application status:', error)
    res.status(500).json({
      success: false,
      error: 'Fehler beim Aktualisieren des Status',
    })
  }
})

// Delete application (GDPR compliance)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    await prisma.application.delete({
      where: { id },
    })

    res.json({
      success: true,
      message: 'Antrag erfolgreich gelöscht',
    })
  } catch (error) {
    console.error('Error deleting application:', error)
    res.status(500).json({
      success: false,
      error: 'Fehler beim Löschen des Antrags',
    })
  }
})

export default router