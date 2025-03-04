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

// Directly Added MongoDB Connection String (Updated)
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

// Endpoint to receive UTR and mobile number from utr.html
app.post('/submit-utr', async (req, res) => {
    const { mobile, utrNumber } = req.body;
    try {
        const newUTR = new UTR({ mobile, utrNumber });
        await newUTR.save();
        console.log('UTR Stored in MongoDB:', newUTR);
        res.json({ message: 'UTR Stored Successfully', data: newUTR });
    } catch (error) {
        console.error('Error Storing UTR:', error);
        res.status(500).json({ message: 'Error Storing UTR', error });
    }
});

// Endpoint to get the latest UTR and mobile number for display.html
app.get('/get-utr', async (req, res) => {
    try {
        const latestUTR = await UTR.findOne().sort({ createdAt: -1 });
        if (!latestUTR) {
            return res.json({ mobile: 'N/A', utrNumber: 'N/A', amount: 'N/A' });
        }
        res.json(latestUTR);
    } catch (error) {
        console.error('Error Fetching UTR:', error);
        res.status(500).json({ message: 'Error Fetching UTR', error });
    }
});

// Endpoint to update the amount for a UTR record
app.put('/update-amount', async (req, res) => {
    const { utrId, amount } = req.body;
    try {
        const updatedUTR = await UTR.findByIdAndUpdate(utrId, { amount }, { new: true });
        if (!updatedUTR) {
            return res.status(404).json({ message: 'UTR Record Not Found' });
        }
        console.log('Amount Updated in MongoDB:', updatedUTR);
        res.json({ message: 'Amount Updated Successfully', data: updatedUTR });
    } catch (error) {
        console.error('Error Updating Amount:', error);
        res.status(500).json({ message: 'Error Updating Amount', error });
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
