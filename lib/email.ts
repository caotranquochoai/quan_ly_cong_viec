import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendEmail = async (to: string, subject: string, text: string, html: string) => {
  const mailOptions = {
    from: `"Task Scheduler" <no-reply@${process.env.DOMAIN || 'vivucloud.com'}>`,
    to,
    subject,
    text,
    html,
  };

  await transporter.sendMail(mailOptions);
};