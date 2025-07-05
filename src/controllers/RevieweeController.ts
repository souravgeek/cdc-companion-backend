import { NextFunction, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'


const prisma = new PrismaClient()

/**
 * POST /api/reviewee/submit
 * Body: { name, rollNo, email?, cvLink, profile }
 */

export default class RevieweeController {
  async submitCV(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, rollNo, email, cvLink, profile } = req.body

    if (!name || !rollNo || !cvLink || !profile) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // // validate profile
    // if (!Object.values(Profile).includes(profile)) {
    //   return res.status(400).json({ error: 'Invalid profile' })
    // }

    const reviewee = await prisma.reviewee.create({
      data: {
        name,
        rollNo,
        email,
        cvLink,
        profile,
      },
    })

    console.log("cv submitted")

    return res.status(201).json(reviewee)
  } catch (err: any) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
}
}