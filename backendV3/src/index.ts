import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import swapRoutes from './routes/swap.js';
import triggerRoutes from './routes/triggers.js';
import transactionRoutes from './routes/transactions.js';
import { startAutoExecutor } from './services/autoExecutor.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        version: '3.0.0',
        timestamp: new Date().toISOString()
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/swap', swapRoutes);
app.use('/api/triggers', triggerRoutes);
app.use('/api/transactions', transactionRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║              🚀 BACKEND V3 SERVER STARTED                  ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`📍 Server running on port ${PORT}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/health`);
    console.log(`🔗 API Endpoints:`);
    console.log(`   - POST /api/auth/login`);
    console.log(`   - POST /api/swap/bot (NEW)`);
    console.log(`   - GET  /api/swap/bot-status (NEW)`);
    console.log(`   - GET  /api/swap/estimate`);
    console.log(`   - GET  /api/swap/balances`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Start auto-executor
    startAutoExecutor();
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n\n🛑 Shutting down gracefully...');
    process.exit(0);
});
