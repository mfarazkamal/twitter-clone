import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { followUnfollowController, suggestedUserController, updateUserProfile, userProfileController } from "../controllers/users.controller.js";

const router = express.Router();


router.get('/profile/:username', protectRoute, userProfileController);
router.get('/suggested', protectRoute, suggestedUserController);
router.post('/follow/:id', protectRoute, followUnfollowController);
router.post('/update', protectRoute, updateUserProfile)
// 
export default router