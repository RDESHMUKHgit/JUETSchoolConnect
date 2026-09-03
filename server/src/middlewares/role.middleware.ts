import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types/auth.types.js';

/**
 * Middleware to restrict access to specified user roles
 */
export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized. Please sign in.',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Access denied. Requires one of [${allowedRoles.join(', ')}] permissions.`,
      });
      return;
    }

    next();
  };
};
