const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkLogs() {
  console.log('Checking music activity logs...');
  const { data, error } = await supabase
    .from('music_activity_log')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching logs:', error);
    return;
  }

  console.log('--- Recent Activity Logs ---');
  if (data.length === 0) {
    console.log('No logs found!');
  } else {
    data.forEach(log => {
      console.log(`[${log.timestamp}] Action: ${log.action} | Song: ${log.song_name} | Error: ${log.error_message}`);
    });
  }
}

checkLogs();
