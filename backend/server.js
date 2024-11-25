import express from 'express'
import authRoutes from './routes/auth.route.js'
import userRoutes from './routes/user.route.js'
import postsRoutes from './routes/posts.route.js'
import notificationsRoutes from './routes/notifications.route.js'
import dotenv from 'dotenv'
import connectDB from './db/connectDB.js'
import cookieParser from 'cookie-parser'
import { v2 as cloudinary } from 'cloudinary';

const app = express()
const PORT = process.env.PORT || 3000
dotenv.config()


app.use(express.json({limit: '5mb'}))
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())



cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})



app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/posts', postsRoutes)
app.use('/api/notifications', notificationsRoutes)


app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
    connectDB()
})