"use strict"
const nodemailer = require("nodemailer");
const AppError = require("../AppError");

module.exports = {
    /**
     * @param {object} email - email of recipient
     * @param {string} subject - Title of the email
     * @param {string} txtMessage - Plain text version of email
     * @param {string} htmlmessage - HTML version of email
     */
    sendEmail:async(email,subject,txtmessage,htmlmessage)=>{
        let transporter = nodemailer.createTransport({
            host:process.env.EMAIL_HOST,
            port:process.env.EMAIL_PORT,
            secure:true,
            auth:{
                user:process.env.EMAIL_USER,
                pass:process.env.EMAIL_PASS
            }
        });
        try {
            let info = await transporter.sendMail({
                from:process.env.EMAIL_USER.toString(),
                to:email,
                subject:subject,
                text:txtmessage,
                html:htmlmessage
            });
        }catch(err) {
            return new AppError(500,`Error sending email: ${err.message}`);
        }
        
    }
}