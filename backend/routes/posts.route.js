import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { commentPostController, createPostController, deletePostController, getAllPostController, getLikedPosts, likeUnlikePostController, followingPostController, getUserPostController } from "../controllers/posts.controller.js";


const router = express.Router();

router.get('/all', protectRoute, getAllPostController)
router.get('/followingPosts', protectRoute, followingPostController)
router.get('/liked-posts/:id', protectRoute, getLikedPosts)
router.get('/user/:username', protectRoute, getUserPostController)
router.post('/create', protectRoute, createPostController)
router.post('/like/:id', protectRoute, likeUnlikePostController)
router.post('/comment/:id', protectRoute, commentPostController)
router.delete('/:id', protectRoute, deletePostController)


export default router