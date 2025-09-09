import mongoose from 'mongoose';
import { config } from './env'; // ✅ import validated config

export const connectDB = async (): Promise<void> => {
    const start = Date.now(); // Record start time
    try {
        await mongoose.connect(config.database.uri);
        const end = Date.now(); // Record end time
        console.log(`MongoDB connected successfully in ${end - start} ms`);
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};
