import mongoose from 'mongoose'

const connectDB = async ()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI).then(
            () => {
                console.log('Connected to mongoDB');
            }
        ).catch((error) => {
            console.log(`Error connecting with mongoDB: ${error.message}`);
            process.exit(1);
        });
    } catch (error) {
        console.log(`Error connecting with mongoDB: ${error.message}`);
        process.exit(1);
        
    }
}

export default connectDB;