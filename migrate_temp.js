import db from './server/db.js';
import fs from 'fs';
import path from 'path';

async function applySchema() {
  try {
    console.log('Reading schema.sql...');
    const schemaSql = fs.readFileSync(path.join(process.cwd(), 'server', 'schema.sql'), 'utf-8');
    
    // Split by semicolon to execute statements one by one, handling basic splitting
    const statements = schemaSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`Found ${statements.length} statements.`);

    for (const statement of statements) {
      // Basic check to see if we need to run it (pseudo-migration)
      // Since it's a demo, we will try to run ALTER statements or INSERTs carefully.
      // Actually, for this task, I really just want to add the column if it's missing.
      // Re-running the whole schema might clear data if not careful (though I wrote IF NOT EXISTS).
      // However, INSERT ... ON DUPLICATE KEY UPDATE helps.
      // AND 'ALTER TABLE' isn't in the schema, I just modified CREATE TABLE.
      // Existing table won't be changed by CREATE TABLE IF NOT EXISTS.
      
      // So I will specifically run an ALTER command here.
      if (statement.startsWith('CREATE TABLE IF NOT EXISTS users')) {
          console.log('Attempting to add phone column if missing...');
          try {
              await db.query('ALTER TABLE users ADD COLUMN phone VARCHAR(20)');
              console.log('Added phone column.');
          } catch (err) {
              if (err.code === 'ER_DUP_FIELDNAME') {
                  console.log('Phone column already exists.');
              } else {
                  console.error('Error adding column:', err.message);
              }
          }
      }
    }
    
    // Now run the seed update (UPDATE users ...)
    // I can just run a specific update query for the demo users.
    console.log('Updating user phone numbers...');
    const phone = '+94770346212';
    await db.query('UPDATE users SET phone = ?', [phone]);
    console.log('User phones updated.');

    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

applySchema();
