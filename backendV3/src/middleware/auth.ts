import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export function authMiddleware(
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void {
    try {
        // Log request for debugging
        console.log(`🔐 Auth Middleware: ${req.method} ${req.originalUrl}`);
        const authHeader = req.headers.authorization;
        console.log(`   Header: ${authHeader ? 'Present' : 'Missing'} (${authHeader?.substring(0, 15)}...)`);

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'No token provided (Middleware)' });
            return;
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET) as {
            userId: string;
            walletAddress: string;
        };

        req.user = decoded;
        next();
    } catch (error: any) {
        console.error('❌ Auth Middleware Error:', error.message);
        res.status(401).json({ error: 'Invalid JWT Token (Auth Failed)' });
    }
}
