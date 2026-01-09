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

## Seeding Users

After starting the database and running all the migrations test users are there and can be implemented

npm run seed:test
