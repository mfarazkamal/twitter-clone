import notificationModel from "../models/notification.model.js";
import User from "../models/user.model.js";
import bcrypt from 'bcryptjs';

import { v2 as cloudinary } from 'cloudinary';


export const userProfileController = async (req, res) => {
    const { username } = req.params;

    try {
        const user = await User.findOne({ username }).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user)

    } catch (error) {
        console.log(`Error in User Profile Controller: ${error.message}`);
        res.status(500).json({ error: "Internal server error" })
    }
}

export const suggestedUserController = async (req, res) => {
    try {
        const userId = req.user._id;
        const usersFollowedbyMe = await User.findById(userId).select('following');

        const users = await User.aggregate([
            {
                $match: {
                    _id: { $ne: userId }
                }
            },
            { $sample: { size: 10 } },
        ])

        const filteredUsers = await users.filter(user => !usersFollowedbyMe.following.includes(user._id));
        const suggestedUsers = filteredUsers.slice(0, 4);

        suggestedUsers.forEach(user => user.password = null);
        res.status(200).json(suggestedUsers)
    } catch (error) {

    }
}


export const followUnfollowController = async (req, res) => {

    try {
        const { id } = req.params;
        const userToModify = await User.findById(id);
        const currentUser = await User.findById(req.user._id);

        if (id === req.user._id.toString()) {
            return res.status(400).json({ Error: "You can't follow/unfollow yourself" });
        }

        if (!userToModify || !currentUser) {
            return res.status(400).json({ Error: "User not found" });
        }

        const isFollowing = currentUser.following.includes(id)

        if (isFollowing) {

            // Unfollow the User
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });

            res.status(200).json({ message: "Unfollowed successfully" });
        } else {

            // Follow the User

            await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });

            // Send notification to the User to be followed

            const newNotification = new notificationModel({
                from: req.user._id,
                to: userToModify._id,
                type: 'follow'
            })

            await newNotification.save();

            res.status(200).json({ message: "Followed successfully" });
        }

    } catch (error) {
        console.log(`Error in Follow Unfollow Controller: ${error.message}`);
        res.status(500).json({ error: "Internal server error" })
    }


}

export const updateUserProfile = async (req, res) => {

    const { fullName, currentPasword, newPassword, bio, link } = req.body;
    let { profileImg, coverImg } = req.body;

    const userId = req.user._id;

    try {

        let user = await User.findById(userId);

        if(!user) res.status(404).json({ message: "User not found" });

        if((!newPassword && currentPasword) || (!currentPasword && newPassword)){
            return res.status(400).json({ error: "Both fields required" });
        }

        if(currentPasword && newPassword){
            const passwordMatch = await bcrypt.compare(currentPasword, user.password);

            if(!passwordMatch) return res.status(400).json({ error: "Passwords do not match" });

            if(newPassword.length<8) return res.status(400).json({ error: "Password must be at least 8 characters" });

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

      
        
        if(profileImg){

            if(user.profileImg){
                await cloudinary.uploader.destroy(user.profileImg.split('/').pop().split('.')[0]);
            }
            const uploadedResult = await cloudinary.uploader.upload(profileImg)
            profileImg = uploadedResult.secure_url;
        }

        if(coverImg){
            if(user.coverImg){
                await cloudinary.uploader.destroy(user.coverImg.split('/').pop().split('.')[0]);
            }
            const uploadedResult = await cloudinary.uploader.upload(coverImg)
            coverImg = uploadedResult.secure_url;
        }

        user.fullName = fullName || user.fullName;
        user.profileImg = profileImg || user.profileImg;
        user.coverImg = coverImg || user.coverImg;
        user.bio = bio || user.bio;
        user.link = link || user.link;

        user = await user.save();

        user.password = null;
        return res.status(200).json(user);

    } catch (error) {
        console.log(`Error in Update User Profile Controller: ${error.message}`);
        res.status(500).json({ error: "Internal server error" })
    }
}