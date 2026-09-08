let editingBannerId = null;

async function init() {
  await requireAuth();
  renderAdminLayout('banners');
  poblarSelectPosicion();
  await cargarBanners();
}

function poblarSelectPosicion() {
  const posiciones = [
    { value: 'home_top', label: 'Home (arriba)' },
    { value: 'categoria_top', label: 'Categoría (arriba)' },
    { value: 'entre_notas', label: 'Dentro de la nota' },
    { value: 'sidebar', label: 'Barra lateral' },
  ];
  document.getElementById('banner-position').innerHTML = posiciones.map(p =>
    `<option value="${p.value}">${p.label}</option>`
  ).join('');
}

async function cargarBanners() {
  const { data: banners } = await supabaseClient
    .from('banners')
    .select('*')
    .order('position', { ascending: true })
    .order('order_index', { ascending: true });

  const cont = document.getElementById('lista-banners');
  if (!banners || banners.length === 0) {
    cont.innerHTML = '<p class="text-gray-500">Todavía no cargaste ningún banner.</p>';
    return;
  }

  cont.innerHTML = banners.map(b => `
    <div class="flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm">
      <div class="flex items-center gap-3 min-w-0">
        <img src="${b.image_url}" class="w-16 h-10 object-cover rounded-lg border">
        <div class="min-w-0">
          <p class="font-semibold text-gray-800 text-sm truncate">${b.alt_text || '(sin descripción)'}</p>
          <p class="text-xs text-gray-500">${b.position} · ${b.active ? 'Activo' : 'Inactivo'} · <i class="fas fa-arrow-pointer"></i> ${b.clicks || 0} clics</p>
        </div>
      </div>
      <div class="flex gap-2 shrink-0 ml-3">
        <button onclick="editarBanner('${b.id}')" class="text-amber-600 hover:text-amber-800"><i class="fas fa-pen"></i></button>
        <button onclick="borrarBanner('${b.id}')" class="text-red-500 hover:text-red-700"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `).join('');
}

async function editarBanner(id) {
  const { data: b } = await supabaseClient.from('banners').select('*').eq('id', id).single();
  if (!b) return;
  editingBannerId = id;
  document.getElementById('banner-image-url').value = b.image_url;
  document.getElementById('banner-link-url').value = b.link_url || '';
  document.getElementById('banner-alt').value = b.alt_text || '';
  document.getElementById('banner-position').value = b.position;
  document.getElementById('banner-active').checked = b.active;
  document.getElementById('banner-form-title').textContent = 'Editar banner';
  window.scrollTo({ top: document.getElementById('banner-form').offsetTop - 20, behavior: 'smooth' });
}

async function borrarBanner(id) {
  if (!confirm('¿Borrar este banner?')) return;
  await supabaseClient.from('banners').delete().eq('id', id);
  cargarBanners();
}

function resetBannerForm() {
  editingBannerId = null;
  document.getElementById('banner-form').reset();
  document.getElementById('banner-form-title').textContent = 'Nuevo banner';
}

document.addEventListener('DOMContentLoaded', () => {
  init();

  document.getElementById('banner-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      image_url: document.getElementById('banner-image-url').value,
      link_url: document.getElementById('banner-link-url').value,
      alt_text: document.getElementById('banner-alt').value,
      position: document.getElementById('banner-position').value,
      active: document.getElementById('banner-active').checked,
    };

    if (editingBannerId) {
      await supabaseClient.from('banners').update(payload).eq('id', editingBannerId);
    } else {
      await supabaseClient.from('banners').insert(payload);
    }

    resetBannerForm();
    cargarBanners();
  });

  document.getElementById('banner-cancel').addEventListener('click', resetBannerForm);

  document.getElementById('banner-image-file').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const path = `${Date.now()}-${file.name}`;
    const { error } = await supabaseClient.storage.from('banners').upload(path, file);
    if (error) { alert('Error al subir la imagen: ' + error.message); return; }
    const { data } = supabaseClient.storage.from('banners').getPublicUrl(path);
    document.getElementById('banner-image-url').value = data.publicUrl;
  });
});
