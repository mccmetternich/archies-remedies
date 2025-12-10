// Script to reset admin password with bcrypt hash
// Run with: TURSO_DATABASE_URL="..." TURSO_AUTH_TOKEN="..." ADMIN_USERNAME="..." ADMIN_PASSWORD="..." node scripts/reset-admin-password.mjs

import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function resetAdminPassword() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    console.error('ERROR: ADMIN_USERNAME and ADMIN_PASSWORD env vars are required');
    process.exit(1);
  }

  console.log(`Resetting password for user: ${username}`);

  // Hash the password with bcrypt
  const hashedPassword = await bcrypt.hash(password, 12);
  console.log('Generated bcrypt hash');

  // Check if user exists
  const existingUser = await db.execute({
    sql: 'SELECT id, username, password_hash FROM admin_users WHERE username = ?',
    args: [username],
  });

  if (existingUser.rows.length > 0) {
    // Update existing user's password
    await db.execute({
      sql: 'UPDATE admin_users SET password_hash = ? WHERE username = ?',
      args: [hashedPassword, username],
    });
    console.log(`✅ Updated password for existing user: ${username}`);
  } else {
    // Create new user
    const id = crypto.randomUUID();
    await db.execute({
      sql: 'INSERT INTO admin_users (id, username, password_hash) VALUES (?, ?, ?)',
      args: [id, username, hashedPassword],
    });
    console.log(`✅ Created new admin user: ${username}`);
  }

  // Also clear any old sessions
  await db.execute({ sql: 'DELETE FROM admin_sessions', args: [] });
  console.log('✅ Cleared old sessions');

  console.log('\nDone! You can now log in with your new credentials.');
}

resetAdminPassword().catch(console.error);
