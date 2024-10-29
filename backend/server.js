import express from 'express'
import authRoutes from './routes/auth.routes.js'
import dotenv from 'dotenv'
import connectDB from './db/connectDB.js'

const app = express()
const PORT = process.env.PORT || 5000
dotenv.config()


app.use('/api/auth', authRoutes)

app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
    connectDB()
})