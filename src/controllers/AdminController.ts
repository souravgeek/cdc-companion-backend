import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export default class AdminController {
  // POST /api/admin/login

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, password } = req.body
      const admin = await prisma.admin.findFirst({ where: { name } })
      if (!admin || admin.password !== password) {
        return res.status(401).json({ error: 'Invalid credentials' })
      }

      const payload = {
        id: admin.id,
        name: admin.name,
      }

      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET! /* make sure you have this in .env */,
        { expiresIn: '8h' }
      )

      // Return the token and any user info you need on the client
      return res.json({
        token,
        admin: {
          id: admin.id,
          name: admin.name,
        }
      })
    } catch (err: any) {
      next(err)
    }
  }

  // GET /api/admin/reviewees
  async listReviewees(req: Request, res: Response, next: NextFunction) {
    try {
      const all = await prisma.reviewee.findMany({ include: { assignedTo: true, review: true } })
      return res.json(all)
    } catch (err: any) {
      next(err)
    }
  }

  // GET /api/admin/reviewers
  async listReviewers(req: Request, res: Response, next: NextFunction) {
    try {
      const all = await prisma.reviewer.findMany({  select: {
    id:            true,
    name:          true,
    password:      true,      // now valid
    profiles:      true,
    reviewsNumber: true,
    reviewedCount: true,
    email:         true,
    admin:         true,
    assignedCVs:   true,
    reviewsGiven:  true,
  } })
      return res.json(all)
    } catch (err: any) {
      next(err)
    }
  }

  // GET /api/admin/reviews
  async listReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const all = await prisma.review.findMany({ include: { reviewee: true, reviewer: true } })
      return res.json(all)
    } catch (err: any) {
      next(err)
    }
  }

  // POST /api/admin/allocate
  // POST /api/admin/allocate
// POST /api/admin/allocate
async allocate(req: Request, res: Response, next: NextFunction) {
  try {
    const pending = await prisma.reviewee.findMany({
      where: { assignedToId: null },
    });
    if (!pending.length) {
      return res.json({ message: 'No CVs to allocate' });
    }

    // fetch reviewers with their current assignments
    const reviewers = await prisma.reviewer.findMany({
      include: { assignedCVs: true },
    });

    for (const cv of pending) {
      const rollPrefix = parseInt(cv.rollNo.slice(0, 2), 10);

      const eligible = reviewers
        .filter(r => {
          const pwdPrefix = parseInt(r.password.slice(0, 2), 10);

          return (
            // handles this profile
            r.profiles.includes(cv.profile) &&
            // hasn't reviewed up to their quota
            r.reviewedCount < r.reviewsNumber &&
            // doesn't already have too many CVs assigned
            r.assignedCVs.length < r.reviewsNumber &&
            // password-prefix rule
            pwdPrefix < rollPrefix
          );
        })
        .sort((a, b) => a.reviewedCount - b.reviewedCount);

      if (!eligible.length) continue;

      const chosen = eligible[0];

      // assign in DB
      await prisma.reviewee.update({
        where: { id: cv.id },
        data: { assignedToId: chosen.id },
      });

      // bump their reviewedCount
      await prisma.reviewer.update({
        where: { id: chosen.id },
        data: { reviewedCount: { increment: 1 } },
      });

      // keep in-memory state in sync
      chosen.reviewedCount++;
      chosen.assignedCVs.push(cv);
    }

    return res.json({ message: 'Allocation complete' });
  } catch (err) {
    next(err);
  }
}
}