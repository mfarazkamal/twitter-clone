import express from 'express'
import { loginController, logoutController, myProfile, signupController } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/protectRoute.js';


const router = express.Router();

router.get('/myprofile', protectRoute ,myProfile)

router.post('/signup', signupController)

router.post('/login', loginController)

router.post('/logout', logoutController)

export default router;

