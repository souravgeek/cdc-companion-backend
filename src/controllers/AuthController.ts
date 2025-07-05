import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const secret = process.env.JWT_SECRET
if (!secret) {
  throw new Error('JWT_SECRET environment variable is not set')
}

const prisma = new PrismaClient()

export default class AuthController {
  /**
   * POST /api/auth/login
   * Body: { name, password }
   * If valid reviewer/admin, returns { token }
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, password } = req.body
      if (!name || !password) {
        return res.status(400).json({ error: 'Missing name or password' })
      }

      const user = await prisma.reviewer.findUnique({ where: { name } })
      if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Invalid credentials' })
      }

      const payload = {
        id: user.id,
        name: user.name,
        isAdmin: user.admin,
        profiles: user.profiles,
      }

      const token = jwt.sign(payload, process.env.JWT_SECRET!, {
        expiresIn: '8h',
      })

      return res.json({ token })
    } catch (err) {
      next(err)
    }
  }
}
