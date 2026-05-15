const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const LoginDetail = require('../models/LoginDetail');
const Admin = require('../models/Admin');

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
};

// Seed default admin
(async () => {
  try {
    // wait for db to sync roughly
    setTimeout(async () => {
      const adminExists = await Admin.findOne({ where: { username: 'harsha8453' } });
      if (!adminExists) {
        await Admin.create({ username: 'harsha8453', password: '845352' });
        console.log('Default admin seeded with user-requested credentials.');
      }
    }, 2000);
  } catch (error) {
    console.error('Error seeding admin', error);
  }
})();

router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Hardcoded fallback override to guarantee access
    if (username === 'harsha8453' && password === '845352') {
      return res.json({ token: generateToken('harsha-admin-override'), username });
    }

    const admin = await Admin.findOne({ where: { username } });
    const isMatch = admin && (await admin.matchPassword(password));

    if (isMatch) {
      res.json({ token: generateToken(admin.id), username: admin.username });
    } else {
      res.status(401).json({ message: 'Invalid Admin Credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/signup', async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password, gender, qualification, experience } = req.body;
    
    const userExists = await User.findOne({ where: { email } });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ 
      fullName, 
      email, 
      phoneNumber, 
      password, 
      gender, 
      qualification, 
      experience,
      lastIp: req.ip
    });
    if (user) {
      res.status(201).json({ 
        _id: user.id, 
        fullName: user.fullName, 
        email: user.email, 
        token: generateToken(user.id) 
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ where: { email } });
    const isMatch = user && (await user.matchPassword(password));

    // Log the login attempt to the database
    await LoginDetail.create({
      email,
      ipAddress: req.ip,
      status: isMatch ? 'Success' : 'Failed',
      userAgent: req.headers['user-agent']
    });

    if (isMatch) {
      // Update last IP on successful login
      user.lastIp = req.ip;
      await user.save();

      res.json({ 
        _id: user.id, 
        fullName: user.fullName, 
        email: user.email, 
        token: generateToken(user.id) 
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
