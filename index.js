const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Define utrData to avoid undefined variable error
let utrData = {};

// MongoDB Connection
const mongoURI = 'mongodb+srv://sathavahana:Kalava1%40%2E@project2025.frxyb.mongodb.net/Project2025?retryWrites=true&w=majority&appName=Project2025';
mongoose.connect(mongoURI)
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

// Endpoint to receive UTR and mobile number
app.post('/submit-utr', (req, res) => {
    const { mobile, utrNumber } = req.body;
    utrData = { mobile, utrNumber };
    console.log('Received UTR:', utrData);
    res.json({ message: 'UTR Received', data: utrData });
});

// Endpoint to get the latest UTR details from MongoDB
app.get('/get-utr', async (req, res) => {
    try {
        const latestUTR = await UTR.findOne().sort({ createdAt: -1 });
        res.json(latestUTR || { mobile: 'N/A', utrNumber: 'N/A', amount: 'N/A' });
    } catch (error) {
        console.error('Error fetching latest UTR:', error);
        res.status(500).json({ message: 'Error fetching data' });
    }
});

// Endpoint to receive Amount and store in MongoDB
app.post('/submit-amount', async (req, res) => {
    const { mobile, utrNumber, amount } = req.body;
    try {
        const newUTR = new UTR({ mobile, utrNumber, amount });
        await newUTR.save();
        console.log('Amount Stored in MongoDB:', newUTR);
        res.json({ message: 'Amount Stored Successfully', data: newUTR });
    } catch (error) {
        console.error('Error Storing Amount:', error);
        res.status(500).json({ message: 'Error Storing Amount', error });
    }
});

// Serve frontend files
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
