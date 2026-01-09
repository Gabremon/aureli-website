# Database Setup Guide

This guide will help you set up PostgreSQL locally so everyone on the team can work with the same database configuration.

## Prerequisites

- [Docker](https://www.docker.com/get-started) installed on your machine
- Docker Compose (usually comes with Docker Desktop)

## Quick Start

1. **Create your .env file from the template:**
   ```bash
   cp env.template .env
   ```
   
   Or manually create a `.env` file in the root directory with the contents from `env.template`

2. **Start the PostgreSQL database:**
   ```bash
   docker-compose up -d
   ```

3. **Verify the database is running:**
   ```bash
   docker-compose ps
   ```

4. **Check the database logs (optional):**
   ```bash
   docker-compose logs postgres
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aureli_db
DB_USER=aureli_user
DB_PASSWORD=aureli_password

# Optional: Full connection string
# DATABASE_URL=postgresql://aureli_user:aureli_password@localhost:5432/aureli_db
```

## Common Commands

### Start the database
```bash
docker-compose up -d
```

### Stop the database
```bash
docker-compose down
```

### Stop and remove all data (fresh start)
```bash
docker-compose down -v
```

### Access PostgreSQL directly
```bash
docker-compose exec postgres psql -U aureli_user -d aureli_db
```

### View database logs
```bash
docker-compose logs -f postgres
```

## Running Migrations

After starting the database, run migrations to set up your schema:

```bash
npm install  # Install dependencies if not done yet
npm run migrate
```

This will run all migration files in the `migrations/` directory. See [MIGRATIONS.md](./MIGRATIONS.md) for detailed migration instructions.

## Connecting from Your Application

Use these connection details in your backend/API:

- **Host:** `localhost`
- **Port:** `5432`
- **Database:** `aureli_db`
- **Username:** `aureli_user`
- **Password:** `aureli_password`

Connection string format:
```
postgresql://aureli_user:aureli_password@localhost:5432/aureli_db
```

## Troubleshooting

### Port 5432 is already in use
If you already have PostgreSQL running locally, change the `DB_PORT` in your `.env` file and update the `docker-compose.yml` ports mapping.

### Database not connecting
1. Make sure Docker is running
2. Check if the container is up: `docker-compose ps`
3. Check the logs: `docker-compose logs postgres`
4. Verify your `.env` file matches the docker-compose configuration

### Reset the database
```bash
docker-compose down -v
docker-compose up -d
```

## Data Persistence

Database data is stored in a Docker volume (`postgres_data`). This means:
- Data persists even if you stop the container
- Data is shared across all team members who use this setup
- To completely reset, use `docker-compose down -v`

## Notes

- The `.env` file is gitignored - each developer maintains their own local copy
- The `env.template` file is committed to the repo as a template for everyone
- Everyone uses the same database schema, but can customize connection details if needed
- If you need to change the password or database name, update both your `.env` file and the docker-compose.yml defaults (or make sure your `.env` values match)

