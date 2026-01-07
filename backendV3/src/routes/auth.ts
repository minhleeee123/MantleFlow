import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * POST /api/auth/login
 * Wallet-based authentication
 */
router.post('/login', async (req, res) => {
    try {
        const { walletAddress, message, signature } = req.body;

        if (!walletAddress || !message || !signature) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        // Verify signature
        const recoveredAddress = ethers.verifyMessage(message, signature);

        if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
            res.status(401).json({ error: 'Invalid signature' });
            return;
        }

        // Find or create user
        let user = await prisma.user.findUnique({
            where: { walletAddress: walletAddress.toLowerCase() }
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    walletAddress: walletAddress.toLowerCase()
                }
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user.id,
                walletAddress: user.walletAddress
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                walletAddress: user.walletAddress,
                email: user.email,
                createdAt: user.createdAt
            }
        });

    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
});

/**
 * POST /api/auth/verify
 * Verify JWT token
 */
router.post('/verify', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            res.status(400).json({ error: 'Token required' });
            return;
        }

        const decoded = jwt.verify(token, JWT_SECRET) as {
            userId: string;
            walletAddress: string;
        };

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId }
        });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.json({
            valid: true,
            user: {
                id: user.id,
                walletAddress: user.walletAddress,
                email: user.email,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        res.status(401).json({
            valid: false,
            error: 'Invalid or expired token'
        });
    }
});

/**
 * PATCH /api/auth/profile
 * Update user profile (email)
 */
router.patch('/profile', async (req: any, res) => {
    try {
        // Extract token manually since we don't have middleware here yet or we can use generic one
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({ error: 'No token provided' });
            return;
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

        const { email } = req.body;

        const updatedUser = await prisma.user.update({
            where: { id: decoded.userId },
            data: { email }
        });

        res.json({
            success: true,
            user: {
                id: updatedUser.id,
                walletAddress: updatedUser.walletAddress,
                email: updatedUser.email
            }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(401).json({ error: 'Unauthorized or failed to update' });
    }
});

export default router;
