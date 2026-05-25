const fs = require('fs');
const path = require('path');

const map = {
  '#faf6eb': '#1E293B',
  '#f5eedc': '#1E293B',
  '#ead2a3': '#334155',
  '#dfbf85': '#38BDF8',
  '#cca561': '#38BDF8',
  '#b98d45': '#2563EB',
  '#9e7534': '#2563EB',
  '#815e26': '#94A3B8',
  '#62461a': '#334155',
  '#433010': '#FFFFFF',
  '#291c06': '#94A3B8',
  '#050b1d': '#0B1120',
  '#0d1b3e': '#111827',
  '#070e24': '#0B1120',
  '#f7f5ef': '#0B1120',
  '#1a1a1f': '#FFFFFF',
  '#1a1206': '#FFFFFF'
};

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
         results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Do a massive case-insensitive replace of these specific hexes
  for (const [oldHex, newHex] of Object.entries(map)) {
    const regex = new RegExp(oldHex, 'gi');
    content = content.replace(regex, newHex);
  }

  // Also replace any font families like font-sans or font-display that didn't get updated properly
  // Or leftover things
  content = content.replace(/champagne-gradient/gi, 'bg-[#1E293B]');
  content = content.replace(/royal-gradient/gi, 'bg-[#111827]');
  content = content.replace(/gold-gradient/gi, 'bg-[#2563EB]');
  
  fs.writeFileSync(file, content, 'utf8');
});
console.log("Ultimate replacement done");
