import express from 'express'
import { loginController, logoutController, signupController } from '../controllers/auth.controller.js';


const router = express.Router();

router.get('/signup', signupController)

router.post('/login', loginController)

router.post('/logout', logoutController)

export default router;

