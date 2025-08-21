import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { prisma, logger } from '../index'
import { requestValidator } from '../middleware/validator'
import crypto from 'crypto'

const router = Router()

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
  password: z.string().min(8, 'Passwort muss mindestens 8 Zeichen lang sein'),
})

const registerSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
  password: z.string()
    .min(8, 'Passwort muss mindestens 8 Zeichen lang sein')
    .regex(/[A-Z]/, 'Passwort muss mindestens einen Großbuchstaben enthalten')
    .regex(/[a-z]/, 'Passwort muss mindestens einen Kleinbuchstaben enthalten')
    .regex(/[0-9]/, 'Passwort muss mindestens eine Zahl enthalten')
    .regex(/[^A-Za-z0-9]/, 'Passwort muss mindestens ein Sonderzeichen enthalten'),
  vorname: z.string().min(2, 'Vorname muss mindestens 2 Zeichen lang sein'),
  nachname: z.string().min(2, 'Nachname muss mindestens 2 Zeichen lang sein'),
  rolle: z.enum(['SACHBEARBEITER', 'SUPPORT', 'READONLY']).optional(),
})

const refreshTokenSchema = z.object({
  refreshToken: z.string(),
})

// Helper function to generate tokens
const generateTokens = (adminId: string, email: string, rolle: string) => {
  const accessToken = jwt.sign(
    { id: adminId, email, rolle },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  )

  const refreshToken = jwt.sign(
    { id: adminId, email, rolle, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  )

  return { accessToken, refreshToken }
}

// POST /api/auth/register
router.post('/register', 
  requestValidator(registerSchema),
  async (req: Request, res: Response) => {
    try {
      const { email, password, vorname, nachname, rolle = 'READONLY' } = req.body

      // Check if admin already exists
      const existingAdmin = await prisma.admin.findUnique({
        where: { email }
      })

      if (existingAdmin) {
        return res.status(409).json({ error: 'E-Mail-Adresse bereits registriert' })
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12)

      // Create admin
      const admin = await prisma.admin.create({
        data: {
          email,
          passwortHash: hashedPassword,
          vorname,
          nachname,
          rolle,
        }
      })

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(admin.id, admin.email, admin.rolle)

      // Create session
      const sessionToken = crypto.randomBytes(32).toString('hex')
      await prisma.session.create({
        data: {
          token: accessToken,
          adminId: admin.id,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
          ipAdresse: req.ip,
          userAgent: req.headers['user-agent'],
        }
      })

      logger.info({ adminId: admin.id, email: admin.email }, 'New admin registered')

      res.status(201).json({
        message: 'Registrierung erfolgreich',
        user: {
          id: admin.id,
          email: admin.email,
          vorname: admin.vorname,
          nachname: admin.nachname,
          rolle: admin.rolle,
        },
        accessToken,
        refreshToken,
      })
    } catch (error) {
      logger.error({ error }, 'Registration failed')
      res.status(500).json({ error: 'Registrierung fehlgeschlagen' })
    }
  }
)

// POST /api/auth/login
router.post('/login',
  requestValidator(loginSchema),
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body

      // Find admin
      const admin = await prisma.admin.findUnique({
        where: { email }
      })

      if (!admin || !admin.istAktiv) {
        logger.warn({ email }, 'Login attempt for non-existent or inactive account')
        return res.status(401).json({ error: 'Ungültige Anmeldedaten' })
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, admin.passwortHash)

      if (!isValidPassword) {
        logger.warn({ adminId: admin.id }, 'Invalid password attempt')
        return res.status(401).json({ error: 'Ungültige Anmeldedaten' })
      }

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(admin.id, admin.email, admin.rolle)

      // Create session
      await prisma.session.create({
        data: {
          token: accessToken,
          adminId: admin.id,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
          ipAdresse: req.ip,
          userAgent: req.headers['user-agent'],
        }
      })

      // Update last login
      await prisma.admin.update({
        where: { id: admin.id },
        data: { letzteAnmeldung: new Date() }
      })

      logger.info({ adminId: admin.id, email: admin.email }, 'Admin logged in')

      res.json({
        message: 'Anmeldung erfolgreich',
        user: {
          id: admin.id,
          email: admin.email,
          vorname: admin.vorname,
          nachname: admin.nachname,
          rolle: admin.rolle,
        },
        accessToken,
        refreshToken,
      })
    } catch (error) {
      logger.error({ error }, 'Login failed')
      res.status(500).json({ error: 'Anmeldung fehlgeschlagen' })
    }
  }
)

// POST /api/auth/refresh
router.post('/refresh',
  requestValidator(refreshTokenSchema),
  async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body

      // Verify refresh token
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET!
      ) as any

      if (decoded.type !== 'refresh') {
        return res.status(401).json({ error: 'Ungültiges Refresh-Token' })
      }

      // Find admin
      const admin = await prisma.admin.findUnique({
        where: { id: decoded.id }
      })

      if (!admin || !admin.istAktiv) {
        return res.status(401).json({ error: 'Admin nicht gefunden oder inaktiv' })
      }

      // Generate new tokens
      const tokens = generateTokens(admin.id, admin.email, admin.rolle)

      // Create new session
      await prisma.session.create({
        data: {
          token: tokens.accessToken,
          adminId: admin.id,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
          ipAdresse: req.ip,
          userAgent: req.headers['user-agent'],
        }
      })

      logger.info({ adminId: admin.id }, 'Token refreshed')

      res.json({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      })
    } catch (error) {
      logger.error({ error }, 'Token refresh failed')
      
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ error: 'Ungültiges Refresh-Token' })
      }
      
      res.status(500).json({ error: 'Token-Aktualisierung fehlgeschlagen' })
    }
  }
)

// POST /api/auth/logout
router.post('/logout', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token) {
      // Delete session
      await prisma.session.deleteMany({
        where: { token }
      })

      logger.info('Admin logged out')
    }

    res.json({ message: 'Abmeldung erfolgreich' })
  } catch (error) {
    logger.error({ error }, 'Logout failed')
    res.status(500).json({ error: 'Abmeldung fehlgeschlagen' })
  }
})

export default router