#!/usr/bin/env node

/**
 * Verify user exists and can connect via TCP/IP
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function verifyUser() {
  console.log('🔍 Verifying database user...\n');
  
  // Get POSTGRES_USER from Docker
  try {
    const { stdout: userStdout } = await execAsync(
      'docker-compose exec -T postgres printenv POSTGRES_USER'
    );
    const postgresUser = userStdout.trim();
    
    const { stdout: passwordStdout } = await execAsync(
      'docker-compose exec -T postgres printenv POSTGRES_PASSWORD'
    );
    const postgresPassword = passwordStdout.trim();
    
    const { stdout: dbStdout } = await execAsync(
      'docker-compose exec -T postgres printenv POSTGRES_DB'
    );
    const postgresDb = dbStdout.trim();
    
    console.log('Environment variables in Docker:');
    console.log(`  POSTGRES_USER: ${postgresUser}`);
    console.log(`  POSTGRES_PASSWORD: ${postgresPassword ? '***' : '(not set)'}`);
    console.log(`  POSTGRES_DB: ${postgresDb}\n`);
    
    // Wait a moment for database to be ready
    console.log('⏳ Waiting for database to be ready...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Try connecting via TCP/IP with password
    console.log('\n📡 Testing TCP/IP connection (same as migration script)...');
    try {
      const { stdout, stderr } = await execAsync(
        `docker-compose exec -T postgres sh -c 'PGPASSWORD="${postgresPassword}" psql -h localhost -U "${postgresUser}" -d "${postgresDb}" -c "SELECT current_user, current_database();"'`
      );
      
      console.log('✅ SUCCESS! TCP/IP connection works!');
      console.log(stdout);
      console.log('\n💡 The user exists and can connect. The issue might be:');
      console.log('   1. Your .env file has different values than Docker');
      console.log('   2. The password in .env doesn\'t match');
      console.log('   3. Database name mismatch');
      
    } catch (error) {
      console.log('❌ TCP/IP connection FAILED');
      console.log(`   Error: ${error.message}`);
      if (error.stdout) console.log(`   Output: ${error.stdout}`);
      if (error.stderr) console.log(`   Error: ${error.stderr}`);
      console.log('\n💡 This means the user might not exist or password is wrong.');
      console.log('   Try recreating: docker-compose down -v && docker-compose up -d');
    }
    
    // Also check if user exists
    console.log('\n📋 Checking if user exists in database...');
    try {
      const { stdout } = await execAsync(
        `docker-compose exec -T postgres sh -c 'PGPASSWORD="${postgresPassword}" psql -h localhost -U "${postgresUser}" -d postgres -c "SELECT usename FROM pg_user;"'`
      );
      console.log(stdout);
    } catch (error) {
      console.log('❌ Could not check users:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Could not read environment variables:', error.message);
  }
}

verifyUser().catch(console.error);

