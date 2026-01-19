import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

let transporter;

const createTransporter = async () => {
    if (process.env.SMTP_HOST) {
        // Real SMTP
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    } else {
        // Ethereal (Mock)
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
        console.log('📧 Mock Email Service Ready');
        console.log(`📧 Test Account: ${testAccount.user}`);
    }
};

// Initialize on start
createTransporter();

export const sendEmail = async ({ to, subject, text, html }) => {
    if (!transporter) await createTransporter();

    try {
        const info = await transporter.sendMail({
            from: '"Support System" <support@example.com>',
            to,
            subject,
            text,
            html,
        });

        console.log(`📧 Email sent: ${info.messageId}`);
        // Preview only available when sending through an Ethereal account
        if (nodemailer.getTestMessageUrl(info)) {
            console.log(`📧 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
        }
    } catch (error) {
        console.error('❌ Error sending email:', error);
    }
};
