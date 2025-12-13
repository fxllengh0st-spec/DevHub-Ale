import { createClient } from '@supabase/supabase-js';

// Derived from the JWT payload provided:
// ISS: supabase
// REF: ewtthpknnthvoynexcsc
const SUPABASE_URL = 'https://ewtthpknnthvoynexcsc.supabase.co';

// The JWT token provided by the user
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3dHRocGtubnRodm95bmV4Y3NjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MDExNjcsImV4cCI6MjA4MTA3NzE2N30.qSb8rR0VUTHBtGbI4SKos1eW_xylabD18he5siNH7W4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
