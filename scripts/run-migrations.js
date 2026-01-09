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
// Note: PostgreSQL usernames with hyphens are case-sensitive and stored exactly as created
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'aureli_db',
  user: process.env.DB_USER || 'aureli_user',
  password: process.env.DB_PASSWORD || 'aureli_password',
  // Ensure proper connection handling for usernames with special characters
  connectionString: process.env.DATABASE_URL || undefined,
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
  // Always use connection string format to properly handle usernames with special characters
  // PostgreSQL usernames with hyphens are case-sensitive and must be properly encoded
  const escapedUser = encodeURIComponent(dbConfig.user);
  const escapedPassword = encodeURIComponent(dbConfig.password);
  const escapedDatabase = encodeURIComponent(dbConfig.database);
  
  const connectionString = `postgresql://${escapedUser}:${escapedPassword}@${dbConfig.host}:${dbConfig.port}/${escapedDatabase}`;
  
  const client = new Client({
    connectionString: connectionString,
  });

  try {
    console.log('🚀 Connecting to database...');
    console.log(`   Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`   Database: ${dbConfig.database}`);
    console.log(`   User: ${dbConfig.user}`);
    console.log(`   Password: ${dbConfig.password ? '***' : '(not set)'}`);
    console.log(`   Connection string: postgresql://${escapedUser}:***@${dbConfig.host}:${dbConfig.port}/${escapedDatabase}`);
    
    // Debug: Show what .env file was found
    const envPath = path.join(__dirname, '..', '.env');
    const envExists = fs.existsSync(envPath);
    console.log(`   .env file exists: ${envExists ? 'yes' : 'NO'}`);
    if (envExists) {
      console.log(`   .env file path: ${envPath}`);
    }
    
    // Try connecting
    await client.connect();
    console.log('✅ Connected to database');
    
    // Verify we can query (this tests the connection)
    const testResult = await client.query('SELECT current_user, current_database()');
    console.log(`   Current user: ${testResult.rows[0].current_user}`);
    console.log(`   Current database: ${testResult.rows[0].current_database}`);

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
    if (error.code) {
      console.error(`   Error code: ${error.code}`);
    }
    
    // Provide helpful error messages for common issues
    if (error.message.includes('does not exist') || error.code === '28P01' || error.code === '28000') {
      console.error('\n💡 Authentication/Role Error:');
      console.error('   The user exists in the database, but connection is failing.');
      console.error(`   Attempting to connect as: "${dbConfig.user}"`);
      console.error(`   Database: ${dbConfig.database}`);
      console.error('\n   Possible causes:');
      console.error('   1. Username case mismatch (PostgreSQL is case-sensitive for special chars)');
      console.error('   2. Password mismatch in .env file');
      console.error('   3. Database name mismatch (check DB_NAME in .env)');
      console.error('   4. Connection authentication method issue');
      console.error('\n   Solutions:');
      console.error('   1. Verify user exists: docker-compose exec postgres psql -U "Aureli-Gabe-User" -d postgres -c "\\du"');
      console.error('   2. Test connection: docker-compose exec postgres psql -U "Aureli-Gabe-User" -d aureli_db');
      console.error('   3. Check .env file has exact username (case-sensitive): DB_USER=Aureli-Gabe-User');
      console.error('   4. Verify password matches: DB_PASSWORD=your_password');
      console.error('   5. Check database name: DB_NAME=aureli_db (with underscore, not hyphen)');
      console.error('\n   If issues persist, try recreating: docker-compose down -v && docker-compose up -d');
    } else if (error.code === 'ENOTFOUND' || error.message.includes('connect')) {
      console.error('\n💡 This error usually means:');
      console.error('   1. The database is not running');
      console.error('   2. Docker is not running');
      console.error('   3. The connection settings are incorrect');
      console.error('\n   Solutions:');
      console.error('   • Check: docker-compose ps');
      console.error('   • Start database: docker-compose up -d');
      console.error('   • Verify .env file has correct DB_HOST and DB_PORT');
    } else if (error.code === '3D000' || error.message.includes('database') && error.message.includes('does not exist')) {
      console.error('\n💡 This error usually means:');
      console.error('   The database does not exist');
      console.error('\n   Solutions:');
      console.error('   • Try: docker-compose down -v && docker-compose up -d');
      console.error('   • Or manually create the database (see TROUBLESHOOTING.md)');
    }
    
    console.error('\n📖 For more help, see TROUBLESHOOTING.md');
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run migrations
runMigrations();

