// ============================================
// CONFIGURACIÓN DE SUPABASE
// Reemplazá estos dos valores por los de tu proyecto
// (Supabase > Settings > API)
// ============================================
const SUPABASE_URL = 'https://lqnvbjioxuvbfhdmbjie.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxbnZiamlveHV2YmZoZG1iamllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4MTIyNjAsImV4cCI6MjEwNDM4ODI2MH0.hS356eDYw2-fPiMAI6fVu124lsVywhR09lGDDYEK9_4';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
