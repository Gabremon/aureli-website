#!/usr/bin/env node

/**
 * Ensure test business account is linked to a business
 * Handles both test@business and test@business.com
 * 
 * Usage: node scripts/ensure-test-business-linked.js
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

async function ensureTestBusinessLinked() {
  console.log('🔍 Ensuring test business account is linked to a business...\n');

  try {
    await pool.query('SELECT NOW()');
    console.log('✅ Connected to database\n');

    // Try both email formats
    const emailVariants = ['test@business.com', 'test@business'];
    let user = null;
    let foundEmail = null;

    for (const email of emailVariants) {
      const result = await pool.query(
        'SELECT id, email, name, role, business_id FROM users WHERE email = $1',
        [email.toLowerCase()]
      );
      
      if (result.rows.length > 0) {
        user = result.rows[0];
        foundEmail = email;
        console.log(`✅ Found user: ${user.email}`);
        break;
      }
    }

    if (!user) {
      console.error('❌ Test business user not found!');
      console.log('\n📝 Creating test@business.com user...');
      
      // Create the user if it doesn't exist
      const bcrypt = await import('bcryptjs');
      const passwordHash = await bcrypt.default.hash('test', 10);
      
      const newUser = await pool.query(
        'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role',
        ['test@business.com', passwordHash, 'Test Business', 'business']
      );
      
      user = newUser.rows[0];
      foundEmail = user.email;
      console.log(`✅ Created user: ${user.email}`);
    }

    console.log(`   User ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Current Business ID: ${user.business_id || 'NULL'}\n`);

    let businessId = user.business_id;

    // Check if business exists and is valid
    if (businessId) {
      const businessCheck = await pool.query(
        'SELECT id, name FROM businesses WHERE id = $1',
        [businessId]
      );
      
      if (businessCheck.rows.length === 0) {
        console.log('⚠️  Business ID exists but business not found. Creating new business...\n');
        businessId = null;
      } else {
        console.log(`✅ Business exists: "${businessCheck.rows[0].name}" (ID: ${businessId})`);
      }
    }

    // If no business_id or business doesn't exist, find or create one
    if (!businessId) {
      console.log('🔧 Linking user to a business...\n');

      // Try to find existing business
      const existingBusiness = await pool.query(`
        SELECT id, name 
        FROM businesses 
        WHERE name LIKE '%Test Business%' 
           OR name LIKE '%test@business%'
        ORDER BY id
        LIMIT 1
      `);

      if (existingBusiness.rows.length > 0) {
        businessId = existingBusiness.rows[0].id;
        console.log(`   ✓ Found existing business: "${existingBusiness.rows[0].name}" (ID: ${businessId})`);
      } else {
        // Create new business
        const newBusiness = await pool.query(`
          INSERT INTO businesses (name, created_at, updated_at)
          VALUES ($1, NOW(), NOW())
          RETURNING id, name
        `, ['Test Business']);
        
        businessId = newBusiness.rows[0].id;
        console.log(`   ✓ Created new business: "${newBusiness.rows[0].name}" (ID: ${businessId})`);
      }

      // Link user to business
      await pool.query(
        'UPDATE users SET business_id = $1 WHERE id = $2',
        [businessId, user.id]
      );
      console.log(`   ✓ Linked user to business\n`);
    }

    // Verify the connection
    console.log('✅ Final Verification:');
    const verification = await pool.query(`
      SELECT 
        u.id as user_id,
        u.email,
        u.name,
        u.role,
        u.business_id,
        b.id as business_id_verified,
        b.name as business_name,
        b.industry,
        b.website,
        b.phone,
        b.email as business_email
      FROM users u
      LEFT JOIN businesses b ON u.business_id = b.id
      WHERE u.id = $1
    `, [user.id]);

    const verifiedUser = verification.rows[0];
    console.log(`   User: ${verifiedUser.email}`);
    console.log(`   Business ID: ${verifiedUser.business_id}`);
    console.log(`   Business Name: ${verifiedUser.business_name}`);
    
    if (verifiedUser.business_id && verifiedUser.business_name) {
      console.log(`   Status: ✅ Connected\n`);
      console.log('📋 Business Details:');
      console.log(`   Name: ${verifiedUser.business_name}`);
      console.log(`   Industry: ${verifiedUser.industry || 'Not set'}`);
      console.log(`   Website: ${verifiedUser.website || 'Not set'}`);
      console.log(`   Phone: ${verifiedUser.phone || 'Not set'}`);
      console.log(`   Email: ${verifiedUser.business_email || 'Not set'}`);
    } else {
      console.log(`   Status: ❌ Not Connected\n`);
    }

    console.log('\n✨ Test business account is now properly linked!');
    console.log('\n🔑 Login credentials:');
    console.log(`   Email: ${verifiedUser.email}`);
    console.log('   Password: test');
    console.log(`\n🌐 Profile page: http://localhost:5173/business-owner/profile`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

ensureTestBusinessLinked();

