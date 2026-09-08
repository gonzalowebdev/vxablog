const MESES = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];

async function cargarHome() {
  let { data: destacadas } = await supabaseClient
    .from('posts')
    .select('*')
    .eq('published', true)
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(3);

  // Si no hay ninguna marcada como destacada, se usan las 3 más recientes
  if (!destacadas || destacadas.length === 0) {
    const { data: recientes } = await supabaseClient
      .from('posts')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(3);
    destacadas = recientes || [];
  }

  renderDestacadas(destacadas);

  const { data: ultimas } = await supabaseClient
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(6);

  renderGrilla(ultimas || [], 'ultimas-notas');

  renderBanner('home_top', 'banner-home-top');

  await cargarSeccionesPorCategoria();
}

// ============ DESTACADAS (layout asimétrico) ============
function renderDestacadas(posts) {
  const cont = document.getElementById('destacadas');
  if (!posts.length) {
    cont.innerHTML = '<p class="text-gray-500">Todavía no hay notas para destacar.</p>';
    return;
  }

  const [principal, ...secundarias] = posts;

  let html = `
    <a href="nota.html?slug=${principal.slug}" class="destacada-principal group block rounded-3xl overflow-hidden shadow-md relative h-72 md:h-full md:col-span-2 md:row-span-2">
      <img src="${principal.cover_image_url || PLACEHOLDER_IMAGE}" alt="${principal.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
      <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"></div>
      <div class="absolute bottom-0 p-6 text-white">
        <span class="text-xs uppercase tracking-widest bg-amber-500 px-2 py-1 rounded-full">${getCategoryLabel(principal.category)}</span>
        <h3 class="card-title font-bold mt-3">${principal.title}</h3>
      </div>
    </a>
  `;

  html += secundarias.map(p => `
    <a href="nota.html?slug=${p.slug}" class="destacada-secundaria group block rounded-3xl overflow-hidden shadow-md relative h-32 md:h-full">
      <img src="${p.cover_image_url || PLACEHOLDER_IMAGE}" alt="${p.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
      <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent"></div>
      <div class="absolute bottom-0 p-4 text-white">
        <span class="text-[0.65rem] uppercase tracking-widest bg-amber-500 px-2 py-0.5 rounded-full">${getCategoryLabel(p.category)}</span>
        <h3 class="card-title font-bold mt-1">${p.title}</h3>
      </div>
    </a>
  `).join('');

  cont.innerHTML = html;
}

// ============ TARJETA ESTÁNDAR (últimas notas, categorías) ============
function renderGrilla(posts, containerId) {
  const cont = document.getElementById(containerId);
  if (!posts.length) {
    cont.innerHTML = '<p class="text-gray-500 col-span-full">Todavía no hay notas publicadas.</p>';
    return;
  }
  cont.innerHTML = posts.map(p => `
    <a href="nota.html?slug=${p.slug}" class="nota-card group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition">
      <div class="h-44 overflow-hidden">
        <img src="${p.cover_image_url || PLACEHOLDER_IMAGE}" alt="${p.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
      </div>
      <div class="p-4">
        <span class="text-xs font-semibold text-amber-600 uppercase tracking-wide">${getCategoryLabel(p.category)}</span>
        <h3 class="card-title font-bold text-gray-800 mt-1">${p.title}</h3>
        <p class="text-sm text-gray-500 mt-1 line-clamp-2">${p.excerpt || ''}</p>
      </div>
    </a>
  `).join('');
}

// ============ TARJETA RECOMENDADOS (vertical) ============
function renderGrillaRecomendados(posts, containerId) {
  const cont = document.getElementById(containerId);
  cont.innerHTML = posts.map(p => `
    <a href="nota.html?slug=${p.slug}" class="recomendado-card group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition">
      <div class="aspect-recomendado overflow-hidden">
        <img src="${p.cover_image_url || PLACEHOLDER_IMAGE}" alt="${p.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
      </div>
      <div class="p-4">
        <span class="text-xs font-semibold text-amber-600 uppercase tracking-wide">Recomendado</span>
        <h3 class="card-title font-bold text-gray-800 mt-1">${p.title}</h3>
      </div>
    </a>
  `).join('');
}

// ============ TARJETA AGENDA (bloque de fecha) ============
// Nota: usa la fecha de publicación como referencia visual. Si más adelante
// las notas de Agenda necesitan mostrar la fecha real del evento, conviene
// sumar un campo "event_date" a la tabla posts.
function renderGrillaAgenda(posts, containerId) {
  const cont = document.getElementById(containerId);
  cont.innerHTML = posts.map(p => {
    const fecha = new Date(p.created_at);
    return `
    <a href="nota.html?slug=${p.slug}" class="agenda-card group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition">
      <div class="agenda-fecha">
        <span class="dia">${fecha.getDate()}</span>
        <span class="mes">${MESES[fecha.getMonth()]}</span>
      </div>
      <div class="p-4 min-w-0 flex-1">
        <h3 class="card-title font-bold text-gray-800">${p.title}</h3>
        <p class="text-sm text-gray-500 mt-1 line-clamp-2">${p.excerpt || ''}</p>
      </div>
    </a>
  `}).join('');
}

// ============ SECCIONES POR CATEGORÍA ============
async function cargarSeccionesPorCategoria() {
  const cont = document.getElementById('categorias-secciones');
  const bloques = [];
  const datosPorCategoria = {};

  for (const cat of CATEGORIES) {
    const { data: posts } = await supabaseClient
      .from('posts')
      .select('*')
      .eq('published', true)
      .eq('category', cat.slug)
      .order('created_at', { ascending: false })
      .limit(3);

    if (!posts || posts.length === 0) continue;
    datosPorCategoria[cat.slug] = posts;

    const gridId = `grid-cat-${cat.slug}`;
    const gridClase = cat.slug === 'recomendados'
      ? 'grid grid-cols-2 md:grid-cols-3 gap-4'
      : cat.slug === 'agenda'
        ? 'grid grid-cols-1 md:grid-cols-3 gap-4'
        : 'grid sm:grid-cols-2 md:grid-cols-3 gap-5';

    bloques.push(`
      <section class="py-12 border-t border-amber-100">
        <div class="container mx-auto px-4">
          <div class="section-header flex justify-between items-end mb-6">
            <div>
              <span class="section-eyebrow">Categoría</span>
              <h2 class="section-title">${cat.label}</h2>
            </div>
            <a href="categoria.html?cat=${cat.slug}" class="text-sm font-semibold text-amber-700 hover:underline whitespace-nowrap">Ver todas →</a>
          </div>
          <div id="${gridId}" class="${gridClase}"></div>
        </div>
      </section>
    `);
  }

  cont.innerHTML = bloques.join('');

  // El HTML de cada bloque ya está en el DOM: ahora se llena cada grilla con los datos ya obtenidos
  Object.keys(datosPorCategoria).forEach(slug => {
    const gridId = `grid-cat-${slug}`;
    const posts = datosPorCategoria[slug];
    if (slug === 'recomendados') renderGrillaRecomendados(posts, gridId);
    else if (slug === 'agenda') renderGrillaAgenda(posts, gridId);
    else renderGrilla(posts, gridId);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderHeader('home');
  renderFooter();
  cargarHome();
});
