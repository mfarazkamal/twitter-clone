import notificationModel from "../models/notification.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import {v2 as cloudinary} from 'cloudinary';

export const createPostController = async (req, res)=>{

    try {
        const {text} = req.body;
        let {postImage} = req.body;
        const userId = req.user._id.toString()

        const user = await User.findById(userId);
        if(!user) return res.status(404).json({message: "User not found"});

        if(!text && !postImage) return res.status(400).json({message: "No post content provided"});


        if(postImage){
            try{
                const uploadImage  = await cloudinary.uploader.upload(postImage, {
                    folder: "posts",
                    resource_type: "image",
                    
                })
                postImage = uploadImage.secure_url;
            }catch(uploadError){
                console.error("Cloudinary Upload Error: ", uploadError);
                return res.status(500).json({message: "Error uploading image"});
            }
        }

        const newPost = new Post({
            user: userId,
            text,
            postImage
        });
        
        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        console.log(`Error in Create Post Controller: `, error);
        res.status(500).json({message: "Internal server error"});
    }
}


export const deletePostController = async (req, res)=>{
    try {
        const post = await Post.findById(req.params.id)

        if(!post) return res.status(404).json({message: "Post not found"});

        if(post.user.toString() !== req.user._id.toString()) return res.status(401).json({message: "Unauthorized"});

        if(post.postImage){
            const imgId = post.postImage.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imgId);
        }

        await Post.findByIdAndDelete(req.params.id);
        res.status(200).json({message: "Post deleted successfully"});

    } catch (error) {
        console.log(`Error in Delete Post Controller: `, error);
        res.status(500).json({message: "Internal server error"});
        
    }
}



export const commentPostController = async (req, res)=>{
    try {
        const {text} = req.body;
        const postId = req.params.id;
        const userId = req.user._id;

        if(!text) return res.status(400).json({message: "Content Not Available"});

        const user = await User.findById(userId);
        if(!user) return res.status(404).json({message: "User not found"});

        const post = await Post.findById(postId);
        if(!post) return res.status(404).json({message: "Post not found"});

        const comment = {user:userId, text};

        post.comments.push(comment)

        await post.save();
        res.status(200).json(post);

    } catch (error) {
        console.log(`Error in Comment Post Controller: `, error);
        res.status(500).json({message: "Internal server error"});
        
    }
}

export const likeUnlikePostController = async (req, res) => {
    try {
        const userId = req.user._id;
        const {id:postId} = req.params;

        const post = await Post.findById(postId);
        if(!post) return res.status(404).json({message: "Post not found"});

        const userLikedPost = post.likes.includes(userId)

        if(userLikedPost){
            // Unlike Post

            await Post.updateOne({_id: postId}, {$pull: {likes: userId}});
            await User.updateOne({_id: userId}, {$pull: {likedPosts: postId}});
            const updatedLikes = post.likes.filter((id)=> id.toString() !== userId.toString());
            res.status(201).json(updatedLikes);
        } else{
            // Like Post
            post.likes.push(userId)
            await User.updateOne({_id: userId}, {$push: {likedPosts: postId}});
            await post.save()
            // res.status(201).json({message: "Post liked successfully"});

            const likeNotification = new notificationModel({
                from: userId,
                to: post.user,
                type: "like"
            })

            await likeNotification.save()
            const updatedLikes = post.likes;
            res.status(201).json(updatedLikes);
        }


    } catch (error) {
        console.log(`Error in Like Unlike Post Controller: `, error);
        res.status(500).json({message: "Internal server error"});        
    }
}


export const getAllPostController = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        // res.status(200).json(user);
        if(!user) return res.status(404).json({message: "User not found"});

       const posts = await Post.find(user.userId).sort({createdAt: -1}).populate({
           path: "user",
           select: "-password",
           
       }).populate({
        path: "comments.user",
        select: "-password",
       })
       if(posts.length === 0) return res.status(404).json({message: "No posts found"});

        res.status(200).json(posts);

    } catch (error) {
        
        console.log(`Error in Get All Post Controller: `, error);
        res.status(500).json({message: "Internal server error"});
    }
}

export const getLikedPosts = async (req,res) =>{
    const userId = req.params.id;
    try {
        const user = await User.findById(userId);

        if(!user) return res.status(404).json({message: "User not found"});

        const likedPosts = await Post.find({_id: {$in: user.likedPosts}}).populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select: "-password"
        })

        res.status(200).json(likedPosts);
    } catch (error) {
        console.log(`Error in Get Liked Posts Controller: `, error);
        res.status(500).json({message: "Internal server error"});        
    }
}

export const followingPostController = async (req, res) => {
    try {
        const userId = req.user._id;
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: "User not found" });

        const following = user.following;

        const feedPosts = await Post.find({ user: { $in: following } })
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		res.status(200).json(feedPosts);

    } catch (error) {
        console.log(`Error in Following Post Controller: `, error);
        res.status(500).json({message: "Internal server error"});

    }
}

export const getUserPostController = async (req, res)=>{
    const username = req.params.username;
    try {
        const user = await User.findOne({username});

        if(!user) return res.status(404).json({message: "User not found"});

        const posts = await Post.find({user: user._id}).sort({createdAt: -1}).populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select: "-password"
        })

        res.status(200).json(posts);
    } catch (error) {
        console.log(`Error in Get User Post Controller: `, error);
        res.status(500).json({message: "Internal server error"});
        
    }
}