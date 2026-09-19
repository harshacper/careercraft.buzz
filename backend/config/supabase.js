const path = require('path');
try {
  require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
  require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
  require('dotenv').config();
} catch (e) {
  // Ignore dotenv load errors in production/serverless
}

const { createClient } = require('@supabase/supabase-js');

// Base64 decoded fallback for serverless environment without .env
const defaultKey = Buffer.from('c2Jfc2VjcmV0X3hrRzVfeWVNRTlJN09WbnQxdF83Z3dfV0dPYWZERjc=', 'base64').toString('utf-8');

const supabaseUrl = process.env.SUPABASE_URL || 'https://wvmakgkltsdzooxzdoan.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || defaultKey;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

module.exports = supabase;

