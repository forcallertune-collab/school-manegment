const fs = require('fs');

const appFile = './src/App.tsx';
let content = fs.readFileSync(appFile, 'utf8');

// Replace any silly hover effect on pure text titles
content = content.replace(/font-sans hover:text-\[#38BDF8\] transition-colors/g, 'font-sans');
content = content.replace(/glow-royal/g, ''); // we removed royal

fs.writeFileSync(appFile, content, 'utf8');
console.log("App.tsx cleaned");
