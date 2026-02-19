import express from 'express'
import { isAuth } from '../middleware/isAuth.js'
import { addRiderProfile, fetchMyProfile, toggleRiderAvailblity } from '../controllers/rider.js'
import uploadFile from '../middleware/multer.js'

const router = express.Router()

router.post("/new", isAuth, uploadFile, addRiderProfile)
router.get("/myprofile", isAuth, fetchMyProfile)
router.patch(".toggle", isAuth, toggleRiderAvailblity)

export default router