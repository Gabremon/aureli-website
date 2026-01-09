# Database Migrations Guide

This guide explains how to use the migration system to manage your database schema changes.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Make sure your database is running:**
   ```bash
   docker-compose up -d
   ```

3. **Run migrations:**
   ```bash
   npm run migrate
   ```

That's it! Migrations will run automatically.

## How It Works

- Migration files are stored in the `migrations/` directory
- Files are named with a number prefix (e.g., `001_`, `002_`) to ensure execution order
- The system tracks which migrations have been run in the `migrations` table
- Migrations are executed in alphabetical order
- Each migration runs in a transaction (rolls back on error)

## Creating New Migrations

1. **Create a new SQL file** in the `migrations/` directory
2. **Name it with a number prefix** higher than existing migrations:
   ```
   003_my_new_migration.sql
   004_another_migration.sql
   ```
3. **Write your SQL** in the file:
   ```sql
   -- Migration: Add products table
   CREATE TABLE IF NOT EXISTS products (
       id SERIAL PRIMARY KEY,
       name VARCHAR(255) NOT NULL,
       price DECIMAL(10, 2),
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```
4. **Run migrations:**
   ```bash
   npm run migrate
   ```

## Migration Naming Convention

- Use sequential numbers: `001_`, `002_`, `003_`, etc.
- Use descriptive names: `001_create_users_table.sql`
- Use underscores, not spaces
- Always use `.sql` extension

Examples:
- ✅ `001_create_users_table.sql`
- ✅ `002_add_email_index.sql`
- ✅ `003_create_products_table.sql`
- ❌ `create_users.sql` (no number prefix)
- ❌ `001 Create Users Table.sql` (spaces in filename)

## Commands

### Run all pending migrations
```bash
npm run migrate
```

Or:
```bash
npm run migrate:up
```

### Check migration status
Connect to your database and query:
```sql
SELECT * FROM migrations ORDER BY id;
```

This shows which migrations have been executed.

## Important Notes

### ✅ Best Practices

1. **Always test migrations locally first**
2. **Never modify a migration file after it's been run** (create a new one instead)
3. **Use transactions** - The migration runner automatically wraps each migration in a transaction
4. **Use IF NOT EXISTS** when creating tables to avoid errors on re-runs
5. **Commit migration files to git** - They should be part of your repository

### ⚠️ Warnings

- **Never delete migration files** that have been run in production
- **Always backup** before running migrations on production
- **Migration order matters** - Use sequential numbering

## Migration File Structure

```sql
-- Migration: Brief description of what this migration does
-- Optional: Additional context or notes

-- Your SQL statements here
CREATE TABLE IF NOT EXISTS table_name (
    -- table definition
);

-- You can have multiple statements
CREATE INDEX IF NOT EXISTS idx_name ON table_name(column_name);
```

## Troubleshooting

### Migration fails with "relation already exists"
- Use `IF NOT EXISTS` clauses in your CREATE statements
- Check if you've already run this migration manually

### Connection refused
- Make sure Docker is running: `docker ps`
- Make sure PostgreSQL container is up: `docker-compose ps`
- Check your `.env` file has correct database credentials

### Migration already executed but wants to run again
- The migrations table tracks executed migrations
- If a migration is marked as run, it will be skipped automatically
- If you need to re-run, you can manually delete the record from the migrations table (not recommended)

### Reset all migrations (development only!)
```sql
-- ⚠️ WARNING: This deletes all migration tracking data
-- Only use in development when you want to start fresh
TRUNCATE TABLE migrations;
```

Then drop and recreate your database:
```bash
docker-compose down -v
docker-compose up -d
npm run migrate
```

## Working with Your Team

1. **Create a migration** for schema changes
2. **Commit the migration file** to git
3. **Team members pull** the new migration
4. **Team members run** `npm run migrate` to apply it locally

Everyone maintains their own local database with the same schema structure!

## Example Workflow

### Adding a new table

1. Create `migrations/003_create_orders_table.sql`:
   ```sql
   CREATE TABLE IF NOT EXISTS orders (
       id SERIAL PRIMARY KEY,
       user_id INTEGER REFERENCES users(id),
       total DECIMAL(10, 2) NOT NULL,
       status VARCHAR(50) DEFAULT 'pending',
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

2. Commit to git:
   ```bash
   git add migrations/003_create_orders_table.sql
   git commit -m "Add orders table"
   git push
   ```

3. Team members run:
   ```bash
   git pull
   npm run migrate
   ```

Everyone now has the same schema! 🎉

