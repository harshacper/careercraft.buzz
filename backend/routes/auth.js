const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'careercraft_secret_key_2024', { expiresIn: '30d' });
};

const getCleanIp = (req) => {
  let ip = req.headers['x-forwarded-for'] || req.ip || req.connection?.remoteAddress || '127.0.0.1';
  if (ip.includes(',')) {
    ip = ip.split(',')[0].trim();
  }
  if (ip === '::1' || ip === '::ffff:127.0.0.1') {
    ip = '127.0.0.1';
  }
  return ip.slice(0, 45);
};

// Admin Login
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Hardcoded fallback override
    if (username === 'harsha8453' && password === '845352') {
      return res.json({ token: generateToken('harsha-admin-override'), username });
    }

    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('username', username)
      .maybeSingle();

    if (error || !admin) {
      return res.status(401).json({ message: 'Invalid Admin Credentials' });
    }

    const isMatch = (password === admin.password) || (await bcrypt.compare(password, admin.password));

    if (isMatch) {
      res.json({ token: generateToken(admin.id), username: admin.username });
    } else {
      res.status(401).json({ message: 'Invalid Admin Credentials' });
    }
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: error.message || 'Admin login failed' });
  }
});

// User Signup
router.post('/signup', async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password, gender, qualification, experience } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const normalizedEmail = email.toLowerCase().trim();
    const cleanIp = getCleanIp(req);
    
    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email address' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userDisplayName = fullName || 'CareerCraft Member';

    // Create user in Supabase with both name and full_name to satisfy all schema variations
    const userPayload = { 
      name: userDisplayName,
      full_name: userDisplayName, 
      email: normalizedEmail, 
      phone_number: phoneNumber || 'N/A', 
      password: hashedPassword, 
      gender: gender || 'other', 
      qualification: qualification || 'N/A', 
      experience: experience || 'Aspiring Professional',
      skills: { skillsList: [], subscription: 'none', credits: 2, freeTrialsInitialized: true },
      last_ip: cleanIp
    };

    let { data: user, error } = await supabase
      .from('users')
      .insert([userPayload])
      .select()
      .single();

    // Fallback if specific extended columns are missing in database
    if (error && (error.message?.includes('column') || error.code === '42703')) {
      console.warn('Retrying user insert with minimal schema fields due to:', error.message);
      const minimalPayload = {
        name: userDisplayName,
        email: normalizedEmail,
        password: hashedPassword
      };
      const retryResult = await supabase
        .from('users')
        .insert([minimalPayload])
        .select()
        .single();
      
      user = retryResult.data;
      error = retryResult.error;
    }

    if (error) {
      console.error('Supabase user creation error:', error);
      throw error;
    }

    // Log login attempt safely
    try {
      await supabase
        .from('login_details')
        .insert([
          {
            email: normalizedEmail,
            ip_address: cleanIp,
            status: 'Success',
            user_agent: req.headers['user-agent'] || 'WebClient'
          }
        ]);
    } catch (logErr) {
      console.warn('Could not log signup attempt:', logErr.message);
    }

    res.status(201).json({ 
      _id: user.id, 
      fullName: user.full_name, 
      email: user.email, 
      role: user.experience || 'Aspiring Professional',
      token: generateToken(user.id) 
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: error.message || 'Signup failed' });
  }
});

// User Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const normalizedEmail = email.toLowerCase().trim();
    const cleanIp = getCleanIp(req);
    
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (error) {
      console.error('Supabase user search error:', error);
    }

    const isMatch = user && (await bcrypt.compare(password, user.password));

    // Log the login attempt safely
    try {
      await supabase
        .from('login_details')
        .insert([
          {
            email: normalizedEmail,
            ip_address: cleanIp,
            status: isMatch ? 'Success' : 'Failed',
            user_agent: req.headers['user-agent'] || 'WebClient'
          }
        ]);
    } catch (logErr) {
      console.warn('Could not log login attempt:', logErr.message);
    }

    if (isMatch) {
      // Update last IP safely
      try {
        await supabase
          .from('users')
          .update({ last_ip: cleanIp })
          .eq('id', user.id);
      } catch (ipErr) {
        console.warn('Could not update user last_ip:', ipErr.message);
      }

      return res.json({ 
        _id: user.id, 
        fullName: user.full_name || user.name || 'CareerCraft Member', 
        email: user.email, 
        role: user.experience || 'Aspiring Professional',
        token: generateToken(user.id) 
      });
    } else {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: error.message || 'Login failed' });
  }
});

// Google Login
router.post('/google-login', async (req, res) => {
  try {
    const { email, fullName } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    const normalizedEmail = email.toLowerCase().trim();
    const cleanIp = getCleanIp(req);
    
    // Check if user exists
    let { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (!user) {
      // Create a new user with dummy hashed password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('google-auth-mock-bypass-' + Math.random(), salt);
      
      const googleDisplayName = fullName || normalizedEmail.split('@')[0];
      const googlePayload = { 
        name: googleDisplayName,
        full_name: googleDisplayName, 
        email: normalizedEmail, 
        phone_number: 'N/A', 
        password: hashedPassword, 
        gender: 'other', 
        qualification: 'N/A', 
        experience: 'Google Authorized User',
        skills: { skillsList: [], subscription: 'none', credits: 2, freeTrialsInitialized: true },
        last_ip: cleanIp
      };

      let { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([googlePayload])
        .select()
        .single();

      if (insertError && (insertError.message?.includes('column') || insertError.code === '42703')) {
        const minimalGoogle = {
          name: googleDisplayName,
          email: normalizedEmail,
          password: hashedPassword
        };
        const retryGoogle = await supabase
          .from('users')
          .insert([minimalGoogle])
          .select()
          .single();
        newUser = retryGoogle.data;
        insertError = retryGoogle.error;
      }

      if (insertError) throw insertError;
      user = newUser;
    } else {
      // Update last IP safely
      try {
        await supabase
          .from('users')
          .update({ last_ip: cleanIp })
          .eq('id', user.id);
      } catch (ipErr) {
        console.warn('Could not update user last_ip:', ipErr.message);
      }
    }

    // Log the login attempt safely
    try {
      await supabase
        .from('login_details')
        .insert([
          {
            email: normalizedEmail,
            ip_address: cleanIp,
            status: 'Success',
            user_agent: req.headers['user-agent'] || 'WebClient'
          }
        ]);
    } catch (logErr) {
      console.warn('Could not log google login attempt:', logErr.message);
    }

    return res.json({ 
      _id: user.id, 
      fullName: user.full_name, 
      email: user.email, 
      role: user.experience || 'Google Authorized User',
      token: generateToken(user.id) 
    });
  } catch (error) {
    console.error('Google login error:', error);
    return res.status(500).json({ message: error.message || 'Google login failed' });
  }
});

module.exports = router;
