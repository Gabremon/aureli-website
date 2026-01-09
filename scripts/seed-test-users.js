#!/usr/bin/env node

/**
 * Seed Test Users Migration Script
 * Creates test users for development: admin, business_owner, and employee
 * Password for all users: "test" (hashed with bcrypt)
 */

import pg from 'pg';
import bcrypt from 'bcryptjs';
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

const testUsers = [
  {
    email: 'test@admin.com',
    password: 'test',
    name: 'Test Admin',
    role: 'admin',
  },
  {
    email: 'test@business.com',
    password: 'test',
    name: 'Test Business Owner',
    role: 'business_owner',
  },
  {
    email: 'test@employee.com',
    password: 'test',
    name: 'Test Employee',
    role: 'employee',
  },
];

async function seedTestUsers() {
  console.log('🌱 Seeding test users...\n');
  console.log('Password for all users: "test"\n');

  try {
    // Connect to database
    await pool.query('SELECT NOW()');
    console.log('✅ Connected to database\n');

    for (const userData of testUsers) {
      try {
        // Check if user already exists
        const existing = await pool.query(
          'SELECT id FROM users WHERE email = $1',
          [userData.email.toLowerCase()]
        );

        if (existing.rows.length > 0) {
          console.log(`⏭️  Skipping: ${userData.email} (already exists)`);
          continue;
        }

        // Hash password with bcrypt
        const passwordHash = await bcrypt.hash(userData.password, 10);

        // Insert user
        const result = await pool.query(
          'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role',
          [userData.email.toLowerCase(), passwordHash, userData.name, userData.role]
        );

        const user = result.rows[0];
        console.log(`✅ Created: ${user.email}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Password: "${userData.password}"\n`);
      } catch (error) {
        console.error(`❌ Error creating ${userData.email}:`, error.message);
      }
    }

    console.log('✨ Test users seeding completed!');
    console.log('\n📝 You can now login with:');
    console.log('   Admin: test@admin.com / test');
    console.log('   Business Owner: test@business.com / test');
    console.log('   Employee: test@employee.com / test');
  } catch (error) {
    console.error('❌ Error seeding test users:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedTestUsers();

