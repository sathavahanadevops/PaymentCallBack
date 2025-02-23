app.use(express.static(path.join(__dirname, 'public')));
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('views'));

let utrData = {}; // Store UTR and mobile number temporarily

// Endpoint to receive UTR and mobile number from utr.html
app.post('/submit-utr', (req, res) => {
    const { mobile, utrNumber } = req.body;

    // Store both in-memory (for demo purposes)
    utrData.mobile = mobile;
    utrData.utrNumber = utrNumber;

    console.log('Received UTR:', utrData);

    res.json({ message: 'UTR Received', data: utrData });
});

// Endpoint to get the latest UTR and mobile number for display.html
app.get('/get-utr', (req, res) => {
    res.json({ 
        mobile: utrData.mobile,
        utrNumber: utrData.utrNumber  // Send UTR Number along with mobile
    });
});

// Serve utr.html and display.html
app.get('/utr', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'utr.html'));
});

app.get('/display', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'display.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
