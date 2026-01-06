import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

// Import routes
import authRoutes from './routes/auth';
import triggersRoutes from './routes/triggers';
import executeRoutes from './routes/execute';

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check
app.get('/', (req, res) => {
    res.json({
        message: 'MantleFlow Auto-Trading Backend V2',
        status: 'running',
        version: '2.0.0',
        vault: process.env.VAULT_ADDRESS,
        dex: process.env.DEX_ADDRESS
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/triggers', triggersRoutes);
app.use('/api/execute', executeRoutes);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
    console.log(`
🚀 Backend V2 Server Running
━━━━━━━━━━━━━━━━━━━━━━━━
📍 Port: ${PORT}
🌐 Frontend: ${process.env.FRONTEND_URL}
🔗 Vault: ${process.env.VAULT_ADDRESS}
📊 DEX: ${process.env.DEX_ADDRESS}
━━━━━━━━━━━━━━━━━━━━━━━━
    `);
});
