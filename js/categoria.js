async function cargarCategoria() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('cat');
  const cat = CATEGORIES.find(c => c.slug === slug);

  if (!cat) {
    document.getElementById('categoria-titulo').textContent = 'Categoría no encontrada';
    return;
  }

  document.title = `${cat.label} | Vamos por ahí`;
  document.getElementById('categoria-titulo').textContent = cat.label;
  document.getElementById('categoria-desc').textContent = cat.description;

  renderHeader(slug);
  renderBanner('categoria_top', 'banner-categoria-top');

  const { data: posts } = await supabaseClient
    .from('posts')
    .select('*')
    .eq('published', true)
    .eq('category', slug)
    .order('created_at', { ascending: false });

  const cont = document.getElementById('categoria-notas');
  if (!posts || posts.length === 0) {
    cont.innerHTML = '<p class="text-gray-500 col-span-full">Todavía no hay notas en esta categoría.</p>';
    return;
  }

  cont.innerHTML = posts.map(p => `
    <a href="nota.html?slug=${p.slug}" class="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition">
      <div class="h-44 overflow-hidden">
        <img src="${p.cover_image_url || PLACEHOLDER_IMAGE}" alt="${p.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
      </div>
      <div class="p-4">
        <h3 class="font-bold text-gray-800 leading-snug">${p.title}</h3>
        <p class="text-sm text-gray-500 mt-1 line-clamp-2">${p.excerpt || ''}</p>
      </div>
    </a>
  `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  renderFooter();
  cargarCategoria();
});
