import { Request } from 'express';
import { prisma } from '../index';

export const logActivity = async (
  userId: string, 
  action: string, 
  entityType?: string, 
  entityId?: string, 
  details?: string, 
  req?: Request
) => {
  try {
    let ip = req?.ip;
    if (ip && ip.startsWith('::ffff:')) {
      ip = ip.substring(7);
    }

    await prisma.activityLog.create({
      data: {
        userId,
        action: action.toUpperCase(),
        entityType,
        entityId,
        details,
        ipAddress: ip,
        userAgent: req?.headers['user-agent'] as string | undefined,
      },
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};
