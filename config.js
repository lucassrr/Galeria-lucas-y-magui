// Configuración de Supabase y constantes globales
const CONFIG = {
  // Supabase
  SUPABASE_URL: "https://sjpvmvtsnqkhckwlnwij.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqcHZtdnRzbnFraGNrd2xud2lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczNjQ2NzQsImV4cCI6MjA2Mjk0MDY3NH0.MQo38HgXmMSpJ3akpVC-dXDHhPxzXPhGjJrlpO2hdVk",
  
  // Galería
  ITEMS_PER_PAGE: 18,
  MAX_IMAGE_WIDTH: 800,
  MAX_IMAGE_HEIGHT: 800,
  IMAGE_QUALITY: 0.7,
  
  // Tablas
  TABLES: {
    GALLERY: 'gallery',
    FUNNY: 'funny_gallery'
  },
  
  // Buckets
  BUCKETS: {
    PHOTOS: 'photos'
  }
};

// Inicializa Supabase
const supa = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);