const nodemailer=require('nodemailer');


const sendMail=async options=>{
    // Create a tranponder

    const transporter=nodemailer.createTransport({
        // service:'Gmail',
        // auth:{
        //     user:process.env.Email_UserName,
        //     pass:process.env.Email_UserPassword
        // }
        host: "smtp.mailtrap.io",
        port: 25,
        auth: {
            user: "721e625426b1ce",
            pass: "cadb9becc4a2d6"
        }
    })
    // Define the email options
    const mailOptions={
        from:'Joel test@admin.com',
        to:options.email,
        subject:options.subject,
        text:options.message,
        html:`<h4> <a href=${options.url}> use this link to reset the password </a></h4>`
    }
    // Send The mail
    await transporter.sendMail(mailOptions)

}
module.exports=sendMail;