#!/usr/bin/env node

/**
 * Generate bcrypt hash for a password
 * Usage: node scripts/generate-bcrypt-hash.js <password>
 */

import bcrypt from 'bcryptjs';

async function generateHash(password = 'test') {
  try {
    const hash = await bcrypt.hash(password, 10);
    console.log(`Password: ${password}`);
    console.log(`Bcrypt hash: ${hash}`);
    console.log('\nUse this hash in your migration file.');
  } catch (error) {
    console.error('Error generating hash:', error.message);
    process.exit(1);
  }
}

const password = process.argv[2] || 'test';
generateHash(password);

