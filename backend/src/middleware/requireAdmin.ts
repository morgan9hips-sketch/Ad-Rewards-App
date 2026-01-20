import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role?: UserRole;
      };
    }
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required' 
    });
  }

  if (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.SUPER_ADMIN) {
    return res.status(403).json({ 
      error: 'Admin access required',
      message: 'You do not have permission to access this resource'
    });
  }

  next();
}

export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== UserRole.SUPER_ADMIN) {
    return res.status(403).json({ 
      error: 'Super admin access required' 
    });
  }

  next();
}

