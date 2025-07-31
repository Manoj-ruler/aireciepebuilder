#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 Cleaning development cache...');

// Remove .next directory
const nextDir = path.join(process.cwd(), '.next');
if (fs.existsSync(nextDir)) {
  fs.rmSync(nextDir, { recursive: true, force: true });
  console.log('✅ Removed .next directory');
}

// Remove node_modules/.cache if it exists
const cacheDir = path.join(process.cwd(), 'node_modules', '.cache');
if (fs.existsSync(cacheDir)) {
  fs.rmSync(cacheDir, { recursive: true, force: true });
  console.log('✅ Removed node_modules/.cache');
}

// Remove tsconfig.tsbuildinfo if it exists
const tsBuildInfo = path.join(process.cwd(), 'tsconfig.tsbuildinfo');
if (fs.existsSync(tsBuildInfo)) {
  fs.rmSync(tsBuildInfo);
  console.log('✅ Removed tsconfig.tsbuildinfo');
}

console.log('🎉 Clean complete! You can now run npm run dev');