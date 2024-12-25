const sqlite3 = require('sqlite3').verbose();

// Initialize SQLite database
const db = new sqlite3.Database('./servers.db', err => {
  if (err) console.error(err.message);
  console.log('Connected to the SQLite database.');
});

// Create table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS guild_settings (
    guild_id TEXT PRIMARY KEY,
    welcome_channel_id TEXT,
    role_id TEXT,
    welcome_message TEXT
  )
`);

/**
 * Save server configuration to the database
 */
function saveServerConfig(guildId, channelId, roleId, welcomeMessage) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO guild_settings (guild_id, welcome_channel_id, role_id, welcome_message)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(guild_id) DO UPDATE SET
       welcome_channel_id = excluded.welcome_channel_id,
       role_id = excluded.role_id,
       welcome_message = excluded.welcome_message`,
      [guildId, channelId, roleId, welcomeMessage],
      err => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
}

/**
 * Get server configuration from the database
 */
function getServerConfig(guildId) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT welcome_channel_id, role_id, welcome_message FROM guild_settings WHERE guild_id = ?`,
      [guildId],
      (err, row) => {
        if (err) return reject(err);
        resolve(row);
      }
    );
  });
}

module.exports = { saveServerConfig, getServerConfig };
