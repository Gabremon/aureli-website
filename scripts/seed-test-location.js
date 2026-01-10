#!/usr/bin/env node

/**
 * Seed test location script
 * Creates a location for the test business user
 * 
 * Usage: node scripts/seed-test-location.js
 */

import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Pool } = pg;
dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '..', '.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5433', 10),
  database: process.env.DB_NAME || 'aureli_db',
  user: process.env.DB_USER || 'aureli_user',
  password: process.env.DB_PASSWORD || 'aureli_password',
});

async function seedTestLocation() {
  console.log('🌱 Seeding test location...\n');

  try {
    await pool.query('SELECT NOW()');
    console.log('✅ Connected to database\n');

    const client = await pool.connect();

    try {
      // Find the business_id for test@business.com user
      const businessResult = await client.query(`
        SELECT b.id as business_id, b.name as business_name, u.email, u.id as user_id
        FROM users u
        JOIN businesses b ON u.business_id = b.id
        WHERE u.email = 'test@business.com'
        LIMIT 1
      `);

      if (businessResult.rows.length === 0) {
        console.error('❌ Business for test@business.com not found.');
        console.log('💡 Please run: node scripts/fix-business-user-connection.js first.\n');
        process.exit(1);
      }

      const business = businessResult.rows[0];
      const businessId = business.business_id;

      console.log(`📋 Found business: "${business.business_name}" (ID: ${businessId})`);
      console.log(`   User: ${business.email}\n`);

      // Check if location already exists
      const existingLocation = await client.query(`
        SELECT id, name 
        FROM locations 
        WHERE business_id = $1
        LIMIT 1
      `, [businessId]);

      if (existingLocation.rows.length > 0) {
        const loc = existingLocation.rows[0];
        console.log(`⏭️  Location already exists: "${loc.name}" (ID: ${loc.id})`);
        console.log('   Skipping seed.\n');
      } else {
        // Create test location
        const locationResult = await client.query(`
          INSERT INTO locations (
            business_id,
            name,
            address,
            city,
            state,
            zip_code,
            country,
            phone,
            email,
            is_active,
            created_at,
            updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()
          )
          RETURNING id, name
        `, [
          businessId,
          'Main Office',
          '123 Business Street',
          'San Francisco',
          'CA',
          '94102',
          'United States',
          '(555) 123-4567',
          'mainoffice@testbusiness.com',
          true
        ]);

        const location = locationResult.rows[0];
        console.log(`✅ Created test location: "${location.name}" (ID: ${location.id})`);
        console.log(`   Business: "${business.business_name}"`);
        console.log(`   Address: 123 Business Street, San Francisco, CA 94102\n`);
      }

      // Verify and show all locations for this business
      const allLocations = await client.query(`
        SELECT 
          l.id,
          l.name,
          l.address,
          l.city,
          l.state,
          l.zip_code,
          l.phone,
          l.is_active,
          b.name as business_name
        FROM locations l
        JOIN businesses b ON l.business_id = b.id
        WHERE l.business_id = $1
        ORDER BY l.created_at
      `, [businessId]);

      if (allLocations.rows.length > 0) {
        console.log('📍 All locations for this business:');
        allLocations.rows.forEach((loc, i) => {
          console.log(`   ${i + 1}. ${loc.name}`);
          console.log(`      ${loc.address || 'N/A'}, ${loc.city || 'N/A'}, ${loc.state || 'N/A'} ${loc.zip_code || ''}`);
          console.log(`      Phone: ${loc.phone || 'N/A'}`);
          console.log(`      Active: ${loc.is_active ? 'Yes' : 'No'}`);
          console.log('');
        });
      }

      console.log('✨ Test location seeding completed!');

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('❌ Error seeding test location:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedTestLocation();

