import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://yissxqzhufvqpbjsmlxb.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlpc3N4cXpodWZ2cXBianNtbHhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5MDI4MTQsImV4cCI6MjA5NTQ3ODgxNH0.1dwuqnafH0qW854rRIyRZMJ8zm8PpNhMSPsqrP3fwFk";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
