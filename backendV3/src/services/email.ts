import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const sendEmail = async (to: string, subject: string, html: string) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: subject,
            html: html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully:', info.response);
        return info;
    } catch (error) {
        console.error('❌ Error sending email:', error);
        throw error;
    }
};
