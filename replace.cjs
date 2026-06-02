const fs = require('fs');
const path = require('path');

const colorMap = {
  '#0a0e27': 'var(--primary-dark)',
  '#0f1340': 'var(--primary)',
  '#1a1f4e': 'var(--primary-light)',
  '#0d1230': 'var(--primary-dark)',
  '#c9a84c': 'var(--accent)',
  '#e8b94a': 'var(--accent-light)',
  '#a8893d': 'var(--accent-dark)',
  '#d4b35a': 'var(--accent)',
  '#f0c55a': 'var(--accent-light)',
  '#a0a4b8': 'var(--text-secondary)',
  '#6b7094': 'var(--text-muted)'
};

const rgbaMap = {
  '10, 14, 39': '244, 247, 246', // primary-dark
  '15, 19, 64': '255, 255, 255', // primary
  '26, 31, 78': '232, 240, 235', // primary-light
  '201, 168, 76': '140, 198, 63', // accent
  '232, 185, 74': '162, 210, 70', // accent-light
  '255, 255, 255': '0, 0, 0' // Invert white to black for overlays, shadows, borders to be visible on white BG.
};

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.css') && file !== 'index.css') {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      // Hex colors
      for (const [hex, variable] of Object.entries(colorMap)) {
        const regex = new RegExp(hex, 'gi');
        if (regex.test(content)) {
          content = content.replace(regex, variable);
          modified = true;
        }
      }
      
      // RGBA replacements
      for (const [oldRgb, newRgb] of Object.entries(rgbaMap)) {
        const regex = new RegExp(`rgba\\(\\s*${oldRgb}\\s*,`, 'g');
        if (regex.test(content)) {
          content = content.replace(regex, `rgba(${newRgb},`);
          modified = true;
        }
      }
      
      // hardcoded whites
      const whiteHexRegex = /#ffffff/gi;
      if (whiteHexRegex.test(content)) {
          content = content.replace(whiteHexRegex, 'var(--text-primary)');
          modified = true;
      }

      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated', fullPath);
      }
    }
  }
}

processDir('/Users/smit/Desktop/div/src');
