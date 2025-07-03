// Database initialization script
const mysql = require("mysql2/promise")

require('dotenv').config({ path: '.env.local' });

async function initializeDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: 3306,
  })

  await connection.query(`DROP DATABASE IF EXISTS \`${process.env.DB_DATABASE}\``);
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_DATABASE}\``);
  await connection.changeUser({ database: process.env.DB_DATABASE });

  try {
    console.log("Initializing database...")

    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        is_active TINYINT(1) DEFAULT 1,
        last_login TIMESTAMP NULL,
        email_verified TINYINT(1) DEFAULT 0,
        email_notifications TINYINT(1) DEFAULT 0,
        timezone VARCHAR(100) DEFAULT 'Asia/Ho_Chi_Minh'

      )
    `)

    // Create tasks table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(50) NOT NULL,
        due_date DATETIME NOT NULL,
        reminder_time INT NOT NULL DEFAULT 60,
        is_recurring BOOLEAN DEFAULT FALSE,
        recurring_type ENUM('daily', 'weekly', 'monthly') NULL,
        is_completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP NULL,
        recurring_count INT DEFAULT 0,
        recurring_cycles INT DEFAULT 1,
        recurring_series_id BIGINT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_recurring_series_id (recurring_series_id)
      )
    `)

    // Create activity logs table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        admin_id INT,
        action VARCHAR(100) NOT NULL,
        description TEXT,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `)

    // Create app configurations table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS app_configurations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        config_key VARCHAR(100) UNIQUE NOT NULL,
        config_value TEXT,
        description TEXT,
        updated_by INT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `)

    // Insert default configurations
    await connection.execute(`
      INSERT IGNORE INTO app_configurations (config_key, config_value, description) VALUES
      ('app_name', 'Task Scheduler', 'Application name'),
      ('max_tasks_per_user', '100', 'Maximum tasks per user'),
      ('session_timeout', '24', 'Session timeout in hours'),
      ('email_notifications', 'true', 'Enable email notifications'),
      ('maintenance_mode', 'false', 'Maintenance mode status'),
      ('registration_enabled', 'true', 'Allow new user registration'),
      ('default_reminder_time', '60', 'Default reminder time in minutes'),
      ('backup_frequency', '24', 'Backup frequency in hours')
    `)

    // Create default admin user
    const bcrypt = require("bcryptjs")
    const passwordHash = await bcrypt.hash("admin123", 12)

    await connection.execute(
      `INSERT IGNORE INTO users (username, email, password_hash, role, timezone) VALUES
      ('admin', 'admin@${process.env.DOMAIN || 'vivucloud.com'}', ?, 'admin', 'Asia/Ho_Chi_Minh')`,
      [passwordHash],
    )

    // Create sample user
    const userPasswordHash = await bcrypt.hash("user123", 12)
    await connection.execute(
      `INSERT IGNORE INTO users (username, email, password_hash, role, timezone) VALUES
      ('testuser', 'user@${process.env.DOMAIN || 'vivucloud.com'}', ?, 'user', 'Asia/Ho_Chi_Minh')`,
      [userPasswordHash],
    )

    // Get user ID for sample tasks
    const [users] = await connection.execute("SELECT id FROM users WHERE username = ?", ["testuser"])
    if (users.length > 0) {
      const userId = users[0].id

      // Insert sample tasks
      await connection.execute(
        `
        INSERT IGNORE INTO tasks (user_id, title, description, category, due_date, reminder_time, is_recurring, recurring_type, is_completed) VALUES
        (?, 'Pay electricity bill', 'Monthly electricity bill payment', 'electricity-bill', DATE_ADD(NOW(), INTERVAL 5 DAY), 60, true, 'monthly', false),
        (?, 'Server renewal', 'Renew hosting server subscription', 'server-renewal', DATE_ADD(NOW(), INTERVAL 10 DAY), 120, false, null, false),
        (?, 'Water bill payment', 'Pay monthly water bill', 'water-bill', DATE_ADD(NOW(), INTERVAL 3 DAY), 60, true, 'monthly', false),
        (?, 'Completed task example', 'This is a completed task', 'other', DATE_SUB(NOW(), INTERVAL 1 DAY), 60, false, null, true)
      `,
        [userId, userId, userId, userId],
      )
    }

    console.log("Database initialized successfully!")
    console.log("Default admin user: admin / admin123")
    console.log("Sample user: testuser / user123")
  } catch (error) {
    console.error("Database initialization failed:", error)
  } finally {
    await connection.end()
  }
}

initializeDatabase()
