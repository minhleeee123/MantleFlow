const fs = require('fs');

try {
    const content = fs.readFileSync('deployment.json', 'utf8');
    const json = JSON.parse(content);
    console.log("CONTRACT_ADDRESS=" + json.contract);
} catch (e) {
    console.error("Error reading file:", e.message);
}
