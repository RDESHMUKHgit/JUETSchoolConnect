import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import { ENV } from './config/env.js';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/error.middleware.js';

const app = express();

// Security and utility middlewares
app.use(helmet());
app.use(morgan('dev'));
app.use(
  cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (curl, mobile apps, Postman)
      if (!origin) return callback(null, true);

      // Allow localhost / dev servers
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }

      // Parse configured client URLs from environment variable
      const configuredOrigins = ENV.CLIENT_URL
        ? ENV.CLIENT_URL.split(',').map((url: string) => url.trim())
        : [];

      if (
        configuredOrigins.includes(origin) ||
        origin.endsWith('.netlify.app') ||
        origin.endsWith('.onrender.com')
      ) {
        return callback(null, true);
      }

      // Fallback: allow all origins with reflection for team previews and testing
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root healthcheck
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'Jaypee School Connect Backend API',
    timestamp: new Date().toISOString(),
    environment: ENV.NODE_ENV,
  });
});

// Mount application API routes
app.use('/api', routes);

// Central error handler
app.use(errorHandler);

const server = app.listen(ENV.PORT, () => {
  console.log(`========================================================`);
  console.log(` Jaypee School Connect Server Running on Port ${ENV.PORT}`);
  console.log(` Client URL Allowed: ${ENV.CLIENT_URL}`);
  console.log(` Healthcheck: http://localhost:${ENV.PORT}/api/health`);
  console.log(`========================================================`);
});

export default app;
