import { Request, Response, NextFunction } from 'express';
import { config, IS_PROD } from '../config';

export class AppError extends Error {
  constructor(public statusCode: number, public message: string) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', {
    message: err.message,
    stack: IS_PROD ? 'hidden' : err.stack,
    path: req.path,
    method: req.method,
  });

  // Prisma Errors
  if (err.code?.startsWith('P')) {
    return res.status(400).json({
      error: 'Database operation failed',
      details: IS_PROD ? undefined : err.message,
    });
  }

  // Multer Errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Max 50MB.' });
    }
    return res.status(400).json({ error: err.message });
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    error: message,
    stack: IS_PROD ? undefined : err.stack,
  });
};
