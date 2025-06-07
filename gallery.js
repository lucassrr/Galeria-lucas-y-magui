// Funcionalidad específica de la galería

// Variables para paginación
let currentGalleryPage = 1;
let currentFunnyPage = 1;
let totalGalleryPages = 1;
let totalFunnyPages = 1;

// Subir fotos a Supabase Storage y guardar URL en la tabla
async function handlePhotos(input, bucket, container, table, progressContainer, progressBar, progressText) {
  if (!input.files.length) return;
  
  progressContainer.hidden = false;
  let totalFiles = input.files.length;
  let completedFiles = 0;
  
  for (const file of input.files) {
    try {
      // Actualizar progreso
      updateProgressBar(progressBar, progressText, Math.round((completedFiles / totalFiles) * 100));
      
      const blob = await compressImage(file);
      const filePath = `${Date.now()}_${file.name}`;
      const { error: uploadError } = await supa.storage.from(bucket).upload(filePath, blob);
      
      if (uploadError) {
        alert("No se pudo subir la foto.");
        continue;
      }
      
      const { data } = supa.storage.from(bucket).getPublicUrl(filePath);
      if (data && data.publicUrl) {
        await supa.from(table).insert([{ url: data.publicUrl }]);
      }
      
      completedFiles++;
      updateProgressBar(progressBar, progressText, Math.round((completedFiles / totalFiles) * 100));
    } catch (err) {
      console.error("Error al procesar imagen:", err);
      alert("No se pudo procesar la imagen.");
    }
  }
  
  // Cargar fotos actualizadas
  loadPhotosFromSupabase(table, container);
  
  // Ocultar barra de progreso después de un momento
  setTimeout(() => {
    progressContainer.hidden = true;
    updateProgressBar(progressBar, progressText, 0);
  }, 1000);
  
  input.value = '';
}

// Variables para ordenación
let galleryOrder = 'newest'; // 'newest' o 'oldest'
let funnyOrder = 'newest';

// Cargar fotos desde Supabase con paginación y ordenación
async function loadPhotosFromSupabase(table, container, page = 1, order) {
  container.innerHTML = '';
  const itemsPerPage = CONFIG.ITEMS_PER_PAGE;
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage - 1;
  
  // Determinar el orden actual
  if (order === undefined) {
    order = table === CONFIG.TABLES.GALLERY ? galleryOrder : funnyOrder;
  } else {
    // Guardar el nuevo orden
    if (table === CONFIG.TABLES.GALLERY) {
      galleryOrder = order;
    } else {
      funnyOrder = order;
    }
  }
  
  // Obtener total para paginación
  const { count } = await supa.from(table).select('*', { count: 'exact', head: true });
  
  // Calcular páginas totales
  const totalPages = Math.ceil(count / itemsPerPage);
  
  // Actualizar variables de paginación
  if (table === CONFIG.TABLES.GALLERY) {
    currentGalleryPage = page;
    totalGalleryPages = totalPages;
    updatePagination('gallery-pagination', currentGalleryPage, totalGalleryPages, (newPage) => {
      loadPhotosFromSupabase(table, container, newPage);
    });
    
    // Actualizar contador de fotos
    const counter = document.getElementById('gallery-counter');
    if (counter) {
      counter.textContent = `Total: ${count} fotos`;
    }
    
    // Actualizar selector de orden
    const orderSelect = document.getElementById('gallery-order');
    if (orderSelect) {
      orderSelect.value = galleryOrder;
    }
  } else {
    currentFunnyPage = page;
    totalFunnyPages = totalPages;
    updatePagination('funny-pagination', currentFunnyPage, totalFunnyPages, (newPage) => {
      loadPhotosFromSupabase(table, container, newPage);
    });
    
    // Actualizar contador de fotos
    const counter = document.getElementById('funny-counter');
    if (counter) {
      counter.textContent = `Total: ${count} fotos`;
    }
    
    // Actualizar selector de orden
    const orderSelect = document.getElementById('funny-order');
    if (orderSelect) {
      orderSelect.value = funnyOrder;
    }
  }
  
  // Obtener fotos paginadas con el orden especificado
  let query = supa.from(table).select('id,url').range(start, end);
  
  // Aplicar orden
  if (order === 'newest') {
    query = query.order('id', { ascending: false });
  } else {
    query = query.order('id', { ascending: true });
  }
  
  let { data, error } = await query;
  
  if (data) {
    // Aplicar vista en mosaico con tamaños variados
    const useMosaic = container.classList.contains('mosaic-view');
    
    data.forEach((photo, index) => {
      // En vista mosaico, asignar tamaños diferentes
      let size = '';
      if (useMosaic) {
        // Asignar tamaños de forma pseudo-aleatoria pero consistente
        const sizeIndex = (index % 6);
        if (sizeIndex === 0 || sizeIndex === 5) {
          size = 'large'; // 25% de las fotos
        } else if (sizeIndex === 2 || sizeIndex === 3) {
          size = 'medium'; // 25% de las fotos
        }
        // El resto (50%) serán de tamaño normal
      }
      
      createPhoto(photo.url, container, table, photo.id, size);
    });
  }
  
  updateEmptyMessages();
}

// Crear foto en la galería con lazy loading y efectos optimizados
function createPhoto(url, container, table, id = null, size = '') {
  const div = document.createElement('div');
  div.className = 'photo-container';
  
  // Aplicar clase de tamaño si está en modo mosaico
  if (size) {
    div.classList.add(`photo-${size}`);
  }
  
  // Contenedor para efecto de zoom
  const imgWrapper = document.createElement('div');
  imgWrapper.className = 'img-zoom-wrapper';
  
  // Crear un placeholder mientras se carga la imagen
  const placeholder = document.createElement('div');
  placeholder.className = 'img-placeholder';
  imgWrapper.appendChild(placeholder);
  
  // Usar lazy loading y técnica de carga progresiva
  const img = new Image();
  img.loading = 'lazy'; // Atributo nativo de lazy loading
  img.alt = "Foto subida";
  img.className = 'gallery-img';
  img.dataset.src = url; // Guardar la URL original
  
  // Generar una versión en miniatura para carga rápida
  const thumbnailUrl = generateThumbnailUrl(url);
  
  // Usar Intersection Observer para cargar solo cuando sea visible
  if ('IntersectionObserver' in window) {
    if (!window.imageObserver) {
      window.imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.onload = () => {
              img.classList.add('loaded');
              const placeholder = img.previousElementSibling;
              if (placeholder && placeholder.classList.contains('img-placeholder')) {
                placeholder.style.opacity = '0';
                setTimeout(() => placeholder.remove(), 300);
              }
            };
            observer.unobserve(img);
          }
        });
      }, {
        rootMargin: '200px 0px', // Cargar imágenes 200px antes de que sean visibles
        threshold: 0.01
      });
    }
    
    // Cargar primero la miniatura
    const tempImg = new Image();
    tempImg.onload = () => {
      placeholder.style.backgroundImage = `url(${thumbnailUrl})`;
      placeholder.classList.add('with-thumbnail');
    };
    tempImg.src = thumbnailUrl;
    
    // Observar la imagen para cargarla cuando sea visible
    window.imageObserver.observe(img);
  } else {
    // Fallback para navegadores que no soportan IntersectionObserver
    img.src = url;
  }
  
  // Click para ver imagen ampliada (usando delegación de eventos)
  imgWrapper.addEventListener('click', () => {
    const imgModal = document.getElementById('img-modal');
    const imgModalImg = document.getElementById('img-modal-img');
    
    // Mostrar spinner mientras se carga la imagen completa
    imgModal.classList.add('loading');
    
    // Precargar la imagen completa
    const fullImg = new Image();
    fullImg.onload = () => {
      imgModalImg.src = url;
      imgModal.classList.remove('loading');
    };
    fullImg.src = url;
    
    imgModal.classList.add('show');
  });
  
  // Botón de eliminar con confirmación (usando delegación de eventos)
  const del = document.createElement('span');
  del.textContent = '🗑️';
  del.className = 'trash-icon';
  del.setAttribute('aria-label', 'Eliminar foto');
  del.addEventListener('click', e => {
    e.stopPropagation();
    
    // Mostrar diálogo de confirmación
    showConfirmDialog('¿Eliminar esta foto?', async () => {
      if (id) {
        try {
          await supa.from(table).delete().eq('id', id);
          // Eliminar solo este elemento en lugar de recargar toda la galería
          div.classList.add('removing');
          setTimeout(() => {
            div.remove();
            updateEmptyMessages();
          }, 300);
        } catch (err) {
          console.error('Error al eliminar foto:', err);
          alert('No se pudo eliminar la foto');
        }
      }
    });
  });
  
  imgWrapper.appendChild(img);
  div.append(imgWrapper, del);
  container.append(div);
}

// Función para generar URL de miniatura
function generateThumbnailUrl(url) {
  // Si es una URL de Supabase Storage, podemos usar transformaciones de imagen
  if (url.includes('storage.googleapis.com') || url.includes('supabase')) {
    // Extraer la parte de la URL que necesitamos
    const urlParts = url.split('/');
    const filename = urlParts[urlParts.length - 1];
    
    // Crear URL de miniatura (ajustar según la API de Supabase)
    return url.replace(filename, `thumbnail_${filename}`);
  }
  
  // Si no podemos generar una miniatura, devolver la URL original
  return url;
}

// Crear controles de paginación
function updatePagination(containerId, currentPage, totalPages, onPageChange) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = '';
  
  if (totalPages <= 1) {
    container.style.display = 'none';
    return;
  }
  
  container.style.display = 'flex';
  
  // Botón anterior
  const prevBtn = document.createElement('button');
  prevBtn.textContent = '←';
  prevBtn.className = 'pagination-btn';
  prevBtn.disabled = currentPage === 1;
  prevBtn.setAttribute('aria-label', 'Página anterior');
  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  });
  
  // Botón siguiente
  const nextBtn = document.createElement('button');
  nextBtn.textContent = '→';
  nextBtn.className = 'pagination-btn';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.setAttribute('aria-label', 'Página siguiente');
  nextBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  });
  
  // Indicador de página actual
  const pageInfo = document.createElement('span');
  pageInfo.textContent = `${currentPage} / ${totalPages}`;
  pageInfo.className = 'pagination-info';
  
  container.append(prevBtn, pageInfo, nextBtn);
}