#!/bin/bash

# Script to check the actual username in the database via Docker

echo "🔍 Checking actual username in PostgreSQL database..."
echo ""

# Try to connect and list all users
docker-compose exec -T postgres psql -U "Aureli-Gabe-User" -d postgres <<EOF
\du
SELECT usename FROM pg_user ORDER BY usename;
EOF

echo ""
echo "📝 Note: Compare the 'usename' column above with your DB_USER in .env file"
echo "   They must match exactly (including case) for external connections to work"

