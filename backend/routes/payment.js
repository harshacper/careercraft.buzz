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

// Helper to parse subscription status from skills column (defaulting to 2 free trial downloads)
const getUserPaymentState = (skillsText) => {
  // If it's already an array (e.g. from Supabase JSONB or client list)
  if (Array.isArray(skillsText)) {
    return {
      skillsList: skillsText,
      subscription: 'none',
      credits: 2,
      freeTrialsInitialized: true
    };
  }

  // If it's already an object (e.g. from Supabase JSONB)
  if (skillsText && typeof skillsText === 'object') {
    const isInit = Boolean(skillsText.freeTrialsInitialized);
    const credits = (skillsText.credits !== undefined && skillsText.credits !== null)
      ? Number(skillsText.credits)
      : (isInit ? 0 : 2);

    return {
      skillsList: skillsText.skillsList || [],
      subscription: skillsText.subscription || 'none',
      credits: isNaN(credits) ? (isInit ? 0 : 2) : credits,
      freeTrialsInitialized: true
    };
  }

  try {
    const parsed = JSON.parse(skillsText);
    if (parsed && typeof parsed === 'object') {
      if (Array.isArray(parsed)) {
        return {
          skillsList: parsed,
          subscription: 'none',
          credits: 2,
          freeTrialsInitialized: true
        };
      }
      const isInit = Boolean(parsed.freeTrialsInitialized);
      const credits = (parsed.credits !== undefined && parsed.credits !== null)
        ? Number(parsed.credits)
        : (isInit ? 0 : 2);

      return {
        skillsList: parsed.skillsList || [],
        subscription: parsed.subscription || 'none',
        credits: isNaN(credits) ? (isInit ? 0 : 2) : credits,
        freeTrialsInitialized: true
      };
    }
  } catch (e) {
    // skillsText is not JSON (it is plain comma-separated text)
  }

  // Default fallback if skills is plain text or empty
  const skillsArray = typeof skillsText === 'string'
    ? skillsText.split(',').map(s => s.trim()).filter(Boolean)
    : [];
  return {
    skillsList: skillsArray,
    subscription: 'none',
    credits: 2,
    freeTrialsInitialized: true
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

    // If payment state was not yet initialized in the database, persist it now
    if (!user.skills || typeof user.skills !== 'object' || !user.skills.freeTrialsInitialized) {
      await supabase
        .from('users')
        .update({ skills: state })
        .eq('id', req.user.id);
    }

    res.json(state);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Process mock checkout (₹49 single or ₹199 monthly)
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
    state.freeTrialsInitialized = true;

    // Save state back to Supabase
    const { error: updateError } = await supabase
      .from('users')
      .update({ skills: state })
      .eq('id', req.user.id);

    if (updateError) {
      throw updateError;
    }

    res.json({
      success: true,
      message: `Successfully processed payment for ${planType === 'single' ? 'Single Resume (₹49)' : 'Monthly Premium (₹199)'}`,
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
      return res.status(400).json({ 
        message: 'No download credits remaining. Your 2 free downloads have been used. Upgrade to unlock further downloads.',
        credits: 0
      });
    }

    state.credits = state.credits - 1;
    state.freeTrialsInitialized = true;

    // Save state back to Supabase
    const { error: updateError } = await supabase
      .from('users')
      .update({ skills: state })
      .eq('id', req.user.id);

    if (updateError) {
      throw updateError;
    }

    res.json({
      success: true,
      message: state.credits > 0 
        ? `Successfully consumed 1 credit (${state.credits} remaining)` 
        : 'Used final free download credit. Subsequent downloads will require a plan upgrade.',
      status: state
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
