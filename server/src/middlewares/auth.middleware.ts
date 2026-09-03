import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { JwtUserPayload } from '../types/auth.types.js';

/**
 * Middleware to authenticate requests using JWT stored in HTTP-only cookie or Authorization header
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  let token: string | undefined;

  // 1. Check HTTP-only cookie
  if (req.cookies && req.cookies[ENV.COOKIE_NAME]) {
    token = req.cookies[ENV.COOKIE_NAME];
  }

  // 2. Check Authorization header (Bearer token)
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in to proceed.',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as JwtUserPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Session has expired or is invalid. Please log in again.',
    });
    return;
  }
};
