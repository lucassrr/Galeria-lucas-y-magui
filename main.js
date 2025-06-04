// Inicialización de la aplicación

document.addEventListener('DOMContentLoaded', () => {
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
  if (enterBtn) {
    enterBtn.addEventListener('click', () => {
      document.getElementById('splash').style.opacity = 0;
      setTimeout(() => {
        document.getElementById('splash').style.display = 'none';
      }, 700);
    });
  }

  // Modal de bienvenida
  if (modal && modalClose) {
    modalClose.addEventListener('click', () => {
      modal.classList.remove('show');
      // Ocultar splash
      document.getElementById('splash').style.opacity = 0;
      setTimeout(() => {
        document.getElementById('splash').style.display = 'none';
      }, 700);
    });

    // Cerrar modal al hacer click fuera del contenido
    modal.addEventListener('click', e => {
      if (e.target === modal) {
        modal.classList.remove('show');
        document.getElementById('splash').style.opacity = 0;
        setTimeout(() => {
          document.getElementById('splash').style.display = 'none';
        }, 700);
      }
    });
  }

  // Sidebar toggle con accesibilidad
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      const isExpanded = sidebar.classList.contains('active');
      sidebar.classList.toggle('active');
      sidebarToggle.classList.toggle('active');
      sidebarToggle.setAttribute('aria-expanded', !isExpanded);
    });
  }

  // Sidebar links
  document.querySelectorAll('.sidebar-links a').forEach(link => {
    link.addEventListener('click', () => {
      if (sidebar && sidebarToggle) {
        sidebar.classList.remove('active');
        sidebarToggle.classList.remove('active');
        sidebarToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Navegación de secciones
  const navHome = document.getElementById('nav-home');
  const navFunny = document.getElementById('nav-funny');
  if (navHome && mainSection && funnySection && sidebar) {
    navHome.addEventListener('click', e => {
      e.preventDefault();
      mainSection.classList.remove('hidden');
      funnySection.classList.add('hidden');
      sidebar.classList.remove('active');
      sidebarToggle.setAttribute('aria-expanded', 'false');
    });
  }
  if (navFunny && mainSection && funnySection && sidebar) {
    navFunny.addEventListener('click', e => {
      e.preventDefault();
      mainSection.classList.add('hidden');
      funnySection.classList.remove('hidden');
      sidebar.classList.remove('active');
      sidebarToggle.setAttribute('aria-expanded', 'false');
    });
  }

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
  
  if (funnySection && mainSection) {
    funnySection.classList.add('hidden');
    mainSection.classList.remove('hidden');
  }
  
  updateEmptyMessages();
});