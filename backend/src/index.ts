import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as dotenv from 'dotenv';
import apiRouter from './routes';
import { apiLimiter } from './middlewares/rateLimiter';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable security headers using Helmet
app.use(helmet());

// Configure CORS securely
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    return callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'));
  },
  credentials: true,
}));

// Parse JSON request bodies
app.use(express.json({ limit: '10mb' })); // Support larger base64 image uploads

// Route endpoints with rate limiting
app.use('/api', apiLimiter, apiRouter);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start listening
app.listen(PORT, () => {
  console.log(`[Server] TaskFlow backend listening on port ${PORT}`);
});

