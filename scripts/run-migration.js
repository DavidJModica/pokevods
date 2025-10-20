require('dotenv').config({ path: '.env.local' });
const { execSync } = require('child_process');

console.log('Running Prisma migration on production database...');
console.log('Database URL:', process.env.DATABASE_URL ? 'Set ✅' : 'NOT SET ❌');

try {
  // Run the migration
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: { ...process.env }
  });

  console.log('\n✅ Migration completed successfully!');
} catch (error) {
  console.error('\n❌ Migration failed:', error.message);
  process.exit(1);
}
