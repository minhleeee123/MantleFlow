
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
const prisma = new PrismaClient();

async function main() {
    const txs = await prisma.transaction.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            type: true,
            amountIn: true,
            txHash: true,
            createdAt: true
        }
    });

    fs.writeFileSync('debug_output.json', JSON.stringify(txs, null, 2));
    console.log('Written to debug_output.json');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
