const fs = require('fs');
const path = require('path');

const ASSETS_DIR = __dirname;
const FOOD_CSV = path.join(ASSETS_DIR, 'food.csv');
const EXERCISE_CSV = path.join(ASSETS_DIR, 'dataset_60_bai_tap_the_thao.csv');
const THUC_AN_DIR = path.join(ASSETS_DIR, 'thuc_an');
const BAI_TAP_DIR = path.join(ASSETS_DIR, 'bai_tap');
const INDEX_FILE = path.join(ASSETS_DIR, 'index.js');

const parseCSVRow = (str) => {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === '"') {
      if (str[i+1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
};

const csvToJson = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) return [];

  const headers = parseCSVRow(lines[0]);
  const result = [];

  for (let i = 1; i < lines.length; i++) {
    const obj = {};
    const row = parseCSVRow(lines[i]);
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }
    result.push(obj);
  }
  return result;
};

const toImageKey = (str) => {
  if (!str) return 'placeholder';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s_]/g, '')
    .trim()
    .replace(/\s+/g, '_');
};

const generate = () => {
  console.log('Parsing CSVs...');
  const foods = csvToJson(FOOD_CSV);
  const exercises = csvToJson(EXERCISE_CSV);

  fs.writeFileSync(path.join(ASSETS_DIR, 'foods.json'), JSON.stringify(foods, null, 2));
  fs.writeFileSync(path.join(ASSETS_DIR, 'exercises.json'), JSON.stringify(exercises, null, 2));

  console.log(`Generated foods.json (${foods.length} items)`);
  console.log(`Generated exercises.json (${exercises.length} items)`);

  console.log('Scanning image directories...');
  const thucAnFiles = fs.existsSync(THUC_AN_DIR) ? fs.readdirSync(THUC_AN_DIR).filter(f => f.match(/\.(jpg|jpeg|png)$/i)) : [];
  const baiTapFiles = fs.existsSync(BAI_TAP_DIR) ? fs.readdirSync(BAI_TAP_DIR).filter(f => f.match(/\.(jpg|jpeg|png)$/i)) : [];

  let indexContent = `// Tự động sinh bởi generateAssets.js\n\n`;

  indexContent += `export const toImageKey = (str) => {
  if (!str) return 'placeholder';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\\u0300-\\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\\s_]/g, '')
    .trim()
    .replace(/\\s+/g, '_');
};\n\n`;

  indexContent += `export const FOOD_IMAGES = {\n`;
  thucAnFiles.forEach(file => {
    const key = file.replace(/\.[^/.]+$/, ""); // remove extension
    indexContent += `  "${key}": require("./thuc_an/${file}"),\n`;
  });
  indexContent += `};\n\n`;

  indexContent += `export const WORKOUT_IMAGES = {\n`;
  baiTapFiles.forEach(file => {
    const key = file.replace(/\.[^/.]+$/, ""); // remove extension
    indexContent += `  "${key}": require("./bai_tap/${file}"),\n`;
  });
  indexContent += `};\n`;

  fs.writeFileSync(INDEX_FILE, indexContent);
  console.log(`Generated index.js with ${thucAnFiles.length} foods and ${baiTapFiles.length} workouts`);
};

generate();
