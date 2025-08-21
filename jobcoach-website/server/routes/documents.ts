import { Router, Request, Response } from 'express'
import { prisma } from '../index'
import multer from 'multer'
import path from 'path'
import fs from 'fs/promises'

const router = Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads')
    await fs.mkdir(uploadDir, { recursive: true })
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error('Ungültiger Dateityp. Erlaubt sind: jpeg, jpg, png, pdf, doc, docx'))
    }
  }
})

// Upload document
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Keine Datei hochgeladen',
      })
    }

    const { applicationId } = req.body

    if (!applicationId) {
      // Delete uploaded file if no application ID provided
      await fs.unlink(req.file.path)
      return res.status(400).json({
        success: false,
        error: 'Antrags-ID erforderlich',
      })
    }

    // Check if application exists
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    })

    if (!application) {
      // Delete uploaded file if application doesn't exist
      await fs.unlink(req.file.path)
      return res.status(404).json({
        success: false,
        error: 'Antrag nicht gefunden',
      })
    }

    // Save document record in database
    const document = await prisma.document.create({
      data: {
        applicationId,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        filePath: req.file.path,
      },
    })

    res.json({
      success: true,
      data: document,
      message: 'Dokument erfolgreich hochgeladen',
    })
  } catch (error) {
    console.error('Error uploading document:', error)
    res.status(500).json({
      success: false,
      error: 'Fehler beim Hochladen des Dokuments',
    })
  }
})

// Get documents for application
router.get('/application/:applicationId', async (req: Request, res: Response) => {
  try {
    const { applicationId } = req.params

    const documents = await prisma.document.findMany({
      where: { applicationId },
      orderBy: { createdAt: 'desc' },
    })

    res.json({
      success: true,
      data: documents,
    })
  } catch (error) {
    console.error('Error fetching documents:', error)
    res.status(500).json({
      success: false,
      error: 'Fehler beim Abrufen der Dokumente',
    })
  }
})

// Delete document
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const document = await prisma.document.findUnique({
      where: { id },
    })

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Dokument nicht gefunden',
      })
    }

    // Delete file from filesystem
    try {
      await fs.unlink(document.filePath)
    } catch (err) {
      console.error('Error deleting file:', err)
    }

    // Delete record from database
    await prisma.document.delete({
      where: { id },
    })

    res.json({
      success: true,
      message: 'Dokument erfolgreich gelöscht',
    })
  } catch (error) {
    console.error('Error deleting document:', error)
    res.status(500).json({
      success: false,
      error: 'Fehler beim Löschen des Dokuments',
    })
  }
})

export default router