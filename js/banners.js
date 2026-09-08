// Busca banners activos para una posición dada y los inserta en el contenedor indicado.
async function renderBanner(position, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabaseClient
    .from('banners')
    .select('*')
    .eq('position', position)
    .eq('active', true)
    .order('order_index', { ascending: true });

  if (error || !data || data.length === 0) {
    container.classList.add('hidden');
    return;
  }

  // Filtra por fecha de campaña si está definida
  const vigentes = data.filter(b => {
    if (b.start_date && b.start_date > today) return false;
    if (b.end_date && b.end_date < today) return false;
    return true;
  });

  if (vigentes.length === 0) {
    container.classList.add('hidden');
    return;
  }

  // Si hay varios, elige uno al azar para que roten entre visitas
  const banner = vigentes[Math.floor(Math.random() * vigentes.length)];

  container.innerHTML = `
    <a href="${banner.link_url || '#'}" target="_blank" rel="noopener" class="block banner-slot" onclick="trackBannerClick('${banner.id}')">
      <img src="${banner.image_url}" alt="${banner.alt_text || 'Publicidad'}" class="w-full rounded-2xl">
    </a>
  `;
  container.classList.remove('hidden');
}

function trackBannerClick(id) {
  supabaseClient.rpc('increment_banner_click', { p_id: id }); // fire-and-forget, no bloquea la navegación
}
