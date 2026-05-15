require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');

const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const adminRoutes = require('./routes/admin');
const skillGapRoutes = require('./routes/skillGap');

const app = express();
app.use(express.json({ limit: '10mb' })); // Increased limit for base64 resumes
app.use(cors());

// Connect to SQLite Database
connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/skill-gap', skillGapRoutes);

app.get('/', (req, res) => {
  res.send('AI Career Navigator API (SQL Version) is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
