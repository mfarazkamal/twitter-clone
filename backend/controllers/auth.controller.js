import User from "../models/user.model.js";
import bcrypt from "bcryptjs"
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";


export const signupController = async (req, res) => {

    try {

        const { fullName, username, email, password } = req.body;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Please provide a valid email address" })
        }

        const userExist = await User.findOne({ username });
        if (userExist) {
            return res.status(400).json({
                success: false,
                message: "Username already exist"
            })
        }


        const emailExist = await User.findOne({ email });
        if (emailExist) {
            return res.status(400).json({
                success: false,
                message: "Email already exist"
            })
        }
        if (password.length < 8) {
            return res.status(400).json({ error: "Password must be at least 8 characters" })
        }

        // PASSWORD HASHING
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt)

        const newUser = new User({
            fullName,
            username,
            password: hashedPass,
            email
        })



        if (newUser) {
            generateTokenAndSetCookie(newUser._id, res);
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                username: newUser.username,
                email: newUser.email,
                followers: newUser.followers,
                following: newUser.following,
                profileImg: newUser.profileImg,
                coverImg: newUser.coverImg
            })
        } else {
            res.status(400).json({ error: "Invalid data" })
        }

    } catch (error) {
        res.status(500).json({ error: "Internal server error" })
        console.log(`Error: ${error.message}`);

    }
}


export const loginController = async (req, res) => {
    try {

        const { username, password } = req.body;
        const checkUser = await User.findOne({ username });
        const isPasswordCorrect = await bcrypt.compare(password, checkUser?.password || "")

        if (!checkUser || !isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credentials" })
        }

        generateTokenAndSetCookie(checkUser._id, res);

        res.status(200).json({
            _id: checkUser._id,
            fullName: checkUser.fullName,
            checkUsername: checkUser.checkUsername,
            email: checkUser.email,
            followers: checkUser.followers,
            following: checkUser.following,
            profileImg: checkUser.profileImg,
            coverImg: checkUser.coverImg
        });

    } catch (error) {
        res.status(500).json({ error: "Internal server error" })
        console.log(`Error in Login Controller: ${error.message}`);

    }
}


export const logoutController = (req, res) => {
   try {
     res.cookie("jwt", "", { maxAge: 0 });
     res.status(200).json({message: "Logged out successfully"});
   } catch (error) {
    res.status(500).json({ error: "Internal server error" })
    console.log(`Error in Logout Controller: ${error.message}`);
}
}


export const myProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');

         res.status(200).json(user);
    } catch (error) {
        console.log(`Error in My Profile: ${error.message}`);
        res.status(500).json({ error: "Internal server error" })
    }
}