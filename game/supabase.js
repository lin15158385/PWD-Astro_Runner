import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://asgmexjckqubouqgbrrp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzZ21leGpja3F1Ym91cWdicnJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxNjY5MDYsImV4cCI6MjA4Mzc0MjkwNn0.n3pg0toFJ1fNVao3hD70p3YFkqLWGE32TY7ahftg7pg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);