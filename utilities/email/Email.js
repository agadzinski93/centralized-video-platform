"use strict"
const nodemailer = require("nodemailer");
const AppError = require("../AppError");

module.exports = {
    /**
     * @param {object} email - email of recipient
     * @param {string} subject - Title of the email
     * @param {string} txtMessage - Plain text version of email
     * @param {string} htmlMessage - HTML version of email
     */
    createEmail:(recipientEmail,subject,txtMessage,htmlMessage)=>{
        const email = {
            from:process.env.EMAIL_USER,
            bcc:recipientEmail,
            subject:subject,
            text:txtMessage,
            html:htmlMessage,
        }
        return email;
    },
    /**
     * @param {object} email - email object created via the createEmail() method
     */
    sendEmail:async(email)=>{
        try {
            const transporter = nodemailer.createTransport({
                host:process.env.EMAIL_HOST,
                port:process.env.EMAIL_PORT,
                secure:true,
                auth:{
                    user:process.env.EMAIL_USER,
                    pass:process.env.EMAIL_PASS
                },
            });
            let info = await transporter.sendMail(email);
        }catch(err) {
            return new AppError(500,`Error sending email: ${err.message}`);
        }
        
    },
}