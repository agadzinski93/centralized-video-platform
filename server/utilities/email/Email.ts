"use strict"
import nodemailer from 'nodemailer'
import { AppError } from '../AppError'
import { EMAIL_SECURE, EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } from '../config/config'

/**
 * @param {object} email - email of recipient
 * @param {string} subject - Title of the email
 * @param {string} txtMessage - Plain text version of email
 * @param {string} htmlMessage - HTML version of email
 */
const createEmail = (recipientEmail: string, subject: string, txtMessage: string, htmlMessage: string) => {
    const email = {
        from: EMAIL_USER,
        bcc: recipientEmail,
        subject: subject,
        text: txtMessage,
        html: htmlMessage,
    }
    return email;
}
/**
 * @param {object} email - email object created via the createEmail() method
 */
const sendEmail = async (email: any): Promise<AppError | void> => {
    try {
        const transporter = nodemailer.createTransport({
            host: EMAIL_HOST,
            port: parseInt(EMAIL_PORT),
            secure: (EMAIL_SECURE === 'true') ? true : false,
            auth: {
                user: EMAIL_USER,
                pass: EMAIL_PASS
            },
        });
        await transporter.sendMail(email);
    } catch (err) {
        return new AppError(500, `Error sending email: ${(err as Error).message}`);
    }
}
export { createEmail, sendEmail };