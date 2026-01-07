
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        const user = await prisma.user.findFirst({ orderBy: { createdAt: 'desc' } });
        if (user) {
            console.log('LATEST_USER:', user.walletAddress);
        } else {
            console.log('NO_USERS_FOUND');
        }
    } catch (e) {
        console.error('ERROR:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
