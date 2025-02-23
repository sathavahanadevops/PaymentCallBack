const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('views'));

let utrNumber = ''; // Store UTR temporarily

// Endpoint to receive UTR from utr.html
app.post('/submit-utr', (req, res) => {
  utrNumber = req.body.utr;
  res.json({ message: 'UTR Received' });
});

// Endpoint to get the latest UTR for display.html
app.get('/get-utr', (req, res) => {
  res.json({ utr: utrNumber });
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
