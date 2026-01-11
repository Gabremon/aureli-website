/**
 * Standalone script to alter existing database tables
 * 
 * This script updates the existing database schema to match the updated migrations:
 * 1. Adds email column to businesses table (if it doesn't exist)
 * 2. Removes phone and email columns from locations table (if they exist)
 * 
 * This is NOT a migration file - it's a one-time script to update existing databases.
 * 
 * Usage: node scripts/update-businesses-locations-schema.js
 */

import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'aureli_db',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting schema update migration...\n');
    
    await client.query('BEGIN');
    
    // Step 1: Add email column to businesses table if it doesn't exist
    console.log('📋 Step 1: Checking businesses table for email column...');
    const checkBusinessEmail = await client.query(`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'businesses' 
        AND column_name = 'email'
        AND table_schema = 'public'
      ) AS exists;
    `);
    
    if (!checkBusinessEmail.rows[0].exists) {
      await client.query('ALTER TABLE businesses ADD COLUMN email VARCHAR(255);');
      console.log('✅ Added email column to businesses table');
    } else {
      console.log('ℹ️  Email column already exists in businesses table');
    }
    
    // Step 2: Remove phone column from locations table if it exists
    console.log('\n📋 Step 2: Checking locations table for phone column...');
    const checkLocationPhone = await client.query(`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'locations' 
        AND column_name = 'phone'
        AND table_schema = 'public'
      ) AS exists;
    `);
    
    if (checkLocationPhone.rows[0].exists) {
      await client.query('ALTER TABLE locations DROP COLUMN phone;');
      console.log('✅ Removed phone column from locations table');
    } else {
      console.log('ℹ️  Phone column does not exist in locations table');
    }
    
    // Step 3: Remove email column from locations table if it exists
    console.log('\n📋 Step 3: Checking locations table for email column...');
    const checkLocationEmail = await client.query(`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'locations' 
        AND column_name = 'email'
        AND table_schema = 'public'
      ) AS exists;
    `);
    
    if (checkLocationEmail.rows[0].exists) {
      await client.query('ALTER TABLE locations DROP COLUMN email;');
      console.log('✅ Removed email column from locations table');
    } else {
      console.log('ℹ️  Email column does not exist in locations table');
    }
    
    await client.query('COMMIT');
    
    // Verification: Show current schema
    console.log('\n📊 Verification - Current table schemas:');
    
    const businessColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns
      WHERE table_name = 'businesses' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📍 Businesses table columns:');
    businessColumns.rows.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type})`);
    });
    
    const locationColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns
      WHERE table_name = 'locations' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📍 Locations table columns:');
    locationColumns.rows.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type})`);
    });
    
    console.log('\n✨ Migration completed successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
runMigration().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
