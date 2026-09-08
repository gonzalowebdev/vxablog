let todasLasNotas = [];

async function init() {
  await requireAuth();
  renderAdminLayout('notas');
  poblarFiltroCategoria();
  await cargarNotas();
}

function poblarFiltroCategoria() {
  const sel = document.getElementById('filtro-categoria');
  sel.innerHTML = '<option value="">Todas las categorías</option>' +
    CATEGORIES.map(c => `<option value="${c.slug}">${c.label}</option>`).join('');
}

async function cargarNotas() {
  const { data: posts } = await supabaseClient
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  todasLasNotas = posts || [];
  aplicarFiltros();
}

function aplicarFiltros() {
  const cat = document.getElementById('filtro-categoria').value;
  const estado = document.getElementById('filtro-estado').value;

  let filtradas = todasLasNotas;
  if (cat) filtradas = filtradas.filter(p => p.category === cat);
  if (estado === 'publicada') filtradas = filtradas.filter(p => p.published);
  if (estado === 'borrador') filtradas = filtradas.filter(p => !p.published);

  renderNotas(filtradas);
}

function renderNotas(posts) {
  const cont = document.getElementById('lista-notas');
  if (!posts || posts.length === 0) {
    cont.innerHTML = '<p class="text-gray-500">No hay notas que coincidan con el filtro.</p>';
    return;
  }

  cont.innerHTML = posts.map(p => `
    <div class="flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm gap-3">
      <div class="min-w-0 flex-1">
        <p class="font-semibold text-gray-800 truncate">${p.title}</p>
        <p class="text-xs text-gray-500">${getCategoryLabel(p.category)}${p.featured ? ' · Destacada' : ''} · <i class="fas fa-eye"></i> ${p.views || 0} vistas</p>
      </div>
      <label class="flex items-center gap-2 text-xs text-gray-500 shrink-0 cursor-pointer">
        <input type="checkbox" ${p.published ? 'checked' : ''} onchange="togglePublicado('${p.id}', this.checked)">
        ${p.published ? 'Publicada' : 'Oculta'}
      </label>
      <div class="flex gap-3 shrink-0">
        <a href="editor.html?id=${p.id}" class="text-amber-600 hover:text-amber-800"><i class="fas fa-pen"></i></a>
        <button onclick="borrarNota('${p.id}')" class="text-red-500 hover:text-red-700"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `).join('');
}

async function togglePublicado(id, published) {
  await supabaseClient.from('posts').update({ published }).eq('id', id);
  const nota = todasLasNotas.find(p => p.id === id);
  if (nota) nota.published = published;
  aplicarFiltros();
}

async function borrarNota(id) {
  if (!confirm('¿Borrar esta nota? No se puede deshacer.')) return;
  await supabaseClient.from('posts').delete().eq('id', id);
  cargarNotas();
}

document.addEventListener('DOMContentLoaded', () => {
  init();
  document.getElementById('filtro-categoria').addEventListener('change', aplicarFiltros);
  document.getElementById('filtro-estado').addEventListener('change', aplicarFiltros);
});
