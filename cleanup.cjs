const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css') || file.endsWith('.html')) {
         results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Fix my bad regex for font-display
  content = content.replace(/font-sans hover:text-\[#38BDF8\] transition-colors/g, 'font-sans');
  content = content.replace(/font-sans font-medium hover:text-white transition-colors/g, 'font-sans');
  
  // Custom theme overrides
  // "Royal Gradient" to SaaS gradient
  content = content.replace(/bg-gradient-to-br from-\[#1E293B\] to-\[#1E293B\]/g, 'bg-[#273549]'); // Fix messy gradients

  // Remove italic fonts since they are not SaaS
  content = content.replace(/italic/g, ''); 

  // Clean some text colors that are unreadable
  content = content.replace(/text-\[#8c6225\]/g, 'text-amber-500');
  content = content.replace(/bg-amber-400/g, 'bg-amber-500');

  // Any remaining #0a1128 to #111827
  content = content.replace(/bg-\[#0a1128\]/g, 'bg-[#111827]');

  fs.writeFileSync(file, content, 'utf8');
});
console.log("Cleanup done");
