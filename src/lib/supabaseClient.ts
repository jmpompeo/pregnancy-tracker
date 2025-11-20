import { createClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://tuvwkfdwwkltmaeakloq.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1dndrZmR3d2tsdG1hZWFrbG9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NTY5MzEsImV4cCI6MjA3OTIzMjkzMX0.qoWTBAp_DwPUucxqAb_7yX3W3RbL-OiFaDJXN5DFNEk";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? DEFAULT_SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ?? DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
