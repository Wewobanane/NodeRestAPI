const pool = require('../config/database');

const createTables = async () => {
  try {
    console.log('Starting database migration...');

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100),
        email VARCHAR(150) UNIQUE,
        password TEXT,
        provider VARCHAR(20) DEFAULT 'local',
        provider_id VARCHAR(255),
        profile_picture TEXT,
        is_email_verified BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        is_banned BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('Users table created successfully');

    // Create password_resets table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        token TEXT,
        expires_at TIMESTAMP
      )
    `);
    console.log('Password resets table created successfully');

    // 
    await pool.query(`
      CREATE TABLE IF NOT EXISTS email_verifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        token TEXT,
        expires_at TIMESTAMP
      )
    `);
    console.log('Email verifications table created successfully');

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  }
};

module.exports = createTables;
