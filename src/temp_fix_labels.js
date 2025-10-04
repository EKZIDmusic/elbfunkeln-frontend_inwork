// Temporary script to fix labels
// This would replace all instances of className="block text-sm font-medium mb-2"
// with className="block text-sm font-medium text-elbfunkeln-green mb-2"

const fs = require('fs');
const path = '/pages/CheckoutPage.tsx';

// Read file
let content = fs.readFileSync(path, 'utf8');

// Replace all instances
content = content.replace(/className="block text-sm font-medium mb-2"/g, 'className="block text-sm font-medium text-elbfunkeln-green mb-2"');

// Write back
fs.writeFileSync(path, content);