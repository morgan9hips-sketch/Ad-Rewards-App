import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Fields to exclude from logs for security
const SENSITIVE_FIELDS = ['password', 'token', 'secret', 'apiKey', 'api_key'];

function sanitizeObject(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized: any = Array.isArray(obj) ? [] : {};
  
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_FIELDS.some(field => lowerKey.includes(field))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

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
              body: sanitizeObject(req.body),
              query: sanitizeObject(req.query),
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
