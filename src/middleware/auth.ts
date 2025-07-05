// src/middleware/auth.ts
import { Request, Response, NextFunction, RequestHandler } from 'express'
import jwt from 'jsonwebtoken'

export interface JwtPayload {
  id: number
  name: string
  isAdmin: boolean
  profiles: string[]
}

// augment Express.Request to carry our payload
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

export function auth(optionalAdmin = false): RequestHandler {
  return (req, res, next) => {
    const header = req.headers.authorization
    if (!header || !header.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or malformed token' })
      return  // <-- no longer `return res...`
    }

    const token = header.slice(7)
    let payload: JwtPayload
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
    } catch {
      res.status(401).json({ error: 'Invalid or expired token' })
      return
    }

    if (optionalAdmin && !payload.isAdmin) {
      res.status(403).json({ error: 'Admin access required' })
      return
    }

    // attach and continue
    req.user = payload
    next()
  }
}
