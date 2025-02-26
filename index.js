const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Add this line to fix the ReferenceError:
let utrData = {}; // Store UTR and mobile number temporarily

// MongoDB Connection
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Mongoose Schema and Model
const utrSchema = new mongoose.Schema({
    mobile: String,
    utrNumber: String,
    amount: String,
    createdAt: { type: Date, default: Date.now }
});
const UTR = mongoose.model('UTR', utrSchema);

// Endpoint to receive UTR and mobile number from utr.html
app.post('/submit-utr', (req, res) => {
    const { mobile, utrNumber } = req.body;

    // Store UTR and Mobile in-memory for display
    utrData.mobile = mobile;
    utrData.utrNumber = utrNumber;

    console.log('Received UTR:', utrData);

    res.json({ message: 'UTR Received', data: utrData });
});

// Endpoint to get the latest UTR and mobile number for display.html
app.get('/get-utr', (req, res) => {
    res.json({ 
        mobile: utrData.mobile,
        utrNumber: utrData.utrNumber,
        amount: utrData.amount || 'N/A' // Send Amount if available
    });
});

// Endpoint to receive Amount and store in MongoDB
app.post('/submit-amount', async (req, res) => {
    const { mobile, utrNumber, amount } = req.body;

    try {
        // Save to MongoDB
        const newUTR = new UTR({ mobile, utrNumber, amount });
        await newUTR.save();

        console.log('Amount Stored in MongoDB:', newUTR);

        res.json({ message: 'Amount Stored Successfully', data: newUTR });
    } catch (error) {
        console.error('Error Storing Amount:', error);
        res.status(500).json({ message: 'Error Storing Amount', error });
    }
});

// Serve utr.html and display.html
app.get('/utr', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'utr.html'));
});
app.get('/display', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'display.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'UP' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
