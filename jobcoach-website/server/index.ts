import express, { Express, Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'
import applicationsRouter from './routes/applications'
import documentsRouter from './routes/documents'
import { cleanupExpiredApplications } from './services/cleanup'

dotenv.config()

const app: Express = express()
const port = process.env.PORT || 3001
const prisma = new PrismaClient()

// Middleware
app.use(cors({
  origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Routes
app.use('/api/applications', applicationsRouter)
app.use('/api/documents', documentsRouter)

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

// Start server
app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`)
  
  // Start cleanup job (runs every hour)
  setInterval(() => {
    cleanupExpiredApplications()
  }, 60 * 60 * 1000)
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server')
  await prisma.$disconnect()
  process.exit(0)
})

export { prisma }