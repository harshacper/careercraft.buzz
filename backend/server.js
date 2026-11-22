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
const atsRoutes = require('./routes/atsScore');
const assessmentRoutes = require('./routes/assessment');
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

app.use('/api/ats', atsRoutes);
app.use('/ats', atsRoutes);

app.use('/api/assessment', assessmentRoutes);
app.use('/assessment', assessmentRoutes);

const SITEMAP_XML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  <url>
    <loc>https://careercraft.buzz/</loc>
    <lastmod>2026-10-13</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://careercraft.buzz/ats-analyzer</loc>
    <lastmod>2026-10-13</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://careercraft.buzz/ats-score</loc>
    <lastmod>2026-11-22</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://careercraft.buzz/learning-agent</loc>
    <lastmod>2026-11-22</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.95</priority>
  </url>
  <url>
    <loc>https://careercraft.buzz/assessment</loc>
    <lastmod>2026-11-22</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.95</priority>
  </url>
  <url>
    <loc>https://careercraft.buzz/resume</loc>
    <lastmod>2026-10-13</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://careercraft.buzz/skill-gap</loc>
    <lastmod>2026-10-13</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://careercraft.buzz/companies</loc>
    <lastmod>2026-10-13</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://careercraft.buzz/payment</loc>
    <lastmod>2026-10-13</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://careercraft.buzz/chat</loc>
    <lastmod>2026-10-13</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://careercraft.buzz/login</loc>
    <lastmod>2026-10-13</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://careercraft.buzz/signup</loc>
    <lastmod>2026-10-13</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`;

const ROBOTS_TXT = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: https://careercraft.buzz/sitemap.xml`;

app.get(['/sitemap.xml', '/api/sitemap.xml'], (req, res) => {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.send(SITEMAP_XML);
});

app.get(['/robots.txt', '/api/robots.txt'], (req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.send(ROBOTS_TXT);
});

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

