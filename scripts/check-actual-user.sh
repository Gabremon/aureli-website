#!/bin/bash

echo "🔍 Checking what user was actually created in the database..."
echo ""

docker-compose exec -T postgres psql -U postgres -d postgres <<EOF 2>/dev/null || \
docker-compose exec -T postgres psql -U aureli-gabe-user -d postgres <<EOF 2>/dev/null || \
docker-compose exec -T postgres psql -U "Aureli-Gabe-User" -d postgres <<EOF

\du
SELECT usename FROM pg_user ORDER BY usename;

EOF

echo ""
echo "💡 Note the exact username from above (case-sensitive)"
echo "   Your .env file DB_USER must match exactly"

