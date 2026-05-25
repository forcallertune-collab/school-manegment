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
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
         results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Any remaining gold colors
  content = content.replace(/bg-\[#b98d45\]/gi, 'bg-[#38BDF8]');
  content = content.replace(/border-\[#faf6eb\]\/20/gi, 'border-[#38BDF8]/20');
  content = content.replace(/border-\[#9e7534\]\/20/gi, 'border-[#1E293B]'); 
  content = content.replace(/text-\[#f5eedc\]/gi, 'text-[#FFFFFF]');
  content = content.replace(/focus:border-\[#dfbf85\]/gi, 'focus:border-[#2563EB]');
  content = content.replace(/hover:text-\[#9e7534\]/gi, 'hover:text-[#38BDF8]');
  
  // Navigation active gradients
  content = content.replace(/bg-gradient-to-r from-\[#dfbf85\] to-\[#b98d45\]/gi, 'bg-gradient-to-r from-[#2563EB] to-[#38BDF8] shadow-[0_0_15px_rgba(37,99,235,0.4)]');
  
  // User avatars
  content = content.replace(/bg-gradient-to-br from-\[#dfbf85\] to-\[#9e7534\]/gi, 'bg-gradient-to-br from-[#2563EB] to-[#1E3A8A]');
  
  // Any other slates left like text-slate-850 or text-slate-950
  content = content.replace(/text-slate-850/gi, 'text-white');
  content = content.replace(/text-slate-950/gi, 'text-white');
  content = content.replace(/hover:text-slate-950/gi, 'hover:text-white');

  fs.writeFileSync(file, content, 'utf8');
});
console.log("Secondary replacement done");
