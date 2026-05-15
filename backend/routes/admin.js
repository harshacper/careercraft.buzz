const express = require('express');
const User = require('../models/User');
const LoginDetail = require('../models/LoginDetail');
const router = express.Router();

// Get all users (Admin only)
router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all login logs (Admin only)
router.get('/logs', async (req, res) => {
  try {
    const logs = await LoginDetail.findAll({
      order: [['timestamp', 'DESC']]
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
