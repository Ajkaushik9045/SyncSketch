import express, { type Request, type Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
    console.log("this is hitting ");
    res.send('Hello from TypeScript Express!');
});

app.listen(port, () => { 
    console.log(`Server running on port ${port}`);
});