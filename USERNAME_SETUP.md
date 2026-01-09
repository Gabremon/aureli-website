# Custom Username Setup

## Using "Aureli-Gabe-User" as Database User

If you want to use `Aureli-Gabe-User` as your database username, follow these steps:

### Step 1: Update Your .env File

Make sure your `.env` file has:

```env
DB_USER=Aureli-Gabe-User
DB_PASSWORD=your_password_here
DB_NAME=aureli_db
DB_HOST=localhost
DB_PORT=5432
```

### Step 2: Important Notes About PostgreSQL Usernames

1. **Case Sensitivity**: PostgreSQL converts unquoted identifiers to lowercase. So `Aureli-Gabe-User` will be stored as `aureli-gabe-user` in the database.

2. **Using in Commands**: When connecting via command line or scripts, you can use either:
   - `Aureli-Gabe-User` (will be converted to lowercase)
   - `"Aureli-Gabe-User"` (quoted, preserves case)
   - `aureli-gabe-user` (recommended, explicit lowercase)

3. **Hyphens**: Hyphens are allowed in PostgreSQL usernames, but you may need to quote them in some SQL commands.

### Step 3: Recreate the Database

Since you're changing the username, you need to recreate the database:

```bash
# Stop and remove the existing database
docker-compose down -v

# Start with your new username (from .env file)
docker-compose up -d
```

### Step 4: Verify the User Was Created

After starting the database, verify the user exists:

```bash
# Connect to the database with your new username
docker-compose exec postgres psql -U "Aureli-Gabe-User" -d aureli_db -c "\du"
```

Or using lowercase (recommended):

```bash
docker-compose exec postgres psql -U aureli-gabe-user -d aureli_db -c "\du"
```

### Step 5: Run Migrations

Once the database is running with the new user:

```bash
npm run migrate
```

### Connecting to the Database

When connecting to the database, use:

```bash
# Using lowercase (recommended)
docker-compose exec postgres psql -U aureli-gabe-user -d aureli_db

# Or quoted to preserve case (if you prefer)
docker-compose exec postgres psql -U "Aureli-Gabe-User" -d aureli_db
```

### Troubleshooting

**If you get "role does not exist" errors:**
- Make sure your `.env` file has `DB_USER=Aureli-Gabe-User`
- Check that docker-compose read the .env file: `docker-compose config | grep POSTGRES_USER`
- Try recreating the database: `docker-compose down -v && docker-compose up -d`

**If migrations fail:**
- Check that your `.env` file matches what's in docker-compose
- Verify the user exists: `docker-compose exec postgres psql -U aureli-gabe-user -d aureli_db -c "\du"`

## Recommendation

While `Aureli-Gabe-User` works, consider using:
- `aureli_gabe_user` (underscores instead of hyphens)
- `aureli_gabe_user` (lowercase with underscores)

This avoids potential quoting issues and follows PostgreSQL naming conventions more closely.

