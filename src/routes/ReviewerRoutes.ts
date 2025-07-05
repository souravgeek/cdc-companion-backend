import { Router, Request, Response, NextFunction } from 'express'
import ReviewerController from '../controllers/ReviewerController'

const ctrl = new ReviewerController()
const router = Router()

router.post(
  '/login',
  (req: Request, res: Response, next: NextFunction) => {
    ctrl.login(req, res, next).catch(next)
  }
)

router.get(
  '/next',
  (req: Request, res: Response, next: NextFunction) => {
    ctrl.getNextCV(req, res, next).catch(next)
  }
)

router.post(
  '/review',
  (req: Request, res: Response, next: NextFunction) => {
    ctrl.submitReview(req, res, next).catch(next)
  }
)

router.get(
  '/assigned',
  (req: Request, res: Response, next: NextFunction) => {
    ctrl.getAssignedCVs(req, res, next).catch(next)
  }
)


export default router
