const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

mongoose.connect("mongodb://localhost:27017/ticketDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const ticketSchema = new mongoose.Schema({
  ticketId: Number,
  name: String,
  email: String,
  quantity: Number,
  date: { type: Date, default: Date.now },
});

const Ticket = mongoose.model("Ticket", ticketSchema);

app.post("/api/tickets", async (req, res) => {
  const { ticketId, name, email, quantity } = req.body;

  const newTicket = new Ticket({ ticketId, name, email, quantity });
  try {
    const savedTicket = await newTicket.save();
    res.status(201).json(savedTicket);
  } catch (err) {
    res.status(500).json({ error: "Failed to save ticket" });
  }
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
