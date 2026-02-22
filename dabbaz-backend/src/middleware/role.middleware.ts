import { Request, Response, NextFunction } from 'express';
import { User } from '@prisma/client';

export const requireRole = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.user as User;
        if (!user || (!roles.includes(user.role) && user.role !== 'ADMIN')) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        next();
    };
};
