const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Look for react-native import block
      const rnImportRegex = /import\s+{[^}]*}\s+from\s+['"]react-native['"]/g;
      let match;
      let hasChanges = false;
      
      content = content.replace(rnImportRegex, (fullMatch) => {
        if (fullMatch.includes('SafeAreaView')) {
          hasChanges = true;
          // Extract the items inside {}
          const innerMatch = fullMatch.match(/{([^}]*)}/);
          if (innerMatch) {
             const items = innerMatch[1].split(',').map(i => i.trim()).filter(i => i !== 'SafeAreaView' && i !== '');
             if (items.length === 0) {
                return '';
             }
             if (fullMatch.includes('\n')) {
                 return `import {\n  ${items.join(',\n  ')}\n} from 'react-native'`;
             } else {
                 return `import { ${items.join(', ')} } from 'react-native'`;
             }
          }
        }
        return fullMatch;
      });

      if (hasChanges) {
        // Find last import
        const importLines = content.split('\n').filter(l => l.startsWith('import '));
        if (importLines.length > 0) {
            const lastImportLine = importLines[importLines.length - 1];
            content = content.replace(lastImportLine, lastImportLine + "\nimport { SafeAreaView } from 'react-native-safe-area-context';");
        }
        
        fs.writeFileSync(fullPath, content);
        console.log('Fixed ' + fullPath);
      }
    }
  }
}

processDir('src');
console.log('Done');
