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

// 🔹 MongoDB Connection
const mongoURI = 'mongodb+srv://sathavahana:Kalava1%40%2E@project2025.frxyb.mongodb.net/Project2025?retryWrites=true&w=majority&appName=Project2025';
mongoose.connect(mongoURI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// 🔹 Mongoose Schema and Model
const utrSchema = new mongoose.Schema({
    mobile: { type: String, required: true },
    utrNumber: { type: String, required: true },
    amount: { type: String, default: 'N/A' },
    createdAt: { type: Date, default: Date.now }
});
const UTR = mongoose.model('UTR', utrSchema);

// 🔹 Endpoint to Submit UTR (Avoids Duplicate Entries)
app.post('/submit-utr', async (req, res) => {
    const { mobile, utrNumber } = req.body;

    try {
        // Check if the UTR already exists for the mobile number
        let existingUTR = await UTR.findOne({ mobile, utrNumber });

        if (existingUTR) {
            console.log('✅ UTR Already Exists:', existingUTR);
            return res.json({ message: 'UTR Already Exists', data: existingUTR });
        }

        // If not exists, create a new UTR record
        const newUTR = new UTR({ mobile, utrNumber });
        await newUTR.save();
        console.log('✅ New UTR Stored:', newUTR);
        res.json({ message: 'UTR Stored Successfully', data: newUTR });

    } catch (error) {
        console.error('❌ Error Storing UTR:', error);
        res.status(500).json({ message: 'Error Storing UTR', error });
    }
});

app.get('/get-all-utr', async (req, res) => {
    try {
        // Fetch all UTRs (both processed and unprocessed)
        const allUTRs = await UTR.find().sort({ createdAt: -1 });  // Sort by creation date
        if (!allUTRs || allUTRs.length === 0) {
            return res.json({ message: "No UTRs found", data: [] });
        }
        res.json(allUTRs);  // Return all UTRs
    } catch (error) {
        console.error('❌ Error Fetching UTRs:', error);
        res.status(500).json({ message: 'Error Fetching UTRs', error });
    }
});

// Modify /get-utr to return all UTRs
app.get('/get-utr', async (req, res) => {
    try {
        // Only fetch UTRs where amount is 'N/A' (not processed yet)
        const unprocessedUTRs = await UTR.find({ amount: 'N/A' }).sort({ createdAt: -1 }); // Sort by creation date
        if (!unprocessedUTRs || unprocessedUTRs.length === 0) {
            return res.json({ message: "No UTRs Found", data: [] });
        }
        res.json(unprocessedUTRs);
    } catch (error) {
        console.error('❌ Error Fetching UTRs:', error);
        res.status(500).json({ message: 'Error Fetching UTRs', error });
    }
});

// Endpoint to Update Amount for a Single UTR
app.post('/submit-utr', async (req, res) => {
    const { mobile, utrNumber, amount } = req.body;

    if (!mobile || !utrNumber || !amount) {
        return res.status(400).json({ message: "Mobile, UTR Number, and Amount are required." });
    }

    try {
        // Check if UTR already exists for this mobile number
        let existingUTR = await UTR.findOne({ mobile, utrNumber });

        if (existingUTR) {
            console.log('✅ UTR Already Exists:', existingUTR);
            return res.json({ message: 'UTR Already Exists', data: existingUTR });
        }

        // Convert amount to number to avoid issues
        const amountNumber = parseFloat(amount);
        if (isNaN(amountNumber)) {
            return res.status(400).json({ message: "Invalid amount format." });
        }

        // If UTR doesn't exist, store the new UTR entry
        const newUTR = new UTR({ mobile, utrNumber, amount: amountNumber.toString(), createdAt: new Date() });
        await newUTR.save();

        console.log('✅ New UTR Stored:', newUTR);

        // Update balance in the profile collection
        const updatedProfile = await Profile.findOneAndUpdate(
            { mobile: mobile },
            { $inc: { balance: amountNumber } },
            { new: true } // Return updated document
        );

        if (!updatedProfile) {
            return res.status(404).json({ message: "Profile not found for this mobile number." });
        }

        console.log('✅ Balance Updated for Profile:', updatedProfile);

        res.json({
            message: "UTR Stored & Balance Updated Successfully",
            utr: newUTR,
            profile: updatedProfile
        });

    } catch (error) {
        console.error('❌ Error Processing UTR:', error);
        res.status(500).json({ message: 'Internal Server Error', error });
    }
});

// 🔹 Serve `utr.html` and `display.html`
app.get('/utr', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'utr.html'));
});
app.get('/display', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'display.html'));
});

// 🔹 Health Check Endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'UP' });
});

// 🔹 Start the Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
