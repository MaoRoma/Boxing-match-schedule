// boxing-backend/index.js
const express = require("express");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

// Enable CORS and JSON parsing
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/boxing-matches");

// Feedback Schema
const feedbackSchema = new mongoose.Schema({
  name: String,
  email: String,
  feedback: String,
  createdAt: { type: Date, default: Date.now },
});

const Feedback = mongoose.model("Feedback", feedbackSchema);

// Purchase Schema
const purchaseSchema = new mongoose.Schema({
  buyerName: String,
  email: String,
  matchId: String,
  matchName: String,
  purchaseDate: { type: Date, default: Date.now },
});

const Purchase = mongoose.model("Purchase", purchaseSchema);

// Test route to verify server is running
app.get("/test", (req, res) => {
  res.json({ message: "Server is running" });
});

// Feedback endpoint
app.post("/feedback", async (req, res) => {
  console.log("Received feedback:", req.body); // Debug log

  const { name, email, feedback } = req.body;

  // Validate input
  if (!name || !email || !feedback) {
    return res.status(400).json({
      message: "Missing required fields",
      received: { name, email, feedback },
    });
  }

  try {
    // Save feedback to database
    const newFeedback = new Feedback({
      name,
      email,
      feedback,
    });
    await newFeedback.save();

    // Send email notification
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "maoroma2017@gmail.com",
        pass: "fivn aovr rfld xwux",
      },
    });

    const mailOptions = {
      from: "maoroma2017@gmail.com",
      to: "maoroma2017@gmail.com",
      subject: `New Feedback from ${name}`,
      text: `
        Name: ${name}
        Email: ${email}
        Feedback: ${feedback}
        Time: ${new Date().toLocaleString()}
      `,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Email error:", err);
        return res.status(500).json({
          message: "Error sending email notification.",
          error: err.message,
        });
      }
      res.status(200).json({
        message: "Feedback submitted successfully.",
        emailInfo: info.response,
      });
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      message: "Error saving feedback.",
      error: error.message,
    });
  }
});

// Purchase ticket endpoint
app.post("/purchase", async (req, res) => {
  console.log("Received purchase request:", req.body);

  const { buyerName, email, matchId, matchName } = req.body;

  // Validate input
  if (!buyerName || !email || !matchId) {
    return res.status(400).json({
      message: "Missing required fields",
      received: { buyerName, email, matchId },
    });
  }

  try {
    // Save purchase to database
    const newPurchase = new Purchase({
      buyerName,
      email,
      matchId,
      matchName,
    });
    await newPurchase.save();

    // Generate ticket ID
    const ticketId = newPurchase._id.toString();

    // Send email confirmation
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "maoroma2017@gmail.com", // Your Gmail
        pass: "fivn aovr rfld xwux", // Your app password
      },
    });

    const mailOptions = {
      from: "maoroma2017@gmail.com",
      to: email,
      subject: `Boxing Match Ticket Confirmation - ${matchName}`,
      text: `
        Dear ${buyerName},

        Thank you for purchasing a ticket for ${matchName}!

        Your ticket details:
        - Match: ${matchName}
        - Ticket ID: ${ticketId}
        - Purchase Date: ${new Date().toLocaleString()}

        Please keep this email as your ticket confirmation.

        Enjoy the match!
      `,
      html: `
        <h2>Boxing Match Ticket Confirmation</h2>
        <p>Dear ${buyerName},</p>
        <p>Thank you for purchasing a ticket for <strong>${matchName}</strong>!</p>
        <h3>Your ticket details:</h3>
        <ul>
          <li>Match: ${matchName}</li>
          <li>Ticket ID: ${ticketId}</li>
          <li>Purchase Date: ${new Date().toLocaleString()}</li>
        </ul>
        <p>Please keep this email as your ticket confirmation.</p>
        <p><strong>Enjoy the match!</strong></p>
      `,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Email error:", err);
        return res.status(500).json({
          message: "Error sending confirmation email.",
          error: err.message,
        });
      }
      res.status(200).json({
        message: "Ticket purchased successfully.",
        ticketId: ticketId,
        emailInfo: info.response,
      });
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      message: "Error processing purchase.",
      error: error.message,
    });
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
