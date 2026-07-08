import pool from '../db.js';

export async function checkCache(username) {
  try {
    const result = await pool.query(
      `SELECT data FROM github_cache 
       WHERE username = $1 
       AND fetched_at > NOW() - INTERVAL '1 hour'`,
      [username]
    );
    return result.rows[0]?.data || null;
  } catch (err) {
    console.warn('Cache read failed:', err.message);
    return null;
  }
}

export async function saveCache(username, data) {
  try {
    await pool.query(
      `INSERT INTO github_cache (username, data, fetched_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (username)
       DO UPDATE SET data = $2, fetched_at = NOW()`,
      [username, JSON.stringify(data)]
    );
  } catch (err) {
    console.warn('Cache write failed:', err.message);
  }
}
