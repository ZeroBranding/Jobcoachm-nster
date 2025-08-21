import express, { Express, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import { PrismaClient } from '@prisma/client'
import pino from 'pino'
import pinoHttp from 'pino-http'
import dotenv from 'dotenv'
import cron from 'node-cron'

// Import routers
import authRouter from './routes/auth'
import antragRouter from './routes/antrag'
import adminRouter from './routes/admin'
import dokumentRouter from './routes/dokument'
import personRouter from './routes/person'
import leistungRouter from './routes/leistung'

// Import middleware
import { authenticateToken } from './middleware/auth'
import { errorHandler } from './middleware/errorHandler'
import { requestValidator } from './middleware/validator'

// Import services
import { EmailService } from './services/email'
import { PDFService } from './services/pdf'
import { GDPRService } from './services/gdpr'

// Load environment variables
dotenv.config()

// Initialize Prisma
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

// Initialize Logger
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' 
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
  redact: {
    paths: ['req.headers.authorization', '*.password', '*.passwort', '*.email', '*.telefon'],
    censor: '***REDACTED***'
  }
})

// Initialize Express
const app: Express = express()
const port = process.env.PORT || 3001

// ============= MIDDLEWARE =============

// Security
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}))

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Zu viele Anfragen von dieser IP, bitte versuchen Sie es später erneut.',
  standardHeaders: true,
  legacyHeaders: false,
})

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // limit each IP to 5 requests per windowMs for auth endpoints
  skipSuccessfulRequests: true,
})

app.use('/api/', limiter)
app.use('/api/auth/login', strictLimiter)
app.use('/api/auth/register', strictLimiter)

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Compression
app.use(compression())

// Logging
app.use(pinoHttp({ 
  logger,
  autoLogging: {
    ignore: (req) => req.url === '/health'
  }
}))

// ============= ROUTES =============

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  })
})

// API Routes
app.use('/api/auth', authRouter)
app.use('/api/antrag', authenticateToken, antragRouter)
app.use('/api/admin', authenticateToken, adminRouter)
app.use('/api/dokument', authenticateToken, dokumentRouter)
app.use('/api/person', authenticateToken, personRouter)
app.use('/api/leistung', leistungRouter)

// Static files for uploaded documents (protected)
app.use('/uploads', authenticateToken, express.static('uploads'))

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Endpoint nicht gefunden',
    path: req.path,
    method: req.method,
  })
})

// Error Handler (must be last)
app.use(errorHandler)

// ============= CRON JOBS =============

// GDPR Compliance: Delete old data daily at 3 AM
cron.schedule('0 3 * * *', async () => {
  logger.info('Starting GDPR cleanup job')
  try {
    const gdprService = new GDPRService(prisma, logger)
    await gdprService.cleanupExpiredData()
    logger.info('GDPR cleanup completed successfully')
  } catch (error) {
    logger.error({ error }, 'GDPR cleanup failed')
  }
})

// Send reminder emails for pending applications daily at 9 AM
cron.schedule('0 9 * * *', async () => {
  logger.info('Starting reminder email job')
  try {
    const emailService = new EmailService(logger)
    
    // Find applications with upcoming deadlines
    const antraege = await prisma.antrag.findMany({
      where: {
        status: 'IN_BEARBEITUNG',
        fristBis: {
          gte: new Date(),
          lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        }
      },
      include: {
        person: true,
      }
    })

    for (const antrag of antraege) {
      await emailService.sendReminderEmail(
        antrag.person.email,
        antrag.person.vorname,
        antrag.referenzNummer,
        antrag.fristBis!
      )
    }
    
    logger.info(`Sent ${antraege.length} reminder emails`)
  } catch (error) {
    logger.error({ error }, 'Reminder email job failed')
  }
})

// Cleanup old sessions every hour
cron.schedule('0 * * * *', async () => {
  try {
    const deleted = await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    })
    logger.info(`Cleaned up ${deleted.count} expired sessions`)
  } catch (error) {
    logger.error({ error }, 'Session cleanup failed')
  }
})

// ============= SERVER START =============

const server = app.listen(port, () => {
  logger.info(`⚡️ Server läuft auf http://localhost:${port}`)
  logger.info(`📊 Umgebung: ${process.env.NODE_ENV}`)
  logger.info(`🔒 CORS erlaubt für: ${process.env.FRONTEND_URL}`)
})

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} signal empfangen, fahre Server herunter...`)
  
  server.close(() => {
    logger.info('HTTP Server geschlossen')
  })

  // Close database connections
  await prisma.$disconnect()
  logger.info('Datenbankverbindung geschlossen')
  
  process.exit(0)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.fatal({ error }, 'Uncaught Exception')
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  logger.fatal({ reason, promise }, 'Unhandled Rejection')
  process.exit(1)
})

export default app