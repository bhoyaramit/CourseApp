import { createTransport } from "nodemailer";


export const sendEmail = async(to, subject , text)=>{
 const transporter=  createTransport({

    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "bd978962a66a29",
      pass: "d34583b451caf6"
    },
 })
 await transporter.sendMail({
    to,
    subject,
    text,
  });
}


