import db from './server/db.js';

async function migrate() {
  try {
    console.log('Adding phone column...');
    try {
      await db.query('ALTER TABLE users ADD COLUMN phone VARCHAR(20)');
      console.log('Phone column added.');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('Phone column already exists.');
      } else {
        throw err;
      }
    }

    console.log('Updating user phone numbers...');
    const phone = '+94770346212';
    // Update all users to have this phone for testing
    await db.query('UPDATE users SET phone = ?', [phone]);
    console.log('User phones updated.');

    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
