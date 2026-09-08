// Layout compartido del panel: header + sidebar, inyectados en slots separados
// para que cada página mantenga su propio <main> estático (mismo patrón que partials.js).

const ADMIN_NAV = [
  { id: 'notas', label: 'Notas', icon: 'fa-newspaper', href: 'dashboard.html' },
  { id: 'banners', label: 'Banners', icon: 'fa-rectangle-ad', href: 'banners.html' },
  { id: 'contenido', label: 'Contenido del sitio', icon: 'fa-pen-to-square', href: 'contenido.html' },
  { id: 'estadisticas', label: 'Estadísticas', icon: 'fa-chart-simple', href: 'estadisticas.html' },
];

function renderAdminLayout(activeSection) {
  const links = ADMIN_NAV.map(item => `
    <a href="${item.href}" class="admin-nav-link ${activeSection === item.id ? 'admin-nav-link-active' : ''}">
      <i class="fas ${item.icon} w-5"></i> <span>${item.label}</span>
    </a>
  `).join('');

  document.getElementById('admin-header').innerHTML = `
    <header class="bg-white border-b border-amber-100 sticky top-0 z-20">
      <div class="px-4 py-3 flex justify-between items-center">
        <div class="flex items-center gap-3">
          <button id="admin-menu-btn" class="lg:hidden text-xl text-amber-700"><i class="fas fa-bars"></i></button>
          <span class="font-bold text-amber-700">Vamos por ahí · Admin</span>
        </div>
        <button onclick="logout()" class="text-sm text-gray-500 hover:text-red-500">Cerrar sesión</button>
      </div>
    </header>
  `;

  document.getElementById('admin-sidebar').innerHTML = links;

  document.getElementById('admin-menu-btn').addEventListener('click', () => {
    document.getElementById('admin-sidebar').classList.toggle('admin-sidebar-open');
  });
}
