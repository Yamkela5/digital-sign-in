// Supabase client configuration
const SUPABASE_URL = 'https://brbkhsyugeuygrztgznd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyYmtoc3l1Z2V1eWdyenRnem5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0MzM5NTYsImV4cCI6MjA2NDAwOTk1Nn0.JDRDlSwJsq12VzHjf_4D2jb4yqSv9ice6g5XDTSfSBo';

// Initialize the Supabase client and make it globally available
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Assign to window object to make it globally accessible
window.supabase = supabaseClient;

// No export statement - this is a browser script, not an ES module

