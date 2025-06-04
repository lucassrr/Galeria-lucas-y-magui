// Utilidades generales para la aplicación

// Compresión automática de imágenes antes de guardar
function compressImage(file, maxWidth = CONFIG.MAX_IMAGE_WIDTH, maxHeight = CONFIG.MAX_IMAGE_HEIGHT, quality = CONFIG.IMAGE_QUALITY) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = e => { img.src = e.target.result; };
    img.onload = () => {
      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        const scale = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        blob => resolve(blob),
        'image/jpeg',
        quality
      );
    };
    img.onerror = reject;
    reader.readAsDataURL(file);
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