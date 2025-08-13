const nodemailer = require('nodemailer');

const transpoter = nodemailer.createTransport({
    host : process.env.SMTP_HOST,
    port : process.env.SMTP_PORT,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
})

const sendSMTPEmail = async (to, subject, text) => {
    try {
        const mailOptions = {
            from : process.env.SMTP_USER,
            to,
            subject,
            text
        }
        const response = await transpoter.sendMail(mailOptions);
        console.log('Email sent successfully To Message ID:', response.messageId);
        
    } catch (error) {
        console.log(error);
        console.log('Failed to send email');
    }
}

module.exports = sendSMTPEmail;