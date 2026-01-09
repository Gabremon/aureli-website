#!/usr/bin/env node

/**
 * This script helps identify and fix username issues
 * It tries common variations of the username to find what actually works
 */

import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'aureli_db',
  user: process.env.DB_USER || 'aureli_user',
  password: process.env.DB_PASSWORD || 'aureli_password',
};

async function checkUsersViaDocker() {
  console.log('🔍 Checking actual username in database via Docker...\n');
  
  try {
    const { stdout, stderr } = await execAsync(
      'docker-compose exec -T postgres psql -U "Aureli-Gabe-User" -d postgres -c "SELECT usename FROM pg_user ORDER BY usename;"'
    );
    
    console.log('Users in database:');
    console.log(stdout);
    
    if (stderr && !stderr.includes('WARNING')) {
      console.error('Error:', stderr);
    }
    
    // Also check what password was used to create the database
    console.log('\n📝 Note: When connecting from inside Docker (docker-compose exec),');
    console.log('   PostgreSQL may use trust/peer authentication (no password needed).');
    console.log('   But external TCP/IP connections require password authentication.');
    console.log('   The password in your .env file MUST match what was set when creating the database.\n');
  } catch (error) {
    console.error('Could not query via Docker:', error.message);
    console.log('\n💡 Try manually: docker-compose exec postgres psql -U "Aureli-Gabe-User" -d postgres -c "SELECT usename FROM pg_user;"');
  }
}

async function tryUsernameVariations() {
  const variations = [
    'Aureli-Gabe-User',  // Original with capitals
    'aureli-gabe-user',  // All lowercase
    '"Aureli-Gabe-User"', // Quoted (but this won't work in connection string)
  ];
  
  console.log('\n🧪 Trying different username variations...\n');
  console.log(`Testing with password: ${dbConfig.password ? '***' : '(not set)'}\n`);
  
  const escapedPassword = encodeURIComponent(dbConfig.password);
  
  for (const username of variations) {
    // Remove quotes if present for encoding (quotes are SQL, not connection string)
    const userToEncode = username.replace(/^"|"$/g, '');
    const escapedUser = encodeURIComponent(userToEncode);
    const connectionString = `postgresql://${escapedUser}:${escapedPassword}@${dbConfig.host}:${dbConfig.port}/postgres`;
    
    console.log(`Testing: "${userToEncode}"`);
    console.log(`  Connection string: postgresql://${escapedUser}:***@${dbConfig.host}:${dbConfig.port}/postgres`);
    
    try {
      const client = new Client({ connectionString });
      await client.connect();
      const result = await client.query('SELECT current_user');
      console.log(`✅ SUCCESS! Connected as: ${result.rows[0].current_user}\n`);
      await client.end();
      return userToEncode; // Return without quotes
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
      if (error.code) {
        console.log(`   Error code: ${error.code}`);
      }
      console.log();
    }
  }
  
  return null;
}

async function main() {
  console.log('Current configuration:');
  console.log(`  User in .env: "${dbConfig.user}"`);
  console.log(`  Password: ${dbConfig.password ? '***' : '(not set)'}`);
  console.log(`  Database: ${dbConfig.database}`);
  console.log(`  Host: ${dbConfig.host}:${dbConfig.port}\n`);
  
  await checkUsersViaDocker();
  
  const workingUsername = await tryUsernameVariations();
  
  if (workingUsername) {
    console.log('\n✨ Found working username!');
    console.log(`\n💡 Update your .env file to use:`);
    console.log(`   DB_USER=${workingUsername}`);
    console.log(`\n   Then run migrations again: npm run migrate`);
  } else {
    console.log('\n❌ None of the username variations worked.');
    console.log('\n💡 Troubleshooting steps:');
    console.log('   1. Verify password is correct:');
    console.log('      - Check your .env file has DB_PASSWORD set correctly');
    console.log('      - The password must match what was set when the database was created');
    console.log('   2. Check database connection:');
    console.log('      docker-compose ps (should show postgres running)');
    console.log('   3. Test password manually:');
    console.log(`      docker-compose exec postgres psql -U "Aureli-Gabe-User" -d postgres`);
    console.log('      (Enter the password when prompted)');
    console.log('   4. If password is wrong, recreate database:');
    console.log('      docker-compose down -v');
    console.log('      # Update .env with correct password');
    console.log('      docker-compose up -d');
    console.log('\n   Most likely issue: Password mismatch between .env and database');
  }
}

main().catch(console.error);

