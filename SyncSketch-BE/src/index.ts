import express, { type Request, type Response } from 'express';
import dotenv from 'dotenv';
import authRoutes from './Routes/user.routes.ts';
import { connectDB } from './DB/db.ts';
import { PORT } from './config.ts';

dotenv.config();

const app = express();

app.use(express.json());

// Async IIFE to connect to DB then start server
(async () => {
    try {
        await connectDB();
        console.log('Database connected');

        app.use('/api/v1/auth', authRoutes);

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to connect to database', error);
        process.exit(1);
    }
})();
