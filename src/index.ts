import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import revieweeRoutes from './routes/RevieweeRoutes'
import reviewerRoutes from './routes/ReviewerRoutes'
import adminRoutes    from './routes/AdminRoutes'
import { Request, Response, NextFunction } from 'express'
import path from 'path'

dotenv.config()
const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/reviewee', revieweeRoutes)
app.use('/api/reviewer', reviewerRoutes)
app.use('/api/admin',    adminRoutes)

interface ErrorWithStatus extends Error {
    status?: number
}

app.use(
  '/assets',
  express.static(path.join(__dirname, '../public/assets'))
)

app.use((err: ErrorWithStatus, req: Request, res: Response, next: NextFunction) => {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`))
