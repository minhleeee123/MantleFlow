const fs = require('fs');
try {
    const content = fs.readFileSync('manual_test.log', 'utf8');
    if (content.includes('Not authorized')) {
        console.log('✅ CONFIRMED: Error contains "Not authorized"');
    } else {
        console.log('❌ "Not authorized" NOT found. Printing log snippet:');
        console.log('--- START ---');
        console.log(content.slice(0, 500));
        console.log('--- END ---');
        console.log(content.slice(-500));
    }
} catch (e) {
    console.error('Failed to read log:', e.message);
}
