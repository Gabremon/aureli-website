#!/usr/bin/env node

/**
 * Data Migration Script: Update existing data to new schema
 * This script contains UPDATE commands to migrate data from old schema to new schema
 * Run this AFTER running all migrations (001-007)
 * 
 * Usage: node scripts/migrate-data-to-new-schema.js
 */

import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const { Pool } = pg;
dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '..', '.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5433', 10),
  database: process.env.DB_NAME || 'aureli_db',
  user: process.env.DB_USER || 'aureli_user',
  password: process.env.DB_PASSWORD || 'aureli_password',
});

async function runMigration() {
  console.log('🔄 Starting data migration to new schema...\n');

  try {
    // Connect to database
    await pool.query('SELECT NOW()');
    console.log('✅ Connected to database\n');

    const client = await pool.connect();

    try {
      // Step 1: Update user roles
      console.log('📝 Step 1: Updating user roles...');
      
      const updateBusinessOwner = await client.query(
        "UPDATE users SET role = 'business' WHERE role = 'business_owner'"
      );
      console.log(`   ✓ Updated ${updateBusinessOwner.rowCount} users: business_owner → business`);

      const updateEmployee = await client.query(
        "UPDATE users SET role = 'applicant' WHERE role = 'employee'"
      );
      console.log(`   ✓ Updated ${updateEmployee.rowCount} users: employee → applicant\n`);

      // Step 2: Create businesses for existing business users
      console.log('🏢 Step 2: Creating businesses for business users...');
      
      const businessUsers = await client.query(
        "SELECT id, name, email FROM users WHERE role = 'business' AND business_id IS NULL"
      );

      let businessesCreated = 0;
      for (const user of businessUsers.rows) {
        const businessName = user.name ? `${user.name}'s Business` : `${user.email}'s Business`;
        const result = await client.query(
          'INSERT INTO businesses (name, created_at, updated_at) VALUES ($1, NOW(), NOW()) RETURNING id',
          [businessName]
        );
        const businessId = result.rows[0].id;

        await client.query(
          'UPDATE users SET business_id = $1 WHERE id = $2',
          [businessId, user.id]
        );

        businessesCreated++;
        console.log(`   ✓ Created business "${businessName}" (id: ${businessId}) for user ${user.email}`);
      }

      if (businessesCreated === 0) {
        console.log('   ℹ️  No business users without businesses found.\n');
      } else {
        console.log(`   ✓ Created ${businessesCreated} businesses\n`);
      }

      // Step 3: Migrate applicants from business_owner_id to business_id
      console.log('👥 Step 3: Migrating applicants to use business_id...');

      // Check if business_owner_id column exists
      const columnCheck = await client.query(`
        SELECT EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name = 'applicants' AND column_name = 'business_owner_id'
        )
      `);

      let applicantsMigrated = 0;
      if (columnCheck.rows[0].exists) {
        // Get applicants with business_owner_id but no business_id
        const applicants = await client.query(`
          SELECT a.id, a.business_owner_id, u.business_id
          FROM applicants a
          LEFT JOIN users u ON a.business_owner_id = u.id
          WHERE a.business_owner_id IS NOT NULL AND a.business_id IS NULL
        `);

        for (const applicant of applicants.rows) {
          if (applicant.business_id) {
            await client.query(
              'UPDATE applicants SET business_id = $1 WHERE id = $2',
              [applicant.business_id, applicant.id]
            );
            applicantsMigrated++;
          } else {
            console.log(`   ⚠️  Warning: User ${applicant.business_owner_id} does not have a business_id. Applicant ${applicant.id} cannot be migrated.`);
          }
        }

        if (applicantsMigrated > 0) {
          console.log(`   ✓ Migrated ${applicantsMigrated} applicants from business_owner_id to business_id\n`);
        } else {
          console.log('   ℹ️  No applicants needed migration.\n');
        }
      } else {
        console.log('   ℹ️  business_owner_id column does not exist. Skipping.\n');
      }

      // Step 4: Handle orphaned applicants
      console.log('🔍 Step 4: Handling orphaned applicants...');

      const orphanedCount = await client.query(
        'SELECT COUNT(*) as count FROM applicants WHERE business_id IS NULL'
      );
      const orphaned = parseInt(orphanedCount.rows[0].count);

      if (orphaned > 0) {
        // Get or create default business
        let defaultBusiness = await client.query('SELECT id FROM businesses LIMIT 1');

        if (defaultBusiness.rows.length === 0) {
          const newBusiness = await client.query(
            "INSERT INTO businesses (name, created_at, updated_at) VALUES ('Default Business', NOW(), NOW()) RETURNING id"
          );
          defaultBusiness = newBusiness;
          console.log(`   ✓ Created default business (id: ${defaultBusiness.rows[0].id})`);
        }

        const defaultBusinessId = defaultBusiness.rows[0].id;

        await client.query(
          'UPDATE applicants SET business_id = $1 WHERE business_id IS NULL',
          [defaultBusinessId]
        );

        console.log(`   ✓ Assigned ${orphaned} orphaned applicants to business ${defaultBusinessId}\n`);
      } else {
        console.log('   ✓ No orphaned applicants found.\n');
      }

      // Step 5: Verify migration
      console.log('✅ Step 5: Verifying migration...\n');

      const oldRoles = await client.query(
        "SELECT COUNT(*) as count FROM users WHERE role IN ('business_owner', 'employee')"
      );
      const oldRoleCount = parseInt(oldRoles.rows[0].count);

      if (oldRoleCount > 0) {
        console.log(`   ⚠️  Warning: Found ${oldRoleCount} users still with old role names.\n`);
      } else {
        console.log('   ✓ All user roles have been migrated successfully.\n');
      }

      const summary = await client.query(`
        SELECT 
          (SELECT COUNT(*) FROM users WHERE role = 'business') as business_users,
          (SELECT COUNT(*) FROM users WHERE role = 'applicant') as applicant_users,
          (SELECT COUNT(*) FROM businesses) as total_businesses,
          (SELECT COUNT(*) FROM applicants WHERE business_id IS NOT NULL) as applicants_with_business,
          (SELECT COUNT(*) FROM applicants WHERE business_id IS NULL) as applicants_without_business
      `);

      const stats = summary.rows[0];
      console.log('📊 Migration Summary:');
      console.log(`   Business users: ${stats.business_users}`);
      console.log(`   Applicant users: ${stats.applicant_users}`);
      console.log(`   Total businesses: ${stats.total_businesses}`);
      console.log(`   Applicants with business_id: ${stats.applicants_with_business}`);
      if (parseInt(stats.applicants_without_business) > 0) {
        console.log(`   ⚠️  Applicants without business_id: ${stats.applicants_without_business}`);
      }

      console.log('\n✨ Data migration completed successfully!');

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('❌ Error during data migration:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();

