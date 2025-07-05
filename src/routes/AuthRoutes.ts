import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface JwtPayload {
  id: number
  name: string
  isAdmin: boolean
  profiles: string[]
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

/**
 * auth(optionalAdmin = false)
 * - verifies Bearer token in Authorization header
 * - attaches payload to req.user
 * - if optionalAdmin=true, also enforces user.isAdmin
 */
export function auth(optionalAdmin = false) {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or malformed token' })
    }

    const token = authHeader.split(' ')[1]
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
      req.user = payload

      if (optionalAdmin && !payload.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' })
      }

      next()
    } catch {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }
  }
}
