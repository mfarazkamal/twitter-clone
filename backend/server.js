import express from 'express'
import authRoutes from './routes/auth.routes.js'
import dotenv from 'dotenv'
import connectDB from './db/connectDB.js'
import cookieParser from 'cookie-parser'

const app = express()
const PORT = process.env.PORT || 5000
dotenv.config()

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())


app.use('/api/auth', authRoutes)

app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
    connectDB()
})