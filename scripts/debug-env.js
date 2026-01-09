#!/usr/bin/env node

/**
 * Debug script to see what values are actually being read from .env
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = join(__dirname, '..', '.env');

console.log('🔍 Debugging .env file...\n');

console.log('1. Checking if .env file exists:');
console.log(`   Path: ${envPath}`);
console.log(`   Exists: ${fs.existsSync(envPath) ? 'YES ✅' : 'NO ❌'}\n`);

if (fs.existsSync(envPath)) {
  console.log('2. Reading .env file content:');
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));
    lines.forEach(line => {
      if (line.includes('DB_')) {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=');
        if (key.includes('PASSWORD')) {
          console.log(`   ${key.trim()}=${value ? '***' : '(empty)'}`);
        } else {
          console.log(`   ${key.trim()}=${value || '(empty)'}`);
        }
      }
    });
  } catch (error) {
    console.log(`   ❌ Error reading file: ${error.message}`);
  }
} else {
  console.log('   ❌ .env file not found!');
  console.log('   💡 Create it by copying env.template:');
  console.log('      cp env.template .env');
}

console.log('\n3. Values after loading with dotenv:');
dotenv.config({ path: envPath });

const dbConfig = {
  host: process.env.DB_HOST || '(not set, using default: localhost)',
  port: process.env.DB_PORT || '(not set, using default: 5432)',
  database: process.env.DB_NAME || '(not set, using default: aureli_db)',
  user: process.env.DB_USER || '(not set, using default: aureli_user)',
  password: process.env.DB_PASSWORD || '(not set)',
};

console.log(`   DB_HOST: ${dbConfig.host}`);
console.log(`   DB_PORT: ${dbConfig.port}`);
console.log(`   DB_NAME: ${dbConfig.database}`);
console.log(`   DB_USER: ${dbConfig.user}`);
console.log(`   DB_PASSWORD: ${dbConfig.password === '(not set)' ? '(not set)' : `"${dbConfig.password}" (length: ${dbConfig.password.length})`}`);

// Check if password matches Docker
console.log('\n4. Password verification:');
if (process.env.DB_PASSWORD) {
  console.log(`   .env DB_PASSWORD value: "${process.env.DB_PASSWORD}"`);
  console.log(`   Password length: ${process.env.DB_PASSWORD.length} characters`);
  console.log(`   Expected (from Docker): "aureli_password" (length: 17)`);
  if (process.env.DB_PASSWORD === 'aureli_password') {
    console.log('   ✅ Password matches Docker!');
  } else {
    console.log('   ❌ Password does NOT match Docker!');
    console.log('   💡 Update .env DB_PASSWORD to match Docker');
  }
} else {
  console.log('   ❌ DB_PASSWORD is not set in .env file!');
}

console.log('\n4. Compare with Docker environment:');
console.log('   Run: docker-compose exec postgres printenv POSTGRES_USER POSTGRES_PASSWORD POSTGRES_DB');
console.log('   These should match the values above!\n');

