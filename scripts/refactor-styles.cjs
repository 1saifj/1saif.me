const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, '..', 'src');

function findFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            findFiles(filePath, fileList);
        } else {
            if (filePath.endsWith('.tsx') || filePath.endsWith('.css')) {
                fileList.push(filePath);
            }
        }
    }
    return fileList;
}

const files = findFiles(directoryPath);
let changedFilesCount = 0;

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    content = content.replace(/shadow-\[[^\]]+\]/g, 'shadow-sm');
    content = content.replace(/\bshadow-2xl\b/g, 'shadow-sm');
    content = content.replace(/\bshadow-xl\b/g, 'shadow-sm');
    content = content.replace(/\bshadow-lg\b/g, 'shadow-sm');

    content = content.replace(/\bhover:shadow-2xl\b/g, '');
    content = content.replace(/\bhover:shadow-xl\b/g, '');
    content = content.replace(/\bhover:shadow-lg\b/g, '');

    content = content.replace(/\brounded-\[2rem\]\b/g, 'rounded-2xl');
    content = content.replace(/\brounded-\[2\.5rem\]\b/g, 'rounded-2xl');
    content = content.replace(/\brounded-\[3rem\]\b/g, 'rounded-2xl');
    content = content.replace(/\brounded-3xl\b/g, 'rounded-2xl');

    content = content.replace(/\bdark:shadow-none\b/g, '');
    content = content.replace(/\bbackdrop-blur-sm\b/g, '');
    content = content.replace(/\bbackdrop-blur-md\b/g, '');
    content = content.replace(/\bbackdrop-blur-lg\b/g, '');
    content = content.replace(/\bbackdrop-blur-xl\b/g, '');
    content = content.replace(/\bbackdrop-blur\b/g, '');

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        changedFilesCount++;
        console.log(`Updated: ${file}`);
    }
}

console.log(`\nFinished refactoring. ${changedFilesCount} files updated.`);
