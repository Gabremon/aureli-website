#!/usr/bin/env node

/**
 * Fix business user connection script
 * Ensures test@business.com is properly connected to a business
 * 
 * Usage: node scripts/fix-business-user-connection.js
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

async function fixBusinessUserConnection() {
  console.log('🔍 Checking business user connection...\n');

  try {
    await pool.query('SELECT NOW()');
    console.log('✅ Connected to database\n');

    const client = await pool.connect();

    try {
      // Check current state
      console.log('📊 Current state:');
      const currentState = await client.query(`
        SELECT 
          u.id as user_id,
          u.email,
          u.name,
          u.role,
          u.business_id,
          b.id as business_exists,
          b.name as business_name
        FROM users u
        LEFT JOIN businesses b ON u.business_id = b.id
        WHERE u.email = 'test@business.com'
      `);

      if (currentState.rows.length === 0) {
        console.error('❌ User test@business.com not found!');
        console.log('\n📝 Available users:');
        const allUsers = await client.query(`
          SELECT id, email, name, role, business_id 
          FROM users 
          ORDER BY id
        `);
        allUsers.rows.forEach(user => {
          console.log(`   - ${user.email} (${user.name}) - Role: ${user.role} - Business ID: ${user.business_id || 'NULL'}`);
        });
        process.exit(1);
      }

      const user = currentState.rows[0];
      console.log(`   User ID: ${user.user_id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Business ID: ${user.business_id || 'NULL'}`);
      console.log(`   Business Name: ${user.business_name || 'N/A'}`);
      console.log(`   Business Exists: ${user.business_exists ? 'Yes' : 'No'}\n`);

      // Fix if needed
      if (!user.business_id || !user.business_exists) {
        console.log('🔧 Fixing connection...\n');

        let businessId = user.business_id;

        // If business_id doesn't exist or is invalid, find or create a business
        if (!businessId || !user.business_exists) {
          // Try to find existing business for this user
          const existingBusiness = await client.query(`
            SELECT id, name 
            FROM businesses 
            WHERE name LIKE '%Test Business%' 
               OR name LIKE '%test@business.com%'
            LIMIT 1
          `);

          if (existingBusiness.rows.length > 0) {
            businessId = existingBusiness.rows[0].id;
            console.log(`   ✓ Found existing business: "${existingBusiness.rows[0].name}" (ID: ${businessId})`);
          } else {
            // Create new business
            const newBusiness = await client.query(`
              INSERT INTO businesses (name, created_at, updated_at)
              VALUES ('Test Business', NOW(), NOW())
              RETURNING id, name
            `);
            businessId = newBusiness.rows[0].id;
            console.log(`   ✓ Created new business: "${newBusiness.rows[0].name}" (ID: ${businessId})`);
          }
        }

        // Link user to business
        await client.query(
          'UPDATE users SET business_id = $1 WHERE id = $2',
          [businessId, user.user_id]
        );
        console.log(`   ✓ Linked user to business (ID: ${businessId})\n`);
      } else {
        console.log('✅ User is already properly connected to a business!\n');
      }

      // Verify the fix
      console.log('✅ Verification:');
      const verification = await client.query(`
        SELECT 
          u.id as user_id,
          u.email,
          u.name,
          u.role,
          u.business_id,
          b.id as business_id_verified,
          b.name as business_name
        FROM users u
        LEFT JOIN businesses b ON u.business_id = b.id
        WHERE u.email = 'test@business.com'
      `);

      const verifiedUser = verification.rows[0];
      console.log(`   User: ${verifiedUser.email}`);
      console.log(`   Business ID: ${verifiedUser.business_id}`);
      console.log(`   Business Name: ${verifiedUser.business_name}`);
      console.log(`   Status: ${verifiedUser.business_id && verifiedUser.business_name ? '✅ Connected' : '❌ Not Connected'}\n`);

      // Show all business users
      console.log('📋 All Business Users:');
      const allBusinessUsers = await client.query(`
        SELECT 
          u.email,
          u.name as user_name,
          u.role,
          b.id as business_id,
          b.name as business_name
        FROM users u
        LEFT JOIN businesses b ON u.business_id = b.id
        WHERE u.role = 'business'
        ORDER BY u.id
      `);

      allBusinessUsers.rows.forEach((u, i) => {
        console.log(`   ${i + 1}. ${u.email} (${u.user_name})`);
        console.log(`      Business: ${u.business_name || 'None'} (ID: ${u.business_id || 'NULL'})`);
      });

      console.log('\n✨ Business user connection verified and fixed!');
      console.log('\n🔑 You can now log in with:');
      console.log('   Email: test@business.com');
      console.log('   Password: test');

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

fixBusinessUserConnection();

