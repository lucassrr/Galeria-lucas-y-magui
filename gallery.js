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

// Cargar fotos desde Supabase con paginación
async function loadPhotosFromSupabase(table, container, page = 1) {
  container.innerHTML = '';
  const itemsPerPage = CONFIG.ITEMS_PER_PAGE;
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage - 1;
  
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
  }
  
  // Obtener fotos paginadas
  let { data, error } = await supa.from(table)
    .select('id,url')
    .range(start, end)
    .order('id', { ascending: false });
  
  if (data) {
    data.forEach(photo => {
      createPhoto(photo.url, container, table, photo.id);
    });
  }
  
  updateEmptyMessages();
}

// Crear foto en la galería con lazy loading y efectos
function createPhoto(url, container, table, id = null) {
  const div = document.createElement('div');
  div.className = 'photo-container';
  
  // Usar lazy loading para imágenes sin efecto borroso
  const img = document.createElement('img');
  img.loading = 'lazy'; // Atributo nativo de lazy loading
  img.alt = "Foto subida";
  img.src = url; // Cargar directamente la imagen sin placeholder
  
  // Añadir efecto de aparición con retraso aleatorio
  img.style.animationDelay = (Math.random() * 0.5) + 's';
  
  // Click para ver imagen ampliada
  img.addEventListener('click', () => {
    const imgModal = document.getElementById('img-modal');
    const imgModalImg = document.getElementById('img-modal-img');
    imgModalImg.src = url;
    imgModal.classList.add('show');
  });
  
  // Botón de eliminar con confirmación
  const del = document.createElement('span');
  del.textContent = '🗑️';
  del.className = 'trash-icon';
  del.setAttribute('aria-label', 'Eliminar foto');
  del.addEventListener('click', async e => {
    e.stopPropagation();
    
    // Mostrar diálogo de confirmación
    showConfirmDialog('¿Eliminar esta foto?', async () => {
      if (id) {
        await supa.from(table).delete().eq('id', id);
        loadPhotosFromSupabase(table, container, 
          table === CONFIG.TABLES.GALLERY ? currentGalleryPage : currentFunnyPage);
      }
    });
  });
  
  div.append(img, del);
  container.append(div);
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