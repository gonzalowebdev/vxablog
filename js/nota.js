async function cargarNota() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');

  const { data: post, error } = await supabaseClient
    .from('posts')
    .select('*')
    .eq('published', true)
    .eq('slug', slug)
    .single();

  const cont = document.getElementById('nota-contenido');

  if (error || !post) {
    document.title = 'Nota no encontrada | Vamos por ahí';
    cont.innerHTML = '<p class="text-gray-500">No encontramos esta nota. Puede que haya sido movida o borrada.</p>';
    return;
  }

  document.title = `${post.title} | Vamos por ahí`;
  renderHeader(post.category);
  supabaseClient.rpc('increment_post_view', { p_slug: slug }); // fire-and-forget

  cont.innerHTML = `
    <span class="text-xs font-semibold text-amber-600 uppercase tracking-wide">${getCategoryLabel(post.category)}</span>
    <h1 class="text-3xl md:text-4xl font-bold text-gray-800 mt-2 mb-6">${post.title}</h1>
    ${post.cover_image_url ? `<img src="${post.cover_image_url}" alt="${post.title}" class="w-full rounded-3xl mb-8">` : ''}
    <div class="prose-nota text-gray-700 text-lg leading-relaxed">${post.content}</div>
  `;

  renderBanner('entre_notas', 'banner-entre-notas');

  // Otras notas de la misma categoría
  const { data: relacionadas } = await supabaseClient
    .from('posts')
    .select('*')
    .eq('published', true)
    .eq('category', post.category)
    .neq('slug', slug)
    .order('created_at', { ascending: false })
    .limit(3);

  const relCont = document.getElementById('nota-relacionadas');
  if (relacionadas && relacionadas.length > 0) {
    relCont.innerHTML = relacionadas.map(p => `
      <a href="nota.html?slug=${p.slug}" class="block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition">
        <div class="h-32 overflow-hidden">
          <img src="${p.cover_image_url || PLACEHOLDER_IMAGE}" alt="${p.title}" class="w-full h-full object-cover">
        </div>
        <div class="p-3">
          <h3 class="font-semibold text-gray-800 text-sm leading-snug">${p.title}</h3>
        </div>
      </a>
    `).join('');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderFooter();
  cargarNota();
});
