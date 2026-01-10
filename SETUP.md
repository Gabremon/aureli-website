# Setup Guide

Complete guide to get the Aureli website running with database, migrations, and authentication.

## Prerequisites

- Node.js (v18+)
- Docker Desktop
- npm or yarn

## Quick Setup (5 Steps)

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Environment File
```bash
cp env.template .env
```

Edit `.env` and ensure these values:
```env
DB_HOST=localhost
DB_PORT=5433
DB_NAME=aureli_db
DB_USER=aureli_gabe_user
DB_PASSWORD=aureli_password
SERVER_PORT=3001
CLIENT_URL=http://localhost:5173
```

**Important Notes:**
- Port 5433 is used because most systems have local PostgreSQL on 5432 (Docker will use 5433 to avoid conflict)
- Username uses underscores (not hyphens) - hyphens cause connection issues with external TCP/IP
- All values in `.env` must match exactly what Docker uses when creating the database

### 3. Start Database & Run Migrations
```bash
# Start PostgreSQL container
docker-compose up -d

# Wait 10-15 seconds for database to initialize
sleep 15

# Run migrations to create tables
npm run migrate

# Create test users
npm run seed:test
```

### 4. Start Backend Server (Terminal 1)
```bash
npm run server
```

Server runs on `http://localhost:3001`

### 5. Start Frontend (Terminal 2)
```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

## Test Users

After running `npm run seed:test`, you can login with:

- **Admin**: `test@admin.com` / `test`
- **Business Owner**: `test@business.com` / `test`
- **Employee**: `test@employee.com` / `test`

## Database Migrations

### Running Migrations
```bash
npm run migrate
```

This automatically:
- Connects to your database using `.env` credentials
- Runs all pending SQL files from `migrations/` folder
- Tracks executed migrations (won't run twice)
- Rolls back on errors

### Creating New Migrations

1. Create a numbered SQL file in `migrations/`:
   ```
   migrations/003_create_products_table.sql
   ```

2. Write your SQL:
   ```sql
   CREATE TABLE IF NOT EXISTS products (
       id SERIAL PRIMARY KEY,
       name VARCHAR(255) NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

3. Run migrations:
   ```bash
   npm run migrate
   ```

### Migration Naming
- Use sequential numbers: `001_`, `002_`, `003_`
- Use descriptive names: `003_create_products_table.sql`
- Use underscores, not hyphens or spaces

## Common Commands

### Database
```bash
docker-compose up -d          # Start database
docker-compose down -v        # Stop and remove all data
docker-compose ps             # Check if running
docker-compose logs postgres  # View logs
```

### Migrations & Users
```bash
npm run migrate               # Run all pending migrations
npm run seed:test             # Create test users (admin, business, employee)
npm run seed:user <email> <password> <name> <role>  # Create individual user
```

### Development
```bash
npm run dev                   # Start frontend dev server
npm run server                # Start backend API server
npm run dev:server            # Start backend with auto-reload
npm run build                 # Build for production
```

## Troubleshooting

### Migration Failed: "role does not exist" or "connection refused"
**Cause**: Database port conflict, wrong credentials, or local PostgreSQL running on port 5432

**Solution**:
1. **Check if local PostgreSQL is running:**
   ```bash
   lsof -i :5432  # Check what's using port 5432
   ```

2. **Use port 5433 in `.env`** (already set to avoid conflict):
   ```env
   DB_PORT=5433
   ```

3. **Verify `.env` file matches Docker:**
   - `.env` values must match exactly
   - Recreate database: `docker-compose down -v && docker-compose up -d`
   - Wait 15 seconds for initialization
   - Run: `npm run migrate`

4. **Verify user was created:**
   ```bash
   docker-compose exec postgres printenv POSTGRES_USER
   # Should match DB_USER in your .env
   ```

### Database Connection Refused
**Cause**: Database not running or wrong port

**Solution**:
1. Check Docker is running: `docker ps`
2. Check container: `docker-compose ps`
3. If port 5432 is in use locally, Docker uses 5433 (from `.env`)
4. Verify port in `.env` matches what's available

### Backend Server: ERR_CONNECTION_REFUSED
**Cause**: Backend server not running

**Solution**: Start it in a separate terminal: `npm run server`

### Frontend: "useAuth must be used within an AuthProvider"
**Cause**: Hot reload issue or backend not running

**Solution**:
1. Restart dev server (`npm run dev`)
2. Make sure backend is running (`npm run server`)
3. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)

## Project Structure

```
src/
├── pages/
│   ├── admin/          # Admin dashboard & pages
│   ├── business/       # Business owner pages
│   ├── employee/       # Employee pages
│   └── [public pages]  # Login, Hire, etc.
├── components/
│   ├── admin/          # Admin components
│   ├── business/       # Business components
│   ├── employee/       # Employee components
│   └── [shared]        # Header, ProtectedRoute
├── styles/
│   ├── admin/          # Admin styles
│   ├── business/       # Business styles
│   ├── employee/       # Employee styles
│   └── [shared]        # App.css, Dashboard.css
└── contexts/
    └── AuthContext.tsx # Authentication state
```

## Routes

- `/` - Public homepage
- `/login` - Login page
- `/admin` - Admin dashboard (requires admin role)
- `/business-owner` - Business dashboard (requires business_owner role)
- `/employee` - Employee dashboard (requires employee role)

## Adding New Features

### Add Admin Page
1. Create `src/pages/admin/YourPage.tsx`
2. Export from `src/pages/admin/index.ts`
3. Add route in `App.tsx` with `ProtectedRoute` and `allowedRoles={['admin']}`

### Add Migration
1. Create `migrations/XXX_description.sql`
2. Write SQL
3. Run `npm run migrate`

