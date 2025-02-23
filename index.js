const express = require('express');
const cors = require('cors'); // Add this line

const app = express();
app.use(cors()); // Add this line to enable CORS for all origins
app.use(express.json());

let paymentRequests = [];
let users = [
  { mobile: '9876543210', balance: 1000 }
];

// Health Check
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Store Payment Request
app.post('/paymentcallback', (req, res) => {
  const { utrNumber, mobile } = req.body;
  paymentRequests.push({ utrNumber, mobile, status: 'pending' });
  res.json({ success: true, message: 'Payment submitted, awaiting verification' });
});

// Check Payment Status
app.get('/paymentstatus', (req, res) => {
  const { utrNumber, mobile } = req.query;
  const payment = paymentRequests.find(p => p.utrNumber === utrNumber && p.mobile === mobile);
  res.json({ success: true, status: payment ? payment.status : 'not_found' });
});

// Verify Payment
app.post('/verify', (req, res) => {
  const { utrNumber, mobile, amount } = req.body;
  const payment = paymentRequests.find(p => p.utrNumber === utrNumber && p.mobile === mobile);

  if (payment) {
    payment.status = 'verified';
    const user = users.find(u => u.mobile === mobile);
    if (user) {
      user.balance += parseInt(amount);
    }
    res.json({ success: true, message: 'Payment Verified' });
  }
});

// Update Balance
app.post('/updatebalance', (req, res) => {
  const { mobile, amount } = req.body;
  const user = users.find(u => u.mobile === mobile);
  if (user) {
    user.balance += parseInt(amount);
    res.json({ success: true, balance: user.balance });
  }
});

// Use environment variable PORT or default to 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
