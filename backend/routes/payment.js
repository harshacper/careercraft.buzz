const express = require('express');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

const router = express.Router();

// Authentication middleware
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      req.user = decoded;
      next();
    } catch (error) {
      console.error('Token validation failed:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Helper to parse subscription status from skills column
const getUserPaymentState = (skillsText) => {
  try {
    const parsed = JSON.parse(skillsText);
    if (parsed && typeof parsed === 'object' && ('subscription' in parsed || 'credits' in parsed)) {
      return {
        skillsList: parsed.skillsList || [],
        subscription: parsed.subscription || 'none',
        credits: parsed.credits || 0
      };
    }
  } catch (e) {
    // skillsText is not JSON (it is plain comma-separated text)
  }

  // Default fallback if skills is plain text or empty
  const skillsArray = skillsText ? skillsText.split(',').map(s => s.trim()).filter(Boolean) : [];
  return {
    skillsList: skillsArray,
    subscription: 'none',
    credits: 0
  };
};

// @desc    Get user subscription and credit status
// @route   GET /api/payment/status
// @access  Private
router.get('/status', protect, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('skills')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const state = getUserPaymentState(user.skills);
    res.json(state);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Process mock checkout (₹50 single or ₹150 monthly)
// @route   POST /api/payment/checkout
// @access  Private
router.post('/checkout', protect, async (req, res) => {
  try {
    const { planType } = req.body; // 'single' or 'monthly'

    if (!planType || (planType !== 'single' && planType !== 'monthly')) {
      return res.status(400).json({ message: 'Invalid plan type' });
    }

    // Get current user skills field
    const { data: user, error } = await supabase
      .from('users')
      .select('skills')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const state = getUserPaymentState(user.skills);

    if (planType === 'monthly') {
      state.subscription = 'monthly';
    } else if (planType === 'single') {
      state.credits = (state.credits || 0) + 1;
    }

    // Save state back to Supabase
    const { error: updateError } = await supabase
      .from('users')
      .update({ skills: JSON.stringify(state) })
      .eq('id', req.user.id);

    if (updateError) {
      throw updateError;
    }

    res.json({
      success: true,
      message: `Successfully processed payment for ${planType === 'single' ? 'Single Resume (₹50)' : 'Monthly Premium (₹150)'}`,
      status: state
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Consume 1 resume download credit
// @route   POST /api/payment/consume
// @access  Private
router.post('/consume', protect, async (req, res) => {
  try {
    // Get current user skills field
    const { data: user, error } = await supabase
      .from('users')
      .select('skills')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const state = getUserPaymentState(user.skills);

    if (state.credits <= 0) {
      return res.status(400).json({ message: 'No download credits remaining' });
    }

    state.credits = state.credits - 1;

    // Save state back to Supabase
    const { error: updateError } = await supabase
      .from('users')
      .update({ skills: JSON.stringify(state) })
      .eq('id', req.user.id);

    if (updateError) {
      throw updateError;
    }

    res.json({
      success: true,
      message: 'Successfully consumed 1 download credit',
      status: state
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
