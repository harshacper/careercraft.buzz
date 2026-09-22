const path = require('path');
try {
  require('dotenv').config({ path: path.resolve(__dirname, '.env') });
  require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
  require('dotenv').config();
} catch (e) {
  // Ignore dotenv errors in serverless
}

const express = require('express');
const cors = require('cors');
// const { connectDB } = require('./config/db');
const supabase = require('./config/supabase');

const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const adminRoutes = require('./routes/admin');
const skillGapRoutes = require('./routes/skillGap');
const paymentRoutes = require('./routes/payment');
const aiRoutes = require('./routes/aiChat');
const appointmentRoutes = require('./routes/appointments');
const { initAppointmentDb } = require('./models/appointmentModels');

const app = express();
app.use(express.json({ limit: '10mb' })); // Increased limit for base64 resumes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Normalize /_/backend prefix or /api/index.js if present
app.use((req, res, next) => {
  if (req.url.startsWith('/_/backend')) {
    req.url = req.url.replace(/^\/_\/backend/, '') || '/';
  }
  next();
});

// Initialize Appointment and Customer Database Models
try {
  initAppointmentDb();
} catch (err) {
  console.error('Database init skipped/error:', err.message);
}

// Mount routes on both /api/* and direct /*
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/chat', chatRoutes);
app.use('/chat', chatRoutes);

app.use('/api/admin', adminRoutes);
app.use('/admin', adminRoutes);

app.use('/api/skill-gap', skillGapRoutes);
app.use('/skill-gap', skillGapRoutes);

app.use('/api/payment', paymentRoutes);
app.use('/payment', paymentRoutes);

app.use('/api/ai', aiRoutes);
app.use('/ai', aiRoutes);

app.use('/api/appointments', appointmentRoutes);
app.use('/appointments', appointmentRoutes);

app.get(['/api/health', '/health', '/api', '/'], (req, res) => {
  res.json({ status: 'ok', message: 'AI Career Navigator API is running...' });
});

// Express error handling middleware
app.use((err, req, res, next) => {
  console.error('Express server error:', err);
  res.status(500).json({
    error: err.message || 'Internal server error',
    path: req.path
  });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL && require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;

