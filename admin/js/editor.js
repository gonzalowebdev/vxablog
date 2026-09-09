let editingPostId = null;
let quill;

function poblarSelectCategoria() {
  document.getElementById('post-category').innerHTML = CATEGORIES.map(c =>
    `<option value="${c.slug}">${c.label}</option>`
  ).join('');
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // saca acentos
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

// Sube la imagen elegida al bucket post-images y la inserta en el editor
// (en vez de guardarla en base64 dentro del texto, que infla la nota).
function imageHandler() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = async () => {
    const file = input.files[0];
    if (!file) return;

    const range = quill.getSelection(true);
    quill.insertText(range.index, 'Subiendo imagen...', 'italic', true);

    const path = `${Date.now()}-${file.name}`;
    const { error } = await supabaseClient.storage.from('post-images').upload(path, file);

    quill.deleteText(range.index, 'Subiendo imagen...'.length);

    if (error) {
      alert('Error al subir la imagen: ' + error.message);
      return;
    }

    const { data } = supabaseClient.storage.from('post-images').getPublicUrl(path);
    quill.insertEmbed(range.index, 'image', data.publicUrl);
    quill.setSelection(range.index + 1);
  };
  input.click();
}

function initQuill() {
  quill = new Quill('#post-content-editor', {
    theme: 'snow',
    placeholder: 'Escribí la nota acá...',
    modules: {
      toolbar: {
        container: [
          [{ header: [2, 3, false] }],
          ['bold', 'italic', 'underline'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['blockquote', 'link', 'image'],
          ['clean'],
        ],
        handlers: { image: imageHandler },
      },
    },
  });
}

async function cargarPostExistente() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) return;

  editingPostId = id;
  document.getElementById('editor-title').textContent = 'Editar nota';

  const { data: post } = await supabaseClient.from('posts').select('*').eq('id', id).single();
  if (!post) return;

  document.getElementById('post-title').value = post.title;
  document.getElementById('post-slug').value = post.slug;
  document.getElementById('post-category').value = post.category;
  document.getElementById('post-excerpt').value = post.excerpt || '';
  quill.root.innerHTML = post.content || '';
  document.getElementById('post-cover-url').value = post.cover_image_url || '';
  document.getElementById('post-published').checked = post.published;
  document.getElementById('post-featured').checked = post.featured;
}

document.addEventListener('DOMContentLoaded', async () => {
  await requireAuth();
  poblarSelectCategoria();
  initQuill();
  await cargarPostExistente();

  // Autogenera el slug a partir del título, solo si el usuario no lo tocó a mano
  let slugTocado = false;
  document.getElementById('post-slug').addEventListener('input', () => slugTocado = true);
  document.getElementById('post-title').addEventListener('input', (e) => {
    if (!slugTocado) {
      document.getElementById('post-slug').value = slugify(e.target.value);
    }
  });

  document.getElementById('post-cover-file').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const path = `${Date.now()}-${file.name}`;
    const { error } = await supabaseClient.storage.from('post-images').upload(path, file);
    if (error) { alert('Error al subir la imagen: ' + error.message); return; }
    const { data } = supabaseClient.storage.from('post-images').getPublicUrl(path);
    document.getElementById('post-cover-url').value = data.publicUrl;
  });

  document.getElementById('post-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      title: document.getElementById('post-title').value,
      slug: document.getElementById('post-slug').value,
      category: document.getElementById('post-category').value,
      excerpt: document.getElementById('post-excerpt').value,
      content: quill.root.innerHTML,
      cover_image_url: document.getElementById('post-cover-url').value,
      published: document.getElementById('post-published').checked,
      featured: document.getElementById('post-featured').checked,
      updated_at: new Date().toISOString(),
    };

    const btn = document.getElementById('post-submit-btn');
    btn.disabled = true;
    btn.textContent = 'Guardando...';

    let error;
    if (editingPostId) {
      ({ error } = await supabaseClient.from('posts').update(payload).eq('id', editingPostId));
    } else {
      ({ error } = await supabaseClient.from('posts').insert(payload));
    }

    if (error) {
      alert('Error al guardar: ' + error.message);
      btn.disabled = false;
      btn.textContent = 'Guardar nota';
      return;
    }

    window.location.href = 'dashboard.html';
  });
});
