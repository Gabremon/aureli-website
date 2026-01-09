#!/usr/bin/env node

/**
 * Migration Runner Script
 * Runs SQL migration files in order from the migrations directory
 * Works on both Mac and Windows
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

const { Client } = pg;

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'aureli_db',
  user: process.env.DB_USER || 'aureli_user',
  password: process.env.DB_PASSWORD || 'aureli_password',
};

const migrationsDir = path.join(__dirname, '..', 'migrations');

/**
 * Get all migration files sorted by name
 */
function getMigrationFiles() {
  if (!fs.existsSync(migrationsDir)) {
    console.error(`❌ Migrations directory not found: ${migrationsDir}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort(); // Sort alphabetically to ensure order

  return files;
}

/**
 * Check if a migration has already been run
 */
async function hasMigrationRun(client, migrationName) {
  try {
    const result = await client.query(
      'SELECT COUNT(*) as count FROM migrations WHERE name = $1',
      [migrationName]
    );
    return parseInt(result.rows[0].count, 10) > 0;
  } catch (error) {
    // If migrations table doesn't exist, return false
    if (error.code === '42P01') {
      return false;
    }
    throw error;
  }
}

/**
 * Mark a migration as executed
 */
async function markMigrationRun(client, migrationName) {
  await client.query('INSERT INTO migrations (name) VALUES ($1)', [migrationName]);
}

/**
 * Run a single migration file
 */
async function runMigration(client, migrationFile) {
  const migrationPath = path.join(migrationsDir, migrationFile);
  const sql = fs.readFileSync(migrationPath, 'utf8');
  const migrationName = migrationFile;

  // Skip the migrations table creation migration if it already exists
  if (migrationName === '001_create_migrations_table.sql') {
    const hasRun = await hasMigrationRun(client, migrationName);
    if (hasRun) {
      console.log(`⏭️  Skipping: ${migrationName} (already executed)`);
      return;
    }
  } else {
    // Check if migration has already been run
    const hasRun = await hasMigrationRun(client, migrationName);
    if (hasRun) {
      console.log(`⏭️  Skipping: ${migrationName} (already executed)`);
      return;
    }
  }

  console.log(`🔄 Running: ${migrationName}`);

  try {
    // Run the migration in a transaction
    await client.query('BEGIN');
    await client.query(sql);
    await markMigrationRun(client, migrationName);
    await client.query('COMMIT');
    console.log(`✅ Success: ${migrationName}`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`❌ Error running ${migrationName}:`, error.message);
    throw error;
  }
}

/**
 * Main function to run all migrations
 */
async function runMigrations() {
  const client = new Client(dbConfig);

  try {
    console.log('🚀 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');

    // First, ensure the migrations table exists
    const migrationsTableSql = fs.readFileSync(
      path.join(migrationsDir, '001_create_migrations_table.sql'),
      'utf8'
    );
    await client.query(migrationsTableSql);

    // Check if the migrations table creation has been recorded
    const hasMigrationsTable = await hasMigrationRun(client, '001_create_migrations_table.sql');
    if (!hasMigrationsTable) {
      await markMigrationRun(client, '001_create_migrations_table.sql');
    }

    // Get all migration files
    const migrationFiles = getMigrationFiles();

    if (migrationFiles.length === 0) {
      console.log('ℹ️  No migration files found');
      return;
    }

    console.log(`📦 Found ${migrationFiles.length} migration file(s)\n`);

    // Run migrations
    for (const migrationFile of migrationFiles) {
      // Skip the migrations table creation as we already handled it
      if (migrationFile === '001_create_migrations_table.sql') {
        continue;
      }
      await runMigration(client, migrationFile);
    }

    console.log('\n✨ All migrations completed successfully!');
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run migrations
runMigrations();

