import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { getNotificationsController, deleteNotificationsController, deleteOneNotificationsController } from "../controllers/notifications.controller.js";

const router = express.Router();

router.get('/', protectRoute, getNotificationsController)
router.delete('/', protectRoute, deleteNotificationsController)
router.delete('/:id', protectRoute, deleteOneNotificationsController)


export default router