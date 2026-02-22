import { User } from '@prisma/client';

declare global {
    namespace Express {
        interface User {
            id: number;
            email: string;
            role: string;
            phone_verified: boolean;
        }
        interface Request {
            user?: User;
        }
    }
}
