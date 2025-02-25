require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');

const app = express();
const client = new OAuth2Client(process.env.REACT_APP_GOOGLE_CLIENT_ID);
// console.log("REACT_APP_GOOGLE_CLIENT_ID", process.env.REACT_APP_GOOGLE_CLIENT_ID);
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(express.json());

// Verify Google token
async function verifyGoogleToken(token) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.REACT_APP_GOOGLE_CLIENT_ID
    });
    return ticket.getPayload();
  } catch (error) {
    console.error('Error verifying Google token:', error);
    return null;
  }
}

// Google authentication endpoint
app.post('/api/auth/google', async (req, res) => {
  const { token } = req.body;
  console.log("token", token);
  const payload = await verifyGoogleToken(token);
  console.log("payload", payload);
  if (!payload) {
    return res.status(400).json({ error: 'Invalid token' });
  }

  const jwtToken = jwt.sign(
    {
      email: payload.email,
      name: payload.name,
      picture: payload.picture
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.json({
    token: jwtToken,
    user: {
      email: payload.email,
      name: payload.name,
      picture: payload.picture
    }
  });
});

// Verify JWT token middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Protected route example
app.get('/api/user/profile', verifyToken, (req, res) => {
  res.json({ user: req.user });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
