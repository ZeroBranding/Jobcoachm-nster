import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../index'
import { logger } from '../index'

export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    rolle: string
  }
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Kein Authentifizierungstoken vorhanden' })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any

    // Check if session exists and is valid
    const session = await prisma.session.findUnique({
      where: { token },
      include: { admin: true }
    })

    if (!session || session.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Sitzung abgelaufen oder ungültig' })
    }

    // Attach user to request
    req.user = {
      id: session.admin.id,
      email: session.admin.email,
      rolle: session.admin.rolle,
    }

    // Update last activity
    await prisma.admin.update({
      where: { id: session.admin.id },
      data: { letzteAnmeldung: new Date() }
    })

    next()
  } catch (error) {
    logger.error({ error }, 'Authentication failed')
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Ungültiges Token' })
    }
    
    return res.status(500).json({ error: 'Authentifizierung fehlgeschlagen' })
  }
}

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Nicht authentifiziert' })
    }

    if (!roles.includes(req.user.rolle)) {
      logger.warn({
        userId: req.user.id,
        requiredRoles: roles,
        userRole: req.user.rolle,
        path: req.path
      }, 'Unauthorized access attempt')
      
      return res.status(403).json({ error: 'Keine Berechtigung für diese Aktion' })
    }

    next()
  }
}

export const requireSelfOrAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Nicht authentifiziert' })
  }

  const { id } = req.params

  // Admins can access everything
  if (['SUPER_ADMIN', 'ADMIN'].includes(req.user.rolle)) {
    return next()
  }

  // Check if user is accessing their own resource
  if (req.user.id === id) {
    return next()
  }

  // Check if user is accessing their own application
  if (req.baseUrl.includes('/antrag')) {
    const antrag = await prisma.antrag.findFirst({
      where: {
        id,
        person: {
          email: req.user.email
        }
      }
    })

    if (antrag) {
      return next()
    }
  }

  logger.warn({
    userId: req.user.id,
    targetId: id,
    path: req.path
  }, 'Unauthorized access attempt to other user resource')

  return res.status(403).json({ error: 'Keine Berechtigung für diese Ressource' })
}