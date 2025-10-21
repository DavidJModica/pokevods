#!/usr/bin/env node
/**
 * Helper script to generate bcrypt password hashes for admin authentication
 * Usage: node scripts/generate-password-hash.js YOUR_PASSWORD
 */

const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = process.argv[2];

  if (!password) {
    console.error('\n❌ Error: Please provide a password as an argument');
    console.log('\nUsage:');
    console.log('  node scripts/generate-password-hash.js YOUR_PASSWORD\n');
    console.log('Example:');
    console.log('  node scripts/generate-password-hash.js MySecurePassword123\n');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('\n❌ Error: Password must be at least 8 characters long\n');
    process.exit(1);
  }

  console.log('\n🔐 Generating bcrypt hash...\n');

  const hash = await bcrypt.hash(password, 10);

  console.log('✅ Hash generated successfully!\n');
  console.log('Add this line to your .env file:\n');
  console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);
  console.log('⚠️  Make sure to keep this hash secret and never commit it to git!\n');
}

generateHash().catch(error => {
  console.error('Error generating hash:', error);
  process.exit(1);
});
