import { Router, Request, Response, NextFunction } from 'express'
import AdminController from '../controllers/AdminController'
import { auth } from '../middleware/auth'

const ctrl = new AdminController()
const router = Router()


router.post(
  '/login',
  (req: Request, res: Response, next: NextFunction) => {
    ctrl.login(req, res, next).catch(next)
  }
)

router.get(
  '/reviewees',
  (req: Request, res: Response, next: NextFunction) => {
    ctrl.listReviewees(req, res, next).catch(next)
  }
)

router.get(
  '/reviewers',
  (req: Request, res: Response, next: NextFunction) => {
    ctrl.listReviewers(req, res, next).catch(next)
  }
)

router.get(
  '/reviews',
  (req: Request, res: Response, next: NextFunction) => {
    ctrl.listReviews(req, res, next).catch(next)
  }
)

router.post(
  '/allocate',
  (req: Request, res: Response, next: NextFunction) => {
    ctrl.allocate(req, res, next).catch(next)
  }
)

export default router
