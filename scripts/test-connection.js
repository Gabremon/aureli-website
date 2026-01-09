#!/usr/bin/env node

/**
 * Test Database Connection
 * This script tests the connection to help diagnose connection issues
 */

import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

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

async function testConnection() {
  console.log('🧪 Testing database connection...\n');
  console.log('Configuration:');
  console.log(`  Host: ${dbConfig.host}`);
  console.log(`  Port: ${dbConfig.port}`);
  console.log(`  Database: ${dbConfig.database}`);
  console.log(`  User: "${dbConfig.user}"`);
  console.log(`  Password: ${dbConfig.password ? '***' : '(not set)'}\n`);

  // First, try to connect as a superuser or check what users exist
  // We'll try to connect with the default postgres user or see what's available
  console.log('Step 1: Attempting to list all users...');
  console.log('(This might fail if we can\'t authenticate, but it will show us what users exist)\n');

  // Test 1: Try connecting to the postgres database first (always exists)
  console.log('Test 1: Connecting to "postgres" database with your credentials...');
  const escapedUser = encodeURIComponent(dbConfig.user);
  const escapedPassword = encodeURIComponent(dbConfig.password);
  const connectionString1 = `postgresql://${escapedUser}:${escapedPassword}@${dbConfig.host}:${dbConfig.port}/postgres`;
  
  try {
    const client1 = new Client({ connectionString: connectionString1 });
    await client1.connect();
    const result1 = await client1.query('SELECT current_user, version()');
    console.log(`✅ Success! Connected as: ${result1.rows[0].current_user}`);
    console.log(`   PostgreSQL version: ${result1.rows[0].version.split(',')[0]}\n`);
    
    // List ALL users to see what actually exists
    const allUsers = await client1.query("SELECT usename FROM pg_user ORDER BY usename");
    console.log('   All users in database:');
    allUsers.rows.forEach(row => {
      const match = row.usename.toLowerCase() === dbConfig.user.toLowerCase() ? ' ← (case mismatch?)' : '';
      console.log(`     - "${row.usename}"${match}`);
    });
    
    // Check exact match
    const userCheck = await client1.query(
      "SELECT usename FROM pg_user WHERE usename = $1",
      [dbConfig.user]
    );
    
    if (userCheck.rows.length > 0) {
      console.log(`\n✅ User "${dbConfig.user}" exists (exact match)`);
    } else {
      // Check case-insensitive match
      const userCheckCaseInsensitive = await client1.query(
        "SELECT usename FROM pg_user WHERE LOWER(usename) = LOWER($1)",
        [dbConfig.user]
      );
      if (userCheckCaseInsensitive.rows.length > 0) {
        console.log(`\n⚠️  User exists but with different case!`);
        console.log(`   Trying to connect as: "${dbConfig.user}"`);
        console.log(`   Actual username is: "${userCheckCaseInsensitive.rows[0].usename}"`);
        console.log(`\n   💡 Fix: Update your .env file to use: DB_USER="${userCheckCaseInsensitive.rows[0].usename}"`);
      } else {
        console.log(`\n❌ User "${dbConfig.user}" does NOT exist in the database`);
      }
    }
    
    // Check if target database exists
    const dbCheck = await client1.query(
      "SELECT datname FROM pg_database WHERE datname = $1",
      [dbConfig.database]
    );
    
    if (dbCheck.rows.length > 0) {
      console.log(`✅ Database "${dbConfig.database}" exists\n`);
    } else {
      console.log(`❌ Database "${dbConfig.database}" does NOT exist`);
      console.log('   Checking for similar database names...');
      const allDbs = await client1.query("SELECT datname FROM pg_database WHERE datistemplate = false ORDER BY datname");
      console.log('   Existing databases:');
      allDbs.rows.forEach(row => {
        console.log(`     - "${row.datname}"`);
      });
      console.log();
    }
    
    await client1.end();
  } catch (error) {
    console.log(`❌ Failed: ${error.message}`);
    if (error.code) {
      console.log(`   Error code: ${error.code}`);
    }
    console.log('\n💡 Cannot list users because connection failed.');
    console.log('   Try running this command to see actual username in database:');
    console.log('   docker-compose exec postgres psql -U "Aureli-Gabe-User" -d postgres -c "SELECT usename FROM pg_user ORDER BY usename;"');
    console.log();
  }

  // Test 2: Try connecting to the target database
  console.log(`Test 2: Connecting to "${dbConfig.database}" database...`);
  const connectionString2 = `postgresql://${escapedUser}:${escapedPassword}@${dbConfig.host}:${dbConfig.port}/${encodeURIComponent(dbConfig.database)}`;
  
  try {
    const client2 = new Client({ connectionString: connectionString2 });
    await client2.connect();
    const result2 = await client2.query('SELECT current_user, current_database()');
    console.log(`✅ Success! Connected as: ${result2.rows[0].current_user}`);
    console.log(`   Current database: ${result2.rows[0].current_database}\n`);
    await client2.end();
    console.log('✨ All connection tests passed!');
  } catch (error) {
    console.log(`❌ Failed: ${error.message}`);
    if (error.code) {
      console.log(`   Error code: ${error.code}`);
    }
    console.log('\n💡 This is the error that migrations are seeing.');
  }
}

testConnection().catch(console.error);

