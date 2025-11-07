import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Color mappings for dark theme
const colorReplacements = [
  // Background colors
  { from: /bg-white\b/g, to: 'bg-slate-800' },
  { from: /bg-gray-50\b/g, to: 'bg-slate-900' },
  { from: /bg-gray-100\b/g, to: 'bg-slate-800' },
  { from: /bg-gray-200\b/g, to: 'bg-slate-700' },
  
  // Text colors
  { from: /text-gray-900\b/g, to: 'text-white' },
  { from: /text-gray-800\b/g, to: 'text-slate-200' },
  { from: /text-gray-700\b/g, to: 'text-slate-300' },
  { from: /text-gray-600\b/g, to: 'text-slate-400' },
  { from: /text-black\b/g, to: 'text-white' },
  
  // Border colors
  { from: /border-gray-200\b/g, to: 'border-slate-700' },
  { from: /border-gray-300\b/g, to: 'border-slate-600' },
  { from: /border-gray-400\b/g, to: 'border-slate-500' },
  
  // Hover states
  { from: /hover:bg-gray-50\b/g, to: 'hover:bg-slate-700' },
  { from: /hover:bg-gray-100\b/g, to: 'hover:bg-slate-600' },
  { from: /hover:bg-white\b/g, to: 'hover:bg-slate-700' },
];

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    colorReplacements.forEach(({ from, to }) => {
      if (from.test(content)) {
        content = content.replace(from, to);
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${path.relative(process.cwd(), filePath)}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  let updatedCount = 0;
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && file !== 'node_modules' && file !== '.git') {
      updatedCount += processDirectory(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js')) {
      if (processFile(filePath)) {
        updatedCount++;
      }
    }
  });
  
  return updatedCount;
}

// Start processing
const componentsDir = path.join(__dirname, 'src', 'components');
console.log('🎨 Starting dark theme color conversion...\n');
console.log(`📁 Processing directory: ${componentsDir}\n`);

const updatedFiles = processDirectory(componentsDir);

console.log(`\n✨ Done! Updated ${updatedFiles} files.`);
console.log('\n💡 Tip: Review the changes and restart your dev server if needed.');
