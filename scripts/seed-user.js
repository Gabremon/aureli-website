#!/usr/bin/env node

/**
 * Seed Script: Create a test user
 * Usage: node scripts/seed-user.js <email> <password> <name> <role>
 * Roles: admin, business_owner, employee
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
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'aureli_db',
  user: process.env.DB_USER || 'aureli_user',
  password: process.env.DB_PASSWORD || 'aureli_password',
});

async function seedUser(email, password, name, role) {
  if (!email || !password || !name || !role) {
    console.error('❌ Usage: node scripts/seed-user.js <email> <password> <name> <role>');
    console.error('   Roles: admin, business_owner, employee');
    process.exit(1);
  }

  if (!['admin', 'business_owner', 'employee'].includes(role)) {
    console.error('❌ Invalid role. Must be: admin, business_owner, or employee');
    process.exit(1);
  }

  try {
    // Check if user already exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    
    if (existing.rows.length > 0) {
      console.error(`❌ User with email ${email} already exists`);
      process.exit(1);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role',
      [email.toLowerCase(), passwordHash, name, role]
    );

    const user = result.rows[0];
    console.log('✅ User created successfully!');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`\n   You can now login with:`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Password: ${password}`);
  } catch (error) {
    console.error('❌ Error creating user:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Get command line arguments
const [, , email, password, name, role] = process.argv;

seedUser(email, password, name, role);

