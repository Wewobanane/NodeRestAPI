const pool = require('../config/database');

class UserRepository {
  async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  async findById(id) {
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  async findByProvider(provider, providerId) {  
    const result = await pool.query(
      'SELECT * FROM users WHERE provider = $1 AND provider_id = $2',
      [provider, providerId]
    );
    return result.rows[0];
  }

  async create(userData) {
    const {
      name,
      email,
      password,
      provider = 'local',
      provider_id,
      profile_picture,
      is_email_verified = false
    } = userData;

    const result = await pool.query(
      `INSERT INTO users (name, email, password, provider, provider_id, profile_picture, is_email_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, email, password, provider, provider_id, profile_picture, is_email_verified]
    );
    return result.rows[0];
  }

  async updateProfile(userId, updates) {
    const allowedFields = ['name', 'email', 'password', 'profile_picture'];
    const fields = [];
    const values = [];
    let paramCounter = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = $${paramCounter}`);
        values.push(value);
        paramCounter++;
      }
    }

    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    fields.push(`updated_at = NOW()`);
    values.push(userId);

    const query = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = $${paramCounter}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async updatePassword(userId, newPassword) {
    const result = await pool.query(
      'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [newPassword, userId]
    );
    return result.rows[0];
  }

  async verifyEmail(userId) {
    const result = await pool.query(
      'UPDATE users SET is_email_verified = true, updated_at = NOW() WHERE id = $1 RETURNING *',
      [userId]
    );
    return result.rows[0];
  }

  async setActive(userId, isActive) {
    const result = await pool.query(
      'UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [isActive, userId]
    );
    return result.rows[0];
  }

  async setBanned(userId, isBanned) {
    const result = await pool.query(
      'UPDATE users SET is_banned = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [isBanned, userId]
    );
    return result.rows[0];
  }

  async delete(userId) {
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
  }

  // Password reset methods
  async createPasswordReset(userId, token, expiresAt) {
    const result = await pool.query(
      'INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, $3) RETURNING *',
      [userId, token, expiresAt]
    );
    return result.rows[0];
  }

  async findPasswordReset(token) {
    const result = await pool.query(
      'SELECT * FROM password_resets WHERE token = $1 AND expires_at > NOW()',
      [token]
    );
    return result.rows[0];
  }

  async deletePasswordReset(token) {
    await pool.query('DELETE FROM password_resets WHERE token = $1', [token]);
  }

  // Email verification methods
  async createEmailVerification(userId, token, expiresAt) {
    const result = await pool.query(
      'INSERT INTO email_verifications (user_id, token, expires_at) VALUES ($1, $2, $3) RETURNING *',
      [userId, token, expiresAt]
    );
    return result.rows[0];
  }

  async findEmailVerification(token) {
    const result = await pool.query(
      'SELECT * FROM email_verifications WHERE token = $1 AND expires_at > NOW()',
      [token]
    );
    return result.rows[0];
  }

  async deleteEmailVerification(token) {
    await pool.query('DELETE FROM email_verifications WHERE token = $1', [token]);
  }
}

module.exports = new UserRepository();
