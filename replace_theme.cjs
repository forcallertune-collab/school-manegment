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
 
  // Backgrounds
  content = content.replace(/bg-white/g, 'bg-[#1E293B]'); // cards
  content = content.replace(/bg-slate-50\/50/g, 'bg-[#111827]'); 
  content = content.replace(/bg-slate-50/g, 'bg-[#111827]');
  content = content.replace(/bg-slate-100/g, 'bg-[#273549]'); // headers / secondary
  content = content.replace(/bg-slate-200/g, 'bg-[#334155]');
  
  // Custom gold bg -> slate
  content = content.replace(/bg-\[#f7f5ef\]/gi, 'bg-[#0B1120]');
  content = content.replace(/bg-\[#050b1d\]/gi, 'bg-[#0B1120]');
  content = content.replace(/bg-\[#faf6eb\]/gi, 'bg-[#1E293B]');
  content = content.replace(/bg-\[#ead2a3\]/gi, 'bg-[#334155]');
  
  // Borders
  content = content.replace(/border-slate-100/g, 'border-[#334155]');
  content = content.replace(/border-slate-200/g, 'border-[#334155]');
  content = content.replace(/border-slate-150/g, 'border-[#334155]');
  content = content.replace(/border-\[#9e7534\]/gi, 'border-[#334155]');
  content = content.replace(/border-\[#ead2a3\]/gi, 'border-[#334155]');
  content = content.replace(/divide-slate-50/g, 'divide-[#334155]');
  content = content.replace(/divide-slate-100/g, 'divide-[#334155]');
  content = content.replace(/divide-slate-200/g, 'divide-[#334155]');

  // Texts
  content = content.replace(/text-slate-900/g, 'text-white');
  content = content.replace(/text-slate-800/g, 'text-white');
  content = content.replace(/text-slate-700/g, 'text-[#CBD5E1]');
  content = content.replace(/text-slate-600/g, 'text-[#CBD5E1]');
  content = content.replace(/text-slate-500/g, 'text-[#94A3B8]');
  content = content.replace(/text-slate-400/g, 'text-[#94A3B8]');
  
  // Replace arbitrary gold text
  content = content.replace(/text-\[#dfbf85\]/gi, 'text-[#38BDF8]');
  content = content.replace(/text-\[#faf6eb\]/gi, 'text-white');
  content = content.replace(/text-\[#ead2a3\]/gi, 'text-[#38BDF8]');
  content = content.replace(/text-\[#815e26\]/gi, 'text-white');
  content = content.replace(/text-\[#1a1206\]/gi, 'text-white');
  
  // Indigo / Primary actions (Gold -> Blue)
  content = content.replace(/hover:text-indigo-600/g, 'hover:text-[#38BDF8] hover:drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]');
  content = content.replace(/text-indigo-600/g, 'text-[#2563EB]');
  content = content.replace(/bg-indigo-600/g, 'bg-[#2563EB] shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] hover:bg-[#38BDF8]');
  content = content.replace(/text-indigo-700/g, 'text-[#38BDF8]');
  content = content.replace(/bg-indigo-50/g, 'bg-[#2563EB]/10 border border-[#2563EB]/30');
  content = content.replace(/bg-indigo-100/g, 'bg-[#2563EB]/20');
  content = content.replace(/text-indigo-900/g, 'text-white');

  // Emerald / Success
  content = content.replace(/bg-emerald-50/g, 'bg-[#10B981]/10 border border-[#10B981]/30');
  content = content.replace(/text-emerald-800/g, 'text-[#10B981]');
  content = content.replace(/text-emerald-700/g, 'text-[#10B981]');
  content = content.replace(/text-emerald-600/g, 'text-[#10B981]');
  content = content.replace(/bg-emerald-100/g, 'bg-[#10B981]/20');

  // Amber / Warning
  content = content.replace(/bg-amber-50/g, 'bg-[#F59E0B]/10 border border-[#F59E0B]/30');
  content = content.replace(/text-amber-800/g, 'text-[#F59E0B]');
  content = content.replace(/text-amber-700/g, 'text-[#F59E0B]');
  content = content.replace(/text-amber-600/g, 'text-[#F59E0B]');
  content = content.replace(/bg-amber-100/g, 'bg-[#F59E0B]/20');

  // Rose / Danger
  content = content.replace(/bg-rose-50/g, 'bg-[#EF4444]/10 border border-[#EF4444]/30');
  content = content.replace(/text-rose-800/g, 'text-[#EF4444]');
  content = content.replace(/text-rose-600/g, 'text-[#EF4444]');

  // Custom font replacing (removing font-display which was old)
  content = content.replace(/font-display/g, 'font-sans hover:text-[#38BDF8] transition-colors');
  content = content.replace(/shadow-xs/g, 'shadow-lg shadow-black/20');
  content = content.replace(/shadow-sm/g, 'shadow-xl shadow-black/40');
  
  fs.writeFileSync(file, content, 'utf8');
});

console.log("Replaced colors successfully");
