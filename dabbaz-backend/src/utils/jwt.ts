import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

import { prisma } from '../lib/prisma';

export const generateAccessToken = (userId: number): string => {
    return jwt.sign({ id: userId }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });
};

export const generateRefreshToken = async (userId: number): Promise<string> => {
    const token = jwt.sign({ id: userId }, JWT_REFRESH_SECRET, {
        expiresIn: JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });

    const decoded = jwt.decode(token) as jwt.JwtPayload;
    const expiresAt = new Date((decoded.exp as number) * 1000);

    await prisma.refreshToken.create({
        data: {
            user_id: userId,
            token,
            expires_at: expiresAt,
        },
    });

    return token;
};
