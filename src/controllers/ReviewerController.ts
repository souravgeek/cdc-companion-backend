// src/controllers/ReviewerController.ts
import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import { sendReviewEmail } from './mailer'

const prisma = new PrismaClient()

// configure your transporter once
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
  },
})

interface JwtPayload {
  id: number
  name: string
  profiles: string[]
}

export default class ReviewerController {
  // POST /api/reviewer/login
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, password } = req.body
      const reviewer = await prisma.reviewer.findUnique({ where: { name } })
      if (!reviewer || reviewer.password !== password) {
        return res.status(401).json({ error: 'Invalid credentials' })
      }

      const payload: JwtPayload = {
        id: reviewer.id,
        name: reviewer.name,
        profiles: reviewer.profiles,
      }

      const token = jwt.sign(payload, process.env.JWT_SECRET!, {
        expiresIn: '8h',
      })

      return res.json({
        token,
        reviewer: {
          id: reviewer.id,
          name: reviewer.name,
          profiles: reviewer.profiles,
          reviewedCount: reviewer.reviewedCount,
        },
      })
    } catch (err) {
      next(err)
    }
  }

  // GET /api/reviewer/next
  async getNextCV(req: Request, res: Response, next: NextFunction) {
    try {
      const auth = req.headers.authorization
      if (!auth?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing token' })
      }
      const payload = jwt.verify(auth.slice(7), process.env.JWT_SECRET!) as JwtPayload

      const reviewer = await prisma.reviewer.findUnique({ where: { id: payload.id } })
      if (!reviewer) {
        return res.status(404).json({ error: 'Reviewer not found' })
      }

      const reviewee = await prisma.reviewee.findFirst({
        where: {
          assignedToId: null,
          profile: { in: reviewer.profiles },
        },
      })
      if (!reviewee) {
        return res.status(204).send()
        
      }

    //   await prisma.reviewer.update({
    //     where: { id: payload.id },
    //     data: { reviewedCount: { increment: 1 } },
    //   })

      await prisma.reviewee.update({
        where: { id: reviewee.id },
        data: { assignedToId: payload.id },
      })

      return res.json(reviewee)
    } catch (err) {
      next(err)
    }
  }

  // POST /api/reviewer/review
  async submitReview(req: Request, res: Response, next: NextFunction) {
    try {
      const auth = req.headers.authorization
      if (!auth?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing token' })
      }
      const payload = jwt.verify(auth.slice(7), process.env.JWT_SECRET!) as JwtPayload

      const { revieweeId, comments } = req.body
      if (!Array.isArray(comments)) {
        return res.status(400).json({ error: 'Comments must be an array' })
      }

      const review = await prisma.review.create({
        data: {
          revieweeId,
          reviewerId: payload.id,
          comments,
        },
      })

      await prisma.reviewee.update({
        where: { id: revieweeId },
        data: { status: true, submittedAt: new Date() },
      })
      await prisma.reviewer.update({
        where: { id: payload.id },
        data: { reviewedCount: { increment: 1 } },
      })

      const re = await prisma.reviewee.findUnique({
        where: { id: revieweeId },
        select: { email: true, name: true },
      })
      if (re?.email) {
        // Uncomment to send email notification
        // await transporter.sendMail({
        //   to: re.email,
        //   from: process.env.SMTP_FROM!,
        //   subject: 'Your CV has been reviewed',
        //   text: `Hi ${re.name},\n\nYour CV has been reviewed. Feedback:\n\n${comments.join('\n')}`,
        // })

const labels = [
  'Structure & Format',
  'Relevance to Domain',
  'Depth of Explanation',
  'Language and Grammar',
  'Improvements in Projects',
  'Additional Suggestions',
]

// const rawComments = [
//   'Clear headings but add spacing.',
//   'Good alignment with the target industry.',
//   'Could use more examples to illustrate key points.',
//   'Watch comma usage and tense consistency.',
//   'Expand on your role in project outcomes.',
//   'Consider adding a summary at the end.',
// ]

// pair label with each comment:
const formattedComments = labels.map((label, idx) => 
  `${label}: ${comments[idx]}`
)

await sendReviewEmail({
  to: re.email,
  userName: re.name,
  reviewComments: formattedComments,
})


      }

      return res.status(201).json(review)
    } catch (err) {
      next(err)
    }
  }

  // GET /api/reviewer/assigned
  async getAssignedCVs(req: Request, res: Response, next: NextFunction) {
    try {
      const auth = req.headers.authorization
      if (!auth?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing token' })
      }
      const payload = jwt.verify(auth.slice(7), process.env.JWT_SECRET!) as JwtPayload

      // fetch reviewer details
      const reviewer = await prisma.reviewer.findUnique({
        where: { id: payload.id },
        select: {
          id: true,
          name: true,
          profiles: true,
          reviewedCount: true,
          reviewsNumber: true,
        },
      })
      if (!reviewer) {
        return res.status(404).json({ error: 'Reviewer not found' })
      }

      // fetch all reviewees assigned to this reviewer
      const assigned = await prisma.reviewee.findMany({
        where: { assignedToId: payload.id },
        select: {
          id: true,
          name: true,
          rollNo: true,
          email: true,
          cvLink: true,
          profile: true,
          status: true,
          submittedAt: true,
        },
      })

      return res.json({
        reviewer,
        assigned,
      })
    } catch (err) {
      next(err)
    }
  }
}