const fs = require('fs');
const readline = require('readline');

async function extract() {
  const logPath = 'C:\\Users\\ADMIN\\.gemini\\antigravity-ide\\brain\\51284fe4-6771-4d2c-8ab7-998423c90ac6\\.system_generated\\logs\\transcript.jsonl';
  const fileStream = fs.createReadStream(logPath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lastChunks = null;

  for await (const line of rl) {
    if (line.includes('PTConnectScreen.jsx') && line.includes('multi_replace_file_content')) {
      try {
        const parsed = JSON.parse(line);
        if (parsed.tool_calls) {
          for (const call of parsed.tool_calls) {
            if (call.function.name === 'multi_replace_file_content') {
               const args = JSON.parse(call.function.arguments);
               if (args.TargetFile && args.TargetFile.includes('PTConnectScreen.jsx')) {
                  lastChunks = args.ReplacementChunks;
               }
            }
          }
        }
      } catch (e) {}
    }
  }

  if (lastChunks) {
    fs.writeFileSync('recovered_chunks.json', JSON.stringify(lastChunks, null, 2));
    console.log('Recovered chunks successfully.');
  } else {
    console.log('No chunks found.');
  }
}
extract();
