// Script para recuperar las fotos existentes
document.addEventListener('DOMContentLoaded', async () => {
  // Verificar si ya se ejecutó la migración
  if (localStorage.getItem('migration_completed')) {
    console.log('La migración ya se completó anteriormente');
    return;
  }

  try {
    console.log('Iniciando recuperación de fotos...');
    
    // Recuperar fotos de la galería principal
    const { data: galleryData, error: galleryError } = await supa
      .from(CONFIG.TABLES.GALLERY)
      .select('*');
    
    if (galleryError) throw galleryError;
    
    // Recuperar fotos de la galería graciosa
    const { data: funnyData, error: funnyError } = await supa
      .from(CONFIG.TABLES.FUNNY)
      .select('*');
    
    if (funnyError) throw funnyError;
    
    // Actualizar fotos de la galería principal
    for (const photo of galleryData) {
      if (photo.url && !photo.description) {
        await supa
          .from(CONFIG.TABLES.GALLERY)
          .update({ description: '' })
          .eq('id', photo.id);
        console.log(`Foto ID ${photo.id} actualizada en galería principal`);
      }
    }
    
    // Actualizar fotos de la galería graciosa
    for (const photo of funnyData) {
      if (photo.url && !photo.description) {
        await supa
          .from(CONFIG.TABLES.FUNNY)
          .update({ description: '' })
          .eq('id', photo.id);
        console.log(`Foto ID ${photo.id} actualizada en galería graciosa`);
      }
    }
    
    // Marcar la migración como completada
    localStorage.setItem('migration_completed', 'true');
    console.log('Recuperación de fotos completada con éxito');
    
    // Recargar las galerías
    loadPhotosFromSupabase(CONFIG.TABLES.GALLERY, document.getElementById('gallery'));
    loadPhotosFromSupabase(CONFIG.TABLES.FUNNY, document.getElementById('funny-gallery'));
    
  } catch (error) {
    console.error('Error durante la recuperación de fotos:', error);
  }
});