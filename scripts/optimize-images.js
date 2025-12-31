// Image optimization script
// Run with: node scripts/optimize-images.js

const fs = require('fs');
const path = require('path');

console.log('🖼️  Image Optimization Guide');
console.log('================================\n');

console.log('To optimize your images, follow these steps:\n');

console.log('1. Install sharp (image processing library):');
console.log('   npm install sharp\n');

console.log('2. Convert PNG to WebP:');
console.log('   const sharp = require("sharp");');
console.log('   sharp("input.png").webp({ quality: 80 }).toFile("output.webp");\n');

console.log('3. Or use online tools:');
console.log('   - https://squoosh.app/ (Google)');
console.log('   - https://tinypng.com/');
console.log('   - https://imageoptim.com/\n');

console.log('4. Recommended formats:');
console.log('   - WebP: Best compression, wide support');
console.log('   - AVIF: Better compression, growing support');
console.log('   - PNG: For images with transparency (fallback)\n');

console.log('5. Image size guidelines:');
console.log('   - Hero images: < 200KB');
console.log('   - Thumbnails: < 50KB');
console.log('   - Icons: < 10KB\n');

// List current images
const publicDir = path.join(__dirname, '../public');
if (fs.existsSync(publicDir)) {
  console.log('📁 Current images in /public:');
  const files = fs.readdirSync(publicDir);
  const images = files.filter(f => /\.(png|jpg|jpeg|gif|svg)$/i.test(f));
  
  images.forEach(img => {
    const stats = fs.statSync(path.join(publicDir, img));
    const sizeKB = (stats.size / 1024).toFixed(2);
    const status = stats.size > 200000 ? '⚠️' : '✅';
    console.log(`   ${status} ${img} (${sizeKB} KB)`);
  });
}

console.log('\n✨ Run this script after optimizing images to verify sizes.');
