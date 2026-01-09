#!/bin/bash

echo "🔍 Diagnosing database connection issue..."
echo ""

# Get the actual POSTGRES_USER from the container
POSTGRES_USER=$(docker-compose exec -T postgres printenv POSTGRES_USER 2>/dev/null | tr -d '\r\n')

echo "1. POSTGRES_USER from Docker: $POSTGRES_USER"
echo ""

# Check what users exist in the database - use TCP/IP connection with password
echo "2. Checking users in database (via TCP/IP)..."
PGPASSWORD="${POSTGRES_PASSWORD:-aureli_password}" docker-compose exec -T postgres psql -h localhost -U "$POSTGRES_USER" -d postgres -c "SELECT usename FROM pg_user ORDER BY usename;" 2>&1

echo ""
echo "3. Testing connection to target database..."
PGPASSWORD="${POSTGRES_PASSWORD:-aureli_password}" docker-compose exec -T postgres psql -h localhost -U "$POSTGRES_USER" -d "${POSTGRES_DB:-aureli_db}" -c "SELECT current_user, current_database();" 2>&1

echo ""
echo "4. Checking if database exists..."
PGPASSWORD="${POSTGRES_PASSWORD:-aureli_password}" docker-compose exec -T postgres psql -h localhost -U "$POSTGRES_USER" -d postgres -c "SELECT datname FROM pg_database WHERE datistemplate = false;" 2>&1

