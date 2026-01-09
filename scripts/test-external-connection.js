#!/usr/bin/env node

/**
 * Test connection from outside Docker (same as migration script)
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
  console.log('🧪 Testing connection from OUTSIDE Docker (same as migration script)...\n');
  console.log('Configuration:');
  console.log(`  Host: ${dbConfig.host}:${dbConfig.port}`);
  console.log(`  Database: ${dbConfig.database}`);
  console.log(`  User: ${dbConfig.user}`);
  console.log(`  Password: ${dbConfig.password ? `"${dbConfig.password}"` : '(not set)'}\n`);
  
  console.log('⚠️  IMPORTANT: If this fails with "role does not exist",');
  console.log('   you might have a local PostgreSQL running on port 5432');
  console.log('   that is intercepting connections before they reach Docker.\n');

  // Try with connection string (same as migration script)
  const escapedUser = encodeURIComponent(dbConfig.user);
  const escapedPassword = encodeURIComponent(dbConfig.password);
  const connectionString = `postgresql://${escapedUser}:${escapedPassword}@${dbConfig.host}:${dbConfig.port}/${encodeURIComponent(dbConfig.database)}`;
  
  console.log('Attempt 1: Using connection string (like migration script)...');
  try {
    const client1 = new Client({ connectionString });
    await client1.connect();
    const result1 = await client1.query('SELECT current_user, current_database()');
    console.log('✅ SUCCESS with connection string!');
    console.log(`   Connected as: ${result1.rows[0].current_user}`);
    console.log(`   Database: ${result1.rows[0].current_database}\n`);
    await client1.end();
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}`);
    if (error.code) {
      console.log(`   Error code: ${error.code}`);
    }
    console.log();
  }

  // Try with individual parameters (different method)
  console.log('Attempt 2: Using individual parameters (different method)...');
  try {
    const client2 = new Client({
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user,
      password: dbConfig.password,
    });
    await client2.connect();
    const result2 = await client2.query('SELECT current_user, current_database()');
    console.log('✅ SUCCESS with individual parameters!');
    console.log(`   Connected as: ${result2.rows[0].current_user}`);
    console.log(`   Database: ${result2.rows[0].current_database}\n`);
    await client2.end();
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}`);
    if (error.code) {
      console.log(`   Error code: ${error.code}`);
    }
    console.log();
  }

  // Check if database is actually ready
  console.log('Checking database readiness...');
  try {
    const client3 = new Client({
      host: dbConfig.host,
      port: dbConfig.port,
      database: 'postgres', // Try connecting to postgres database first
      user: dbConfig.user,
      password: dbConfig.password,
    });
    await client3.connect();
    const result3 = await client3.query('SELECT version(), current_user');
    console.log('✅ Can connect to postgres database');
    console.log(`   PostgreSQL version: ${result3.rows[0].version.split(',')[0]}`);
    console.log(`   Current user: ${result3.rows[0].current_user}`);
    
    // Check if target database exists
    const dbCheck = await client3.query(
      "SELECT datname FROM pg_database WHERE datname = $1",
      [dbConfig.database]
    );
    
    if (dbCheck.rows.length > 0) {
      console.log(`✅ Target database "${dbConfig.database}" exists`);
    } else {
      console.log(`❌ Target database "${dbConfig.database}" does NOT exist`);
    }
    
    // Check if user exists
    const userCheck = await client3.query(
      "SELECT usename FROM pg_user WHERE usename = $1",
      [dbConfig.user]
    );
    
    if (userCheck.rows.length > 0) {
      console.log(`✅ User "${dbConfig.user}" exists`);
    } else {
      console.log(`❌ User "${dbConfig.user}" does NOT exist`);
    }
    
    await client3.end();
  } catch (error) {
    console.log(`❌ Could not connect to postgres database: ${error.message}`);
    if (error.code) {
      console.log(`   Error code: ${error.code}`);
    }
  }
}

testConnection().catch(console.error);

