#!/usr/bin/env node
/**
 * Quick setup verification script
 * Run this to check if environment files and dependencies are set up correctly
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 WorkTrack Pro Setup Verification\n');

let errors = [];
let warnings = [];

// Check environment files
console.log('📋 Checking environment files...');
const rootEnv = path.join(__dirname, '.env');
const serverEnv = path.join(__dirname, 'server', '.env.local');

if (!fs.existsSync(rootEnv)) {
  warnings.push('⚠️  Root .env file not found. Copy env.sample to .env and fill in values.');
} else {
  console.log('✅ Root .env exists');
}

if (!fs.existsSync(serverEnv)) {
  warnings.push('⚠️  server/.env.local not found. Copy server/env.sample to server/.env.local and fill in values.');
} else {
  console.log('✅ server/.env.local exists');
}

// Check package.json files
console.log('\n📦 Checking package.json files...');
const rootPkg = path.join(__dirname, 'package.json');
const serverPkg = path.join(__dirname, 'server', 'package.json');

if (!fs.existsSync(rootPkg)) {
  errors.push('❌ Root package.json not found!');
} else {
  console.log('✅ Root package.json exists');
}

if (!fs.existsSync(serverPkg)) {
  errors.push('❌ server/package.json not found!');
} else {
  console.log('✅ server/package.json exists');
}

// Check node_modules
console.log('\n📚 Checking dependencies...');
const rootNodeModules = path.join(__dirname, 'node_modules');
const serverNodeModules = path.join(__dirname, 'server', 'node_modules');

if (!fs.existsSync(rootNodeModules)) {
  warnings.push('⚠️  Root node_modules not found. Run: npm install');
} else {
  console.log('✅ Root node_modules exists');
}

if (!fs.existsSync(serverNodeModules)) {
  warnings.push('⚠️  server/node_modules not found. Run: cd server && npm install');
} else {
  console.log('✅ server/node_modules exists');
}

// Check key files
console.log('\n📄 Checking key files...');
const apiClient = path.join(__dirname, 'src', 'lib', 'api-client.ts');
const nextConfig = path.join(__dirname, 'server', 'next.config.js');

if (!fs.existsSync(apiClient)) {
  errors.push('❌ src/lib/api-client.ts not found!');
} else {
  console.log('✅ API client exists');
}

if (!fs.existsSync(nextConfig)) {
  warnings.push('⚠️  server/next.config.js not found (CORS may not work)');
} else {
  console.log('✅ Next.js config exists');
}

// Summary
console.log('\n' + '='.repeat(50));
if (errors.length > 0) {
  console.log('\n❌ ERRORS FOUND:');
  errors.forEach(e => console.log('  ' + e));
  process.exit(1);
}

if (warnings.length > 0) {
  console.log('\n⚠️  WARNINGS:');
  warnings.forEach(w => console.log('  ' + w));
  console.log('\n💡 These are not critical but should be addressed before deployment.');
} else {
  console.log('\n✅ All checks passed!');
}

console.log('\n📖 Next steps:');
console.log('  1. Fill in environment variables in .env and server/.env.local');
console.log('  2. Install dependencies: npm install && cd server && npm install');
console.log('  3. Run migrations: cd server && npm run migrate:run');
console.log('  4. Test locally: npm run dev:all');
console.log('  5. Review DEPLOYMENT_CHECKLIST.md for deployment steps\n');


