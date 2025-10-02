#!/usr/bin/env node

/**
 * Script to verify all blog featured images exist
 * Usage: node scripts/verify-blog-images.cjs
 */

const fs = require('fs');
const path = require('path');

const contentDir = path.join(__dirname, '../content/articles');
const publicDir = path.join(__dirname, '../public');

// Get all markdown files
const markdownFiles = fs.readdirSync(contentDir).filter(file => file.endsWith('.md'));

console.log('🔍 Verifying blog featured images...\n');

let totalChecked = 0;
let missingImages = [];
let validImages = [];

for (const file of markdownFiles) {
  const filePath = path.join(contentDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Extract frontmatter
  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) continue;
  
  const frontmatter = frontmatterMatch[1];
  const featuredImageMatch = frontmatter.match(/featuredImage:\s*"([^"]+)"/);
  
  if (featuredImageMatch) {
    const imagePath = featuredImageMatch[1];
    const fullImagePath = path.join(publicDir, imagePath);
    
    totalChecked++;
    
    if (fs.existsSync(fullImagePath)) {
      validImages.push({ file, imagePath });
      console.log(`✅ ${file}: ${imagePath}`);
    } else {
      missingImages.push({ file, imagePath });
      console.log(`❌ ${file}: ${imagePath} (MISSING)`);
    }
  }
}

console.log(`\n📊 Summary:`);
console.log(`Total articles checked: ${totalChecked}`);
console.log(`Valid images: ${validImages.length}`);
console.log(`Missing images: ${missingImages.length}`);

if (missingImages.length > 0) {
  console.log('\n🚨 Missing images that need to be fixed:');
  missingImages.forEach(({ file, imagePath }) => {
    console.log(`   ${file} -> ${imagePath}`);
  });
  process.exit(1);
} else {
  console.log('\n🎉 All blog images are valid!');
  process.exit(0);
}