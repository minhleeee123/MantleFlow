
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
    console.log("🚀 Creating Test Trigger...");

    // 1. Get First User
    const user = await prisma.user.findFirst();
    if (!user) {
        console.error("❌ No user found");
        process.exit(1);
    }
    console.log(`👤 User Found: ${user.walletAddress} (ID: ${user.id})`);

    // 2. Create Trigger Payload
    // User Request: $50 MNT condition > 0.5
    const payload = {
        userId: user.id, // Fixed: use .id
        symbol: 'MNT',
        targetPrice: 0.5,
        condition: 'ABOVE',
        type: 'SELL',
        amount: 50 // 50 MNT
    };

    console.log(`📝 Payload:`, payload);

    try {
        // Fixed: Use prisma.trigger, not prisma.tradeTrigger
        const trigger = await prisma.trigger.create({
            data: {
                userId: user.id,
                symbol: payload.symbol,
                targetPrice: payload.targetPrice,
                condition: payload.condition,
                type: payload.type,
                amount: payload.amount,
                status: 'ACTIVE'
            }
        });
        console.log("✅ Trigger Created Successfully via DB:", trigger);
    } catch (e) {
        console.error("❌ Trigger Creation Failed:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
