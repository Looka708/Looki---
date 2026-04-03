const { createClient } = require('@supabase/supabase-js');

// Validate environment variables
if (!process.env.SUPABASE_URL) {
  console.error('❌ SUPABASE_URL is not set in .env file');
  process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not set in .env file');
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
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
    console.error('⚠️ Database verification warning:', error.message);
    console.log('💡 Make sure to run supabase_schema.sql in Supabase SQL Editor');
  }
}

module.exports = { supabase, initializeTables };