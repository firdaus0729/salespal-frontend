import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sgjygjqjybzqojqvojcn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnanlnanFqeWJ6cW9qcXZvamNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NzU2ODMsImV4cCI6MjA4NzI1MTY4M30.-3St2L-v11rIG7mC2jM0ZUjOzPU6FlrcgD7LE1mkuZA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
