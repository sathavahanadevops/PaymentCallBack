const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Mock Database
let paymentRequests = [];
let users = [
  { mobile: '9876543210', balance: 1000 }
];

// Hardcoded Admin Credentials (Change for Production!)
const adminCredentials = {
  username: 'admin',
  password: 'securepassword'  // Change this to a stronger password!
};

// Health Check
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Store Payment Request
app.post('/paymentcallback', (req, res) => {
  const { utr, mobile } = req.body;
  if (utr && mobile) {
    paymentRequests.push({ utr, mobile, status: 'pending' });
    res.json({ success: true, message: 'Payment submitted, awaiting verification' });
  } else {
    res.status(400).json({ success: false, message: 'UTR and Mobile are required' });
  }
});

// Check Payment Status
app.get('/paymentstatus', (req, res) => {
  const { utr, mobile } = req.query;
  const payment = paymentRequests.find(p => p.utr === utr && p.mobile === mobile);

  if (payment) {
    res.json({ success: true, status: payment.status });
  } else {
    res.json({ success: false, status: 'not_found' });
  }
});

// Admin Login
app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;

  if (username === adminCredentials.username && password === adminCredentials.password) {
    res.json({ success: true, message: 'Admin authenticated' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Get Pending Payment Requests (Admin Only)
app.get('/admin/pending', (req, res) => {
  res.json(paymentRequests.filter(p => p.status === 'pending'));
});

// Verify Payment (Admin Only)
app.post('/verify', (req, res) => {
  const { utr, mobile, amount } = req.body;
  const payment = paymentRequests.find(p => p.utr === utr && p.mobile === mobile);

  if (payment && payment.status === 'pending') {
    payment.status = 'verified';
    const user = users.find(u => u.mobile === mobile);

    if (user) {
      user.balance += parseInt(amount);
    }

    res.json({ success: true, message: 'Payment Verified' });
  } else {
    res.status(404).json({ success: false, message: 'Payment not found or already verified' });
  }
});

// Reject Payment (Admin Only)
app.post('/reject', (req, res) => {
  const { utr, mobile } = req.body;
  const payment = paymentRequests.find(p => p.utr === utr && p.mobile === mobile);

  if (payment && payment.status === 'pending') {
    payment.status = 'failed';
    res.json({ success: true, message: 'Payment Rejected' });
  } else {
    res.status(404).json({ success: false, message: 'Payment not found or already processed' });
  }
});

// Use environment variable PORT or default to 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
