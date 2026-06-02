import express, { Request, Response } from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import apiRouter from './routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: '*', // We can restrict this to the frontend URL later if needed
  credentials: true,
}));

// Parse JSON request bodies
app.use(express.json({ limit: '10mb' })); // Support larger base64 image uploads

// Route endpoints
app.use('/api', apiRouter);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start listening
app.listen(PORT, () => {
  console.log(`[Server] TaskFlow backend listening on port ${PORT}`);
});

