const express = require('express');
const supabase = require('../config/supabase');
const router = express.Router();

// Get all users (Admin only)
router.get('/users', async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, full_name, email, phone_number, gender, qualification, experience, last_ip, created_at');

    if (error) throw error;
    
    // Map snake_case to camelCase for frontend compatibility if needed
    const mappedUsers = users.map(u => ({
      id: u.id,
      fullName: u.full_name,
      email: u.email,
      phoneNumber: u.phone_number,
      gender: u.gender,
      qualification: u.qualification,
      experience: u.experience,
      lastIp: u.last_ip,
      createdAt: u.created_at
    }));

    res.json(mappedUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all login logs (Admin only)
router.get('/logs', async (req, res) => {
  try {
    const { data: logs, error } = await supabase
      .from('login_details')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) throw error;

    // Map snake_case to camelCase
    const mappedLogs = logs.map(l => ({
      id: l.id,
      email: l.email,
      ipAddress: l.ip_address,
      status: l.status,
      userAgent: l.user_agent,
      timestamp: l.timestamp
    }));

    res.json(mappedLogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
