const { createClient } = require('@supabase/supabase-js');

// Unify environment variables for both local and production (Koyeb)
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate environment variables
if (!SUPABASE_URL) {
  console.error('🥺 SUPABASE_URL is not set in environment variables');
  process.exit(1);
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('🥺 SUPABASE_SERVICE_ROLE_KEY is not set in environment variables');
  process.exit(1);
}

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
);

// Simple health check - just verify connection works
async function initializeTables() {
  try {
    // Test connection with a simple query
    const { data, error } = await supabase
      .from('warnings')
      .select('count()', { count: 'exact', head: true });

    if (error) throw error;
    console.log('✦ Supabase database tables verified');
  } catch (error) {
    console.error('🥺 Database verification warning:', error.message);
    console.log('💡 Make sure to run supabase_schema.sql in Supabase SQL Editor');
  }
}

module.exports = { supabase, initializeTables };