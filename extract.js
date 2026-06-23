const fs = require('fs');
const readline = require('readline');

async function extract() {
  const logPath = 'C:\\Users\\ADMIN\\.gemini\\antigravity-ide\\brain\\51284fe4-6771-4d2c-8ab7-998423c90ac6\\.system_generated\\logs\\transcript.jsonl';
  const fileStream = fs.createReadStream(logPath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (line.includes('PTConnectScreen.jsx')) {
      const parsed = JSON.parse(line);
      // We are looking for a SYSTEM action with 'view_file' or 'multi_replace_file_content'
      if (parsed.source === 'SYSTEM' && parsed.content && parsed.content.includes('File Path: `file:///c:/Users/ADMIN/Downloads/App-PT-Manager/src/features/content/screens/PTConnectScreen.jsx`')) {
         // The content has the line numbers. We can regex extract them.
         fs.appendFileSync('extracted.txt', parsed.content + '\n\n---\n\n');
      }
    }
  }
}
extract();
