// Header y footer únicos para todo el sitio.
// Se inyectan por JS (no fetch) para que funcione en cualquier hosting sin líos de CORS.

function renderHeader(activePage) {
  const navLinks = CATEGORIES.map(c =>
    `<a href="categoria.html?cat=${c.slug}" class="nav-link ${activePage === c.slug ? 'nav-link-active' : ''}">${c.label}</a>`
  ).join('');

  const mobileLinks = CATEGORIES.map(c =>
    `<a href="categoria.html?cat=${c.slug}" class="block py-2 hover:text-amber-600">${c.label}</a>`
  ).join('');

  const header = `
  <header class="bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-amber-100">
    <div class="container mx-auto px-4 py-3 flex justify-between items-center">
      <a href="index.html" class="flex items-center space-x-2">
        <img src="logovpa.jpg" alt="Logo Vamos por ahí" class="w-12 h-12 rounded-full object-cover border-2 border-amber-300">
        <div>
          <span class="text-2xl font-bold text-amber-700">Diani!</span>
          <span class="text-sm text-gray-500 block -mt-1">Vamos por ahí</span>
        </div>
      </a>
      <nav class="hidden lg:flex space-x-5 text-gray-700 font-medium text-sm">
        ${navLinks}
        <a href="asesoria.html" class="nav-link ${activePage === 'asesoria' ? 'nav-link-active' : ''}">Asesoría</a>
      </nav>
      <button id="menu-btn" class="lg:hidden text-2xl text-amber-700 focus:outline-none">
        <i class="fas fa-bars"></i>
      </button>
    </div>
    <div id="mobile-menu" class="hidden lg:hidden bg-white border-t border-amber-100 px-4 py-2">
      ${mobileLinks}
      <a href="asesoria.html" class="block py-2 hover:text-amber-600">Asesoría</a>
    </div>
  </header>`;

  document.getElementById('site-header').innerHTML = header;

  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  menuBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
}

function renderFooter() {
  const footer = `
  <footer class="bg-amber-700 text-white py-8 mt-16">
    <div class="container mx-auto px-4 text-center">
      <div class="flex justify-center space-x-6 mb-4">
        <a href="https://instagram.com/vamosporahii" class="hover:text-amber-200 text-xl"><i class="fab fa-instagram"></i></a>
        <a href="#" class="hover:text-amber-200 text-xl"><i class="fab fa-facebook"></i></a>
        <a href="#" class="hover:text-amber-200 text-xl"><i class="fab fa-tiktok"></i></a>
      </div>
      <p>© ${new Date().getFullYear()} Diani! · Vamos por ahí</p>
    </div>
  </footer>`;

  document.getElementById('site-footer').innerHTML = footer;
}
