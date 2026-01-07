import dotenv from 'dotenv';
dotenv.config();

console.log('\n🔍 Checking Backend V3 Environment...\n');

// Check required variables
const required = {
    'NODE_ENV': process.env.NODE_ENV,
    'PORT': process.env.PORT,
    'DATABASE_URL': process.env.DATABASE_URL,
    'JWT_SECRET': process.env.JWT_SECRET,
    'MANTLE_RPC_URL': process.env.MANTLE_RPC_URL,
    'VAULT_ADDRESS': process.env.VAULT_ADDRESS,
    'DEX_ADDRESS': process.env.DEX_ADDRESS,
    'USDT_ADDRESS': process.env.USDT_ADDRESS,
    'BOT_PRIVATE_KEY': process.env.BOT_PRIVATE_KEY
};

let allGood = true;

for (const [key, value] of Object.entries(required)) {
    const status = value && !value.includes('REPLACE') ? '✅' : '❌';

    if (status === '❌') {
        allGood = false;
    }

    if (key === 'BOT_PRIVATE_KEY') {
        if (value && !value.includes('REPLACE')) {
            console.log(`${status} ${key}: 0x${value.substring(2, 10)}...${value.substring(value.length - 6)} (${value.length} chars)`);
        } else {
            console.log(`${status} ${key}: NOT SET OR PLACEHOLDER`);
        }
    } else {
        const display = value ? (value.length > 50 ? value.substring(0, 47) + '...' : value) : 'NOT SET';
        console.log(`${status} ${key}: ${display}`);
    }
}

console.log();

if (allGood) {
    console.log('✅ All environment variables configured correctly!\n');
    console.log('🚀 Ready to start server with: npm run dev\n');
} else {
    console.log('❌ Some environment variables missing or invalid!\n');
    console.log('📝 Please check .env file and set:');
    console.log('   - BOT_PRIVATE_KEY (must be valid 0x... key)');
    console.log('   - Other required variables\n');
}
