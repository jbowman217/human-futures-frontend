import fs from 'fs';
import path from 'path';

const projectRoot = path.resolve(__dirname, '..');
const destDir = path.join(projectRoot, 'public', 'materials');

if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

const validPattern = /^[a-z\-]+-task\d+-\d+\.(png|svg|jpg|jpeg|webp|md)$/;

const walk = (dir: string) => {
  fs.readdirSync(dir).forEach((entry) => {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath);
    } else if (stat.isFile() && validPattern.test(entry)) {
      const destPath = path.join(destDir, entry);
      fs.copyFileSync(fullPath, destPath);
      console.log(`✅ Copied: ${entry}`);
    }
  });
};

walk(projectRoot);
console.log(`🎯 All valid task materials moved to /public/materials`);
