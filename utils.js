// Utilidades generales para la aplicación

// Compresión automática de imágenes antes de guardar con optimizaciones
function compressImage(file, maxWidth = CONFIG.MAX_IMAGE_WIDTH, maxHeight = CONFIG.MAX_IMAGE_HEIGHT, quality = CONFIG.IMAGE_QUALITY) {
  return new Promise((resolve, reject) => {
    // Verificar si el archivo ya está comprimido o es pequeño
    if (file.size < 200 * 1024 && file.type !== 'image/gif') { // Menos de 200KB
      return resolve(file);
    }
    
    // Usar URL.createObjectURL en lugar de FileReader para mejor rendimiento
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    
    img.onload = () => {
      // Liberar el objectURL después de cargar
      URL.revokeObjectURL(objectUrl);
      
      let { width, height } = img;
      
      // Determinar el factor de compresión basado en el tamaño del archivo
      let compressionQuality = quality;
      if (file.size > 2 * 1024 * 1024) { // Más de 2MB
        compressionQuality = Math.min(quality, 0.6);
      } else if (file.size > 1 * 1024 * 1024) { // Más de 1MB
        compressionQuality = Math.min(quality, 0.7);
      }
      
      // Redimensionar si es necesario
      if (width > maxWidth || height > maxHeight) {
        const scale = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      
      // Usar OffscreenCanvas si está disponible para mejor rendimiento
      const canvas = typeof OffscreenCanvas !== 'undefined' 
        ? new OffscreenCanvas(width, height) 
        : document.createElement('canvas');
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);
      
      // Determinar el formato de salida óptimo
      const outputFormat = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      
      if (typeof OffscreenCanvas !== 'undefined') {
        canvas.convertToBlob({ type: outputFormat, quality: compressionQuality })
          .then(blob => resolve(blob))
          .catch(reject);
      } else {
        canvas.toBlob(
          blob => resolve(blob),
          outputFormat,
          compressionQuality
        );
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Error al cargar la imagen'));
    };
    
    img.src = objectUrl;
  });
}

// Configuración de drag and drop
function setupDropArea(dropArea, fileInput) {
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
  });
  
  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  ['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => {
      dropArea.classList.add('highlight');
    });
  });
  
  ['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => {
      dropArea.classList.remove('highlight');
    });
  });
  
  dropArea.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    fileInput.files = files;
    
    // Disparar evento change manualmente
    const event = new Event('change', { bubbles: true });
    fileInput.dispatchEvent(event);
  });
}

// Mostrar/ocultar mensajes vacíos
function updateEmptyMessages() {
  const gallery = document.getElementById('gallery');
  const funnyGallery = document.getElementById('funny-gallery');
  const emptyGallery = document.getElementById('empty-gallery');
  const emptyFunny = document.getElementById('empty-funny');
  
  if (gallery && emptyGallery) {
    emptyGallery.style.display = gallery.children.length ? 'none' : 'block';
  }
  
  if (funnyGallery && emptyFunny) {
    emptyFunny.style.display = funnyGallery.children.length ? 'none' : 'block';
  }
}

// Actualizar barra de progreso
function updateProgressBar(progressBar, progressText, percent) {
  if (progressBar && progressText) {
    progressBar.style.width = `${percent}%`;
    progressText.textContent = `Subiendo: ${percent}%`;
  }
}

// Mostrar modal de confirmación
function showConfirmDialog(message, onConfirm, onCancel) {
  const modal = document.getElementById('confirm-modal');
  const title = document.getElementById('confirm-title');
  const confirmBtn = document.getElementById('confirm-delete');
  const cancelBtn = document.getElementById('cancel-delete');
  
  title.textContent = message;
  modal.classList.add('show');
  
  const confirmHandler = () => {
    onConfirm();
    modal.classList.remove('show');
    confirmBtn.removeEventListener('click', confirmHandler);
    cancelBtn.removeEventListener('click', cancelHandler);
  };
  
  const cancelHandler = () => {
    if (onCancel) onCancel();
    modal.classList.remove('show');
    confirmBtn.removeEventListener('click', confirmHandler);
    cancelBtn.removeEventListener('click', cancelHandler);
  };
  
  confirmBtn.addEventListener('click', confirmHandler);
  cancelBtn.addEventListener('click', cancelHandler);
  
  // Cerrar al hacer clic fuera
  modal.addEventListener('click', (e) => {
    if (e.target === modal) cancelHandler();
  }, { once: true });
}