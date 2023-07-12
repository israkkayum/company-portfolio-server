const express = require("express");
const multer = require("multer");
const nodemailer = require("nodemailer");

require("dotenv").config();
const cors = require("cors");

const port = process.env.PORT || 6500;

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// Set up multer storage and file upload middleware
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

app.post("/send-email", upload.single("file"), (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    position,
    experience,
    address,
  } = req.body;
  const file = req.file;

  // Create a Nodemailer transporter
  const transporter = nodemailer.createTransport({
    // Configure your email provider details here
    service: "Gmail",
    auth: {
      user: `${process.env.DB_EMAIL}`,
      pass: `${process.env.DB_PASS}`,
    },
  });

  // Define the email options
  const mailOptions = {
    from: email,
    to: `${process.env.DB_EMAIL}`,
    subject: "Apply for Job",
    text: `Name: ${
      firstName + " " + lastName
    }\nEmail: ${email}\nPhone Number: ${phoneNumber}\nPosition: ${position}\nExperience: ${experience}\nAddress: ${address}`,
    attachments: [
      {
        filename: file.originalname,
        path: require("path").resolve(file.path),
      },
    ],
  };

  // Send the email using the transporter
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: "Error sending email" });
    } else {
      console.log("Email sent:", info.response);
      res.json({ success: "Email sent successfully" });
    }
  });
});

app.listen(6500, () => {
  console.log("Server is running on port 6500");
});
