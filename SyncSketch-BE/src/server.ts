import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from './Routes/user.routes';
import ConnectionRoutes from './Routes/connection.routes';
import { AppError } from './Errors/index';
import { HTTP_STATUS } from './Constant/index';
import type { Request, Response, NextFunction } from 'express';
import { config } from './Config/env';

const app = express();

// Global middleware - Basic CORS setup
app.use((req: Request, res: Response, next: NextFunction) => {
  // res.header(
  //   'Access-Control-Allow-Origin',
  //   config.server.env === 'production'
  //     ? process.env.FRONTEND_URL || '' // replace with your prod URL if needed
  //     : 'http://localhost:3000'
  // );
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(HTTP_STATUS.OK).json({
    status: 'success',
    message: 'Server is running',
    environment: config.server.env, // ✅ include environment
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/connection', ConnectionRoutes);

// Handle undefined routes
// app.all('/*', (req: Request, res: Response, next: NextFunction) => {
//   next(
//     new AppError(
//       `Can't find ${req.originalUrl} on this server!`,
//       HTTP_STATUS.NOT_FOUND
//     )
//   );
// });

// Global error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  err.status = err.status || 'error';

  // Log error for debugging
  console.error('Error:', err);

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    ...(config.server.env === 'development' && { stack: err.stack }),
  });
});

export default app;
