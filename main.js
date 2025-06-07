// Inicialización de la aplicación

document.addEventListener('DOMContentLoaded', () => {
  // Verificar si el usuario ya ha visitado la página
  const hasVisited = sessionStorage.getItem('hasVisited');
  const splash = document.getElementById('splash');
  
  // Si ya ha visitado la página, ocultar el splash screen inmediatamente
  if (hasVisited) {
    if (splash) {
      splash.style.display = 'none';
    }
  } else {
    // Marcar como visitado para futuras recargas
    sessionStorage.setItem('hasVisited', 'true');
    // Crear efecto de confeti solo en la primera visita
    createConfetti();
  }
  
  // Referencias DOM
  const gallery = document.getElementById('gallery');
  const funnyGallery = document.getElementById('funny-gallery');
  const photoInput = document.getElementById('photo-input');
  const funnyInput = document.getElementById('funny-input');
  const modal = document.getElementById('modal');
  const modalClose = document.getElementById('modal-close');
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  const mainSection = document.getElementById('main-section');
  const funnySection = document.getElementById('funny-section');
  const themeToggle = document.getElementById('theme-toggle');
  const dropArea = document.getElementById('drop-area');
  const funnyDropArea = document.getElementById('funny-drop-area');
  const uploadProgress = document.getElementById('upload-progress');
  const uploadProgressBar = document.getElementById('upload-progress-bar');
  const uploadProgressText = document.getElementById('upload-progress-text');
  const funnyUploadProgress = document.getElementById('funny-upload-progress');
  const funnyUploadProgressBar = document.getElementById('funny-upload-progress-bar');
  const funnyUploadProgressText = document.getElementById('funny-upload-progress-text');

  // Configurar áreas de arrastrar y soltar
  if (dropArea && photoInput) {
    setupDropArea(dropArea, photoInput);
  }
  
  if (funnyDropArea && funnyInput) {
    setupDropArea(funnyDropArea, funnyInput);
  }

  // Splash screen
  const enterBtn = document.getElementById('enter-gallery');
  if (enterBtn && splash) {
    enterBtn.addEventListener('click', () => {
      splash.style.opacity = 0;
      setTimeout(() => {
        splash.style.display = 'none';
      }, 700);
    });
  }

  // Modal de bienvenida
  if (modal && modalClose) {
    modalClose.addEventListener('click', () => {
      modal.classList.remove('show');
      // Ocultar splash
      if (splash) {
        splash.style.opacity = 0;
        setTimeout(() => {
          splash.style.display = 'none';
        }, 700);
      }
    });

    // Cerrar modal al hacer click fuera del contenido
    modal.addEventListener('click', e => {
      if (e.target === modal) {
        modal.classList.remove('show');
        if (splash) {
          splash.style.opacity = 0;
          setTimeout(() => {
            splash.style.display = 'none';
          }, 700);
        }
      }
    });
  }

  // Crear overlay para cerrar sidebar al hacer clic fuera
  const sidebarOverlay = document.createElement('div');
  sidebarOverlay.className = 'sidebar-overlay';
  document.body.appendChild(sidebarOverlay);
  
  // Sidebar toggle con accesibilidad
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      const isExpanded = sidebar.classList.contains('active');
      sidebar.classList.toggle('active');
      sidebarToggle.classList.toggle('active');
      sidebarToggle.setAttribute('aria-expanded', !isExpanded);
      
      // Mostrar/ocultar overlay
      if (!isExpanded) {
        sidebarOverlay.classList.add('active');
      } else {
        sidebarOverlay.classList.remove('active');
      }
    });
    
    // Cerrar sidebar al hacer clic en el overlay
    sidebarOverlay.addEventListener('click', () => {
      sidebar.classList.remove('active');
      sidebarToggle.classList.remove('active');
      sidebarToggle.setAttribute('aria-expanded', 'false');
      sidebarOverlay.classList.remove('active');
    });
  }

  // Sidebar links
  document.querySelectorAll('.sidebar-links a').forEach(link => {
    link.addEventListener('click', () => {
      if (sidebar && sidebarToggle) {
        sidebar.classList.remove('active');
        sidebarToggle.classList.remove('active');
        sidebarToggle.setAttribute('aria-expanded', 'false');
        sidebarOverlay.classList.remove('active');
      }
    });
  });

  // Función para manejar rutas
  function handleRoute() {
    // Obtener el hash actual o usar el guardado en sessionStorage
    let hash = window.location.hash;
    
    // Si no hay hash en la URL pero hay uno guardado, usarlo y actualizar la URL
    if (!hash && sessionStorage.getItem('currentRoute')) {
      hash = sessionStorage.getItem('currentRoute');
      window.location.hash = hash;
    } else if (!hash) {
      // Si no hay hash ni ruta guardada, usar la ruta por defecto
      hash = '#/inicio';
      window.location.hash = hash;
    }
    
    // Guardar la ruta actual en sessionStorage
    sessionStorage.setItem('currentRoute', hash);
    
    if (hash === '#/inicio') {
      mainSection.classList.remove('hidden');
      funnySection.classList.add('hidden');
    } else if (hash === '#/graciosas') {
      mainSection.classList.add('hidden');
      funnySection.classList.remove('hidden');
    }
    
    // Cerrar sidebar si está abierta
    if (sidebar && sidebar.classList.contains('active')) {
      sidebar.classList.remove('active');
      sidebarToggle.classList.remove('active');
      sidebarToggle.setAttribute('aria-expanded', 'false');
      sidebarOverlay.classList.remove('active');
    }
  }

  // Escuchar cambios en la URL
  window.addEventListener('hashchange', handleRoute);
  
  // Manejar la ruta inicial
  handleRoute();

  // Cargar tema guardado y configurar alternador
  if (themeToggle) {
    // Verificar si hay un tema guardado en localStorage
    const savedTheme = localStorage.getItem('theme');
    
    // Aplicar tema guardado o usar el predeterminado
    if (savedTheme === 'dark') {
      document.body.classList.add('dark');
      themeToggle.textContent = '☀️';
      themeToggle.setAttribute('aria-label', 'Cambiar a tema claro');
    } else {
      document.body.classList.remove('dark');
      themeToggle.textContent = '🌙';
      themeToggle.setAttribute('aria-label', 'Cambiar a tema oscuro');
    }
    
    // Configurar evento para cambiar tema
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      const isDark = document.body.classList.contains('dark');
      
      // Guardar preferencia en localStorage
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      
      // Actualizar botón
      themeToggle.textContent = isDark ? '☀️' : '🌙';
      themeToggle.setAttribute('aria-label', 
        isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro');
    });
  }

  // Modal de imagen
  const imgModal = document.getElementById('img-modal');
  const imgModalImg = document.getElementById('img-modal-img');
  const imgModalClose = document.getElementById('img-modal-close');

  // Delegación de eventos para ambas galerías
  document.body.addEventListener('click', function(e) {
    if (e.target.matches('.gallery img, .funny-gallery img')) {
      imgModalImg.src = e.target.src;
      imgModal.classList.add('show');
    }
  });

  imgModalClose.addEventListener('click', () => {
    imgModal.classList.remove('show');
    imgModalImg.src = '';
  });

  imgModal.addEventListener('click', e => {
    if (e.target === imgModal) {
      imgModal.classList.remove('show');
      imgModalImg.src = '';
    }
  });

  // Configurar controles de vista y ordenación para la galería principal
  const galleryGridBtn = document.getElementById('gallery-grid-view');
  const galleryMosaicBtn = document.getElementById('gallery-mosaic-view');
  const galleryOrderSelect = document.getElementById('gallery-order');
  
  if (galleryGridBtn && galleryMosaicBtn) {
    // Vista en cuadrícula
    galleryGridBtn.addEventListener('click', () => {
      gallery.classList.remove('mosaic-view');
      galleryGridBtn.classList.add('active');
      galleryMosaicBtn.classList.remove('active');
      localStorage.setItem('galleryView', 'grid');
      loadPhotosFromSupabase(CONFIG.TABLES.GALLERY, gallery, currentGalleryPage);
    });
    
    // Vista en mosaico
    galleryMosaicBtn.addEventListener('click', () => {
      gallery.classList.add('mosaic-view');
      galleryMosaicBtn.classList.add('active');
      galleryGridBtn.classList.remove('active');
      localStorage.setItem('galleryView', 'mosaic');
      loadPhotosFromSupabase(CONFIG.TABLES.GALLERY, gallery, currentGalleryPage);
    });
    
    // Cargar vista guardada
    const savedGalleryView = localStorage.getItem('galleryView');
    if (savedGalleryView === 'mosaic') {
      galleryMosaicBtn.click();
    }
  }
  
  // Ordenación de la galería principal
  if (galleryOrderSelect) {
    galleryOrderSelect.addEventListener('change', () => {
      loadPhotosFromSupabase(CONFIG.TABLES.GALLERY, gallery, 1, galleryOrderSelect.value);
    });
  }
  
  // Configurar controles de vista y ordenación para la galería de fotos graciosas
  const funnyGridBtn = document.getElementById('funny-grid-view');
  const funnyMosaicBtn = document.getElementById('funny-mosaic-view');
  const funnyOrderSelect = document.getElementById('funny-order');
  
  if (funnyGridBtn && funnyMosaicBtn) {
    // Vista en cuadrícula
    funnyGridBtn.addEventListener('click', () => {
      funnyGallery.classList.remove('mosaic-view');
      funnyGridBtn.classList.add('active');
      funnyMosaicBtn.classList.remove('active');
      localStorage.setItem('funnyView', 'grid');
      loadPhotosFromSupabase(CONFIG.TABLES.FUNNY, funnyGallery, currentFunnyPage);
    });
    
    // Vista en mosaico
    funnyMosaicBtn.addEventListener('click', () => {
      funnyGallery.classList.add('mosaic-view');
      funnyMosaicBtn.classList.add('active');
      funnyGridBtn.classList.remove('active');
      localStorage.setItem('funnyView', 'mosaic');
      loadPhotosFromSupabase(CONFIG.TABLES.FUNNY, funnyGallery, currentFunnyPage);
    });
    
    // Cargar vista guardada
    const savedFunnyView = localStorage.getItem('funnyView');
    if (savedFunnyView === 'mosaic') {
      funnyMosaicBtn.click();
    }
  }
  
  // Ordenación de la galería de fotos graciosas
  if (funnyOrderSelect) {
    funnyOrderSelect.addEventListener('change', () => {
      loadPhotosFromSupabase(CONFIG.TABLES.FUNNY, funnyGallery, 1, funnyOrderSelect.value);
    });
  }

  // Event listeners para inputs de archivos
  photoInput.addEventListener('change', e => {
    handlePhotos(
      e.target, 
      CONFIG.BUCKETS.PHOTOS, 
      gallery, 
      CONFIG.TABLES.GALLERY,
      uploadProgress,
      uploadProgressBar,
      uploadProgressText
    );
  });
  
  funnyInput.addEventListener('change', e => {
    handlePhotos(
      e.target, 
      CONFIG.BUCKETS.PHOTOS, 
      funnyGallery, 
      CONFIG.TABLES.FUNNY,
      funnyUploadProgress,
      funnyUploadProgressBar,
      funnyUploadProgressText
    );
  });

  // Cargar fotos al iniciar
  loadPhotosFromSupabase(CONFIG.TABLES.GALLERY, gallery);
  loadPhotosFromSupabase(CONFIG.TABLES.FUNNY, funnyGallery);
  
  // Aplicar la ruta inicial (después de cargar las fotos)
  handleRoute();
  
  updateEmptyMessages();
  
  // Función para crear efecto de confeti
  function createConfetti() {
    const colors = ['#f2d74e', '#f5576c', '#f093fb', '#a1c4fd', '#fad0c4'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.width = Math.random() * 10 + 5 + 'px';
        confetti.style.height = confetti.style.width;
        
        document.body.appendChild(confetti);
        
        setTimeout(() => {
          confetti.remove();
        }, 3000);
      }, i * 150);
    }
  }
});