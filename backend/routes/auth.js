const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
};

// Admin Login
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Hardcoded fallback override
    if (username === 'harsha8453' && password === '845352') {
      return res.json({ token: generateToken('harsha-admin-override'), username });
    }

    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !admin) {
      return res.status(401).json({ message: 'Invalid Admin Credentials' });
    }

    // Since we seeded the admin with plain text password in the SQL script, 
    // we should check both hashed and plain text for compatibility.
    const isMatch = (password === admin.password) || (await bcrypt.compare(password, admin.password));

    if (isMatch) {
      res.json({ token: generateToken(admin.id), username: admin.username });
    } else {
      res.status(401).json({ message: 'Invalid Admin Credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// User Signup
router.post('/signup', async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password, gender, qualification, experience } = req.body;
    
    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user in Supabase
    const { data: user, error } = await supabase
      .from('users')
      .insert([
        { 
          full_name: fullName, 
          email, 
          phone_number: phoneNumber, 
          password: hashedPassword, 
          gender, 
          qualification, 
          experience,
          last_ip: req.ip
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ 
      _id: user.id, 
      fullName: user.full_name, 
      email: user.email, 
      role: user.experience || 'Aspiring Professional',
      token: generateToken(user.id) 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// User Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    const isMatch = user && (await bcrypt.compare(password, user.password));

    // Log the login attempt
    await supabase
      .from('login_details')
      .insert([
        {
          email,
          ip_address: req.ip,
          status: isMatch ? 'Success' : 'Failed',
          user_agent: req.headers['user-agent']
        }
      ]);

    if (isMatch) {
      // Update last IP
      await supabase
        .from('users')
        .update({ last_ip: req.ip })
        .eq('id', user.id);

      res.json({ 
        _id: user.id, 
        fullName: user.full_name, 
        email: user.email, 
        role: user.experience || 'Aspiring Professional',
        token: generateToken(user.id) 
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Google Login / Signup
router.post('/google-login', async (req, res) => {
  try {
    const { email, fullName } = req.body;
    
    // Check if user exists
    let { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (!user) {
      // Create a new user with dummy hashed password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('google-auth-mock-bypass-' + Math.random(), salt);
      
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([
          { 
            full_name: fullName, 
            email, 
            phone_number: 'N/A', 
            password: hashedPassword, 
            gender: 'other', 
            qualification: 'N/A', 
            experience: 'Google Authorized User',
            last_ip: req.ip
          }
        ])
        .select()
        .single();

      if (insertError) throw insertError;
      user = newUser;
    } else {
      // Update last IP
      await supabase
        .from('users')
        .update({ last_ip: req.ip })
        .eq('id', user.id);
    }

    // Log the login attempt
    await supabase
      .from('login_details')
      .insert([
        {
          email,
          ip_address: req.ip,
          status: 'Success',
          user_agent: req.headers['user-agent']
        }
      ]);

    res.json({ 
      _id: user.id, 
      fullName: user.full_name, 
      email: user.email, 
      role: user.experience || 'Google Authorized User',
      token: generateToken(user.id) 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
