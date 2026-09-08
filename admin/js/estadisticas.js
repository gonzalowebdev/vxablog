let chartCategorias, chartNotas, chartBanners;

async function init() {
  await requireAuth();
  renderAdminLayout('estadisticas');
  await cargarEstadisticas();
}

async function cargarEstadisticas() {
  const { data: posts } = await supabaseClient.from('posts').select('*');
  const { data: banners } = await supabaseClient.from('banners').select('*');

  const todosLosPosts = posts || [];
  const todosLosBanners = banners || [];

  // Tarjetas resumen
  const publicadas = todosLosPosts.filter(p => p.published).length;
  const borradores = todosLosPosts.length - publicadas;
  const totalVistas = todosLosPosts.reduce((acc, p) => acc + (p.views || 0), 0);
  const totalClics = todosLosBanners.reduce((acc, b) => acc + (b.clicks || 0), 0);
  const activos = todosLosBanners.filter(b => b.active).length;

  document.getElementById('tarjetas-resumen').innerHTML = `
    ${tarjeta('Notas publicadas', publicadas, 'fa-check-circle')}
    ${tarjeta('Borradores', borradores, 'fa-file')}
    ${tarjeta('Vistas totales', totalVistas, 'fa-eye')}
    ${tarjeta('Banners activos', activos, 'fa-rectangle-ad')}
    ${tarjeta('Clics totales', totalClics, 'fa-arrow-pointer')}
  `;

  // Notas por categoría
  const porCategoria = CATEGORIES.map(c => ({
    label: c.label,
    valor: todosLosPosts.filter(p => p.category === c.slug).length,
  }));

  chartCategorias = new Chart(document.getElementById('chart-categorias'), {
    type: 'bar',
    data: {
      labels: porCategoria.map(c => c.label),
      datasets: [{ data: porCategoria.map(c => c.valor), backgroundColor: '#f59e0b' }],
    },
    options: chartOptions(false),
  });

  // Top 5 notas más vistas
  const topNotas = [...todosLosPosts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);

  chartNotas = new Chart(document.getElementById('chart-notas'), {
    type: 'bar',
    data: {
      labels: topNotas.map(p => p.title.length > 20 ? p.title.slice(0, 20) + '…' : p.title),
      datasets: [{ data: topNotas.map(p => p.views || 0), backgroundColor: '#d97706' }],
    },
    options: chartOptions(true),
  });

  // Banners con más clics
  const topBanners = [...todosLosBanners].sort((a, b) => (b.clicks || 0) - (a.clicks || 0)).slice(0, 5);

  chartBanners = new Chart(document.getElementById('chart-banners'), {
    type: 'bar',
    data: {
      labels: topBanners.map(b => b.alt_text || b.position),
      datasets: [{ data: topBanners.map(b => b.clicks || 0), backgroundColor: '#b45309' }],
    },
    options: chartOptions(true),
  });
}

function tarjeta(label, valor, icono) {
  return `
    <div class="bg-white rounded-2xl p-4 shadow-sm">
      <i class="fas ${icono} text-amber-500 mb-2"></i>
      <p class="text-2xl font-bold text-gray-800">${valor}</p>
      <p class="text-xs text-gray-500">${label}</p>
    </div>
  `;
}

function chartOptions(horizontal) {
  return {
    indexAxis: horizontal ? 'y' : 'x',
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true }, x: { beginAtZero: true } },
    responsive: true,
  };
}

document.addEventListener('DOMContentLoaded', init);
