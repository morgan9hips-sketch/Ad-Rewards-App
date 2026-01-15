import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function logAdminAction(action: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.json;

    res.json = function (data: any) {
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        prisma.adminAction.create({
          data: {
            adminId: req.user.id,
            action,
            targetType: req.params.type || null,
            targetId: req.params.id ? parseInt(req.params.id) : null,
            metadata: {
              method: req.method,
              path: req.path,
              body: req.body,
              query: req.query,
            },
            ipAddress: req.ip,
          },
        }).catch(console.error);
      }

      return originalSend.call(this, data);
    };

    next();
  };
}
