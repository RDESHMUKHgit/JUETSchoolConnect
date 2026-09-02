import { Request, Response, NextFunction } from 'express';
import { UserStatus } from '../types/auth.types.js';

/**
 * Middleware to enforce account status restrictions (e.g. only VERIFIED users can access dashboards)
 */
export const requireStatus = (...allowedStatuses: UserStatus[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized. Please sign in.',
      });
      return;
    }

    if (!allowedStatuses.includes(req.user.status)) {
      res.status(403).json({
        success: false,
        message: `Action not permitted. Current account status is '${req.user.status}'.`,
        currentStatus: req.user.status,
      });
      return;
    }

    next();
  };
};
