const { execSync } = require('child_process');

console.log('🚀 Starting Vercel build process...');

try {
  // Generate Prisma client
  console.log('🔧 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Push database schema (this will create tables if they don't exist)
  console.log('📋 Pushing database schema...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  
  console.log('✅ Vercel build process completed successfully!');
} catch (error) {
  console.error('❌ Vercel build process failed:', error);
  process.exit(1);
} 