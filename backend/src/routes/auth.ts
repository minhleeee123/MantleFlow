import { Router } from 'express';
import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { LoginRequest } from '../types';

const router = Router();
const prisma = new PrismaClient();

router.post('/login', async (req, res) => {
    try {
        const { walletAddress, signature, message }: LoginRequest = req.body;

        // Validate input
        if (!walletAddress || !signature || !message) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Verify signature
        const recoveredAddress = ethers.verifyMessage(message, signature);

        if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
            return res.status(401).json({ error: 'Invalid signature' });
        }

        // Find or create user
        let user = await prisma.user.findUnique({
            where: { walletAddress: walletAddress.toLowerCase() }
        });

        if (!user) {
            user = await prisma.user.create({
                data: { walletAddress: walletAddress.toLowerCase() }
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, walletAddress: user.walletAddress },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                walletAddress: user.walletAddress,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

router.post('/verify', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);

        res.json({ valid: true, user: decoded });
    } catch (error) {
        res.status(401).json({ valid: false, error: 'Invalid token' });
    }
});

export default router;
