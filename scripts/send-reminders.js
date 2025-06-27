const fs = require('fs');
const path = require('path');
const mysql = require("mysql2/promise");
const nodemailer = require("nodemailer");

// Manually load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
}

async function sendReminders() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: 3306,
  });

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "465"),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  try {
    console.log("Checking for reminders to send...");

    const [tasks] = await connection.execute(
      `SELECT t.id, t.title, t.due_date, u.email, u.timezone
       FROM tasks t
       JOIN users u ON t.user_id = u.id
       WHERE t.is_completed = 0
         AND u.email_notifications = 1
         AND u.email_verified = 1
         AND t.due_date BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL t.reminder_time MINUTE)`
    );

    for (const task of tasks) {
      const mailOptions = {
        from: `"Task Scheduler" <no-reply@${process.env.DOMAIN || 'vivucloud.com'}>`,
        to: task.email,
        subject: `Reminder: ${task.title}`,
        text: `This is a reminder that your task "${task.title}" is due at ${task.due_date}.`,
        html: `<p>This is a reminder that your task "<b>${task.title}</b>" is due at <b>${task.due_date}</b>.</p>`,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Reminder sent for task ${task.id} to ${task.email}`);
    }

    console.log(`Found and sent ${tasks.length} reminders.`);
  } catch (error) {
    console.error("Error sending reminders:", error);
  } finally {
    await connection.end();
  }
}

sendReminders();