import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { JwtUserPayload } from '../types/auth.types.js';

export const signToken = (payload: JwtUserPayload): string => {
  return jwt.sign(payload, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN as any,
  });
};

export const setAuthCookie = (res: Response, token: string): void => {
  const isProduction = ENV.NODE_ENV === 'production';
  res.cookie(ENV.COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax', // 'none' is required for cross-domain Netlify-to-Render cookies
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
};

export const clearAuthCookie = (res: Response): void => {
  const isProduction = ENV.NODE_ENV === 'production';
  res.clearCookie(ENV.COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  });
};
