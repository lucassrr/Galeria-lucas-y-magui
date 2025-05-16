// Inicializa Supabase
const SUPABASE_URL = "https://sjpvmvtsnqkhckwlnwij.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqcHZtdnRzbnFraGNrd2xud2lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczNjQ2NzQsImV4cCI6MjA2Mjk0MDY3NH0.MQo38HgXmMSpJ3akpVC-dXDHhPxzXPhGjJrlpO2hdVk";
const supa = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM refs
const gallery      = document.getElementById('gallery');
const funnyGallery = document.getElementById('funny-gallery');
const photoInput   = document.getElementById('photo-input');
const funnyInput   = document.getElementById('funny-input');
const modal        = document.getElementById('modal');
const modalImg     = document.getElementById('modal-img');
const modalClose   = document.getElementById('modal-close');
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebar      = document.getElementById('sidebar');
const mainSection  = document.getElementById('main-section');
const funnySection = document.getElementById('funny-section');
const emptyGallery = document.getElementById('empty-gallery');
const emptyFunny   = document.getElementById('empty-funny');
const themeToggle  = document.getElementById('theme-toggle');

// Mostrar/ocultar mensajes vacíos
function updateEmptyMessages() {
  emptyGallery.style.display = gallery.children.length ? 'none' : 'block';
  emptyFunny.style.display = funnyGallery.children.length ? 'none' : 'block';
}

// Compresión automática de imágenes antes de guardar
function compressImage(file, maxWidth = 800, maxHeight = 800, quality = 0.7) {
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

// Subir fotos a Supabase Storage y guardar URL en la tabla
async function handlePhotos(input, bucket, container, table) {
  for (const file of input.files) {
    try {
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
        loadPhotosFromSupabase(table, container);
      }
    } catch (err) {
      alert("No se pudo procesar la imagen.");
    }
  }
  input.value = '';
}

// Cargar fotos desde Supabase
async function loadPhotosFromSupabase(table, container) {
  container.innerHTML = '';
  let { data, error } = await supa.from(table).select('id,url');
  if (data) {
    data.forEach(photo => {
      createPhoto(photo.url, container, table, photo.id);
    });
  }
  updateEmptyMessages();
}

// Crear foto en la galería
function createPhoto(url, container, table, id = null) {
  const div = document.createElement('div');
  div.className = 'photo-container';
  const img = document.createElement('img');
  img.src = url;
  img.alt = "Foto subida";
  img.addEventListener('click', () => openModal(url));
  const del = document.createElement('span');
  del.textContent = '🗑️';
  del.className = 'trash-icon';
  del.addEventListener('click', async e => {
    e.stopPropagation();
    if (id) {
      await supa.from(table).delete().eq('id', id);
      loadPhotosFromSupabase(table, container);
    }
  });
  div.append(img, del);
  container.append(div);
  updateEmptyMessages();
}

// Modal
function openModal(src) { modalImg.src = src; modal.classList.add('show'); }
modalClose.addEventListener('click', () => modal.classList.remove('show'));
modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('show'); });

// Event listeners for file inputs
photoInput.addEventListener('change', e => handlePhotos(e.target, 'photos', gallery, 'gallery'));
funnyInput.addEventListener('change', e => handlePhotos(e.target, 'photos', funnyGallery, 'funny_gallery'));

// Cargar fotos al iniciar
document.addEventListener('DOMContentLoaded', () => {
  const enterBtn = document.getElementById('enter-gallery');
  if (enterBtn) {
    enterBtn.addEventListener('click', () => {
      document.getElementById('splash').style.opacity = 0;
      setTimeout(() => {
        document.getElementById('splash').style.display = 'none';
      }, 700);
    });
  }

  const modal = document.getElementById('modal');
  const modalClose = document.getElementById('modal-close');

  if (modal && modalClose) {
    modalClose.addEventListener('click', () => {
      modal.classList.remove('show');
      // Aquí puedes ocultar el splash si quieres:
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

  // Sidebar toggle
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('active');
      sidebarToggle.classList.toggle('active');
    });
  }

  // Sidebar links
  document.querySelectorAll('.sidebar-links a').forEach(link => {
    link.addEventListener('click', () => {
      if (sidebar && sidebarToggle) {
        sidebar.classList.remove('active');
        sidebarToggle.classList.remove('active');
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
    });
  }
  if (navFunny && mainSection && funnySection && sidebar) {
    navFunny.addEventListener('click', e => {
      e.preventDefault();
      mainSection.classList.add('hidden');
      funnySection.classList.remove('hidden');
      sidebar.classList.remove('active');
    });
  }

  // Alternar tema oscuro
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      themeToggle.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
    });
  }

  // Cargar fotos al iniciar
  loadPhotosFromSupabase('gallery', gallery);
  loadPhotosFromSupabase('funny_gallery', funnyGallery);
  if (funnySection && mainSection) {
    funnySection.classList.add('hidden');
    mainSection.classList.remove('hidden');
  }
  updateEmptyMessages();
});