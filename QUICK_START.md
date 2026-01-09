# Quick Start Guide

## Running the Full Application

The application requires TWO servers to be running:

### 1. Start the Database
```bash
docker-compose up -d
```

Wait for it to be ready (about 10 seconds), then run migrations:
```bash
npm run migrate
```

### 2. Start the Backend API Server (Terminal 1)
```bash
npm run server
```

This runs the Express server on port 3001 (handles authentication).

### 3. Start the Frontend Development Server (Terminal 2)
```bash
npm run dev
```

This runs the Vite dev server (usually on port 5173).

## Test Users

After running migrations, create test users:
```bash
npm run seed:test
```

This creates:
- **Admin**: `test@admin.com` / `test`
- **Business Owner**: `test@business.com` / `test`
- **Employee**: `test@employee.com` / `test`

## Common Issues

### "ERR_CONNECTION_REFUSED" on port 3001
**Solution**: Start the backend server with `npm run server` in a separate terminal.

### "useAuth must be used within an AuthProvider"
**Solution**: Make sure both servers are running and restart the frontend dev server.

### Nothing shows on the page
**Solution**: 
1. Check browser console for errors
2. Make sure backend server is running (`npm run server`)
3. Check that database is running (`docker-compose ps`)
4. Restart frontend dev server

## Full Startup Sequence

```bash
# Terminal 1: Start database
docker-compose up -d
sleep 10
npm run migrate
npm run seed:test

# Terminal 2: Start backend API
npm run server

# Terminal 3: Start frontend
npm run dev
```

Then open http://localhost:5173 in your browser.

