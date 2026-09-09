let whatsappNumberActual = '5493518045948'; // fallback si no carga la base

function itemsALista(texto) {
  return (texto || '')
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .map(l => `<li>${l}</li>`)
    .join('');
}

function parrafosConNegrita(texto) {
  return (texto || '')
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .map(l => {
      const negrita = l.startsWith('**') && l.endsWith('**');
      const limpio = negrita ? l.slice(2, -2) : l;
      return negrita ? `<p><strong>${limpio}</strong></p>` : `<p>${limpio}</p>`;
    })
    .join('');
}

async function cargarContenidoAsesoria() {
  const { data } = await supabaseClient.from('site_content').select('*');
  const content = {};
  (data || []).forEach(row => content[row.key] = row.value);

  if (content.asesoria_hero_title) document.getElementById('content-hero-title').textContent = content.asesoria_hero_title;
  if (content.asesoria_hero_subtitle) document.getElementById('content-hero-subtitle').textContent = content.asesoria_hero_subtitle;
  if (content.asesoria_hero_text) document.getElementById('content-hero-text').textContent = content.asesoria_hero_text;

  document.getElementById('content-sobre-mi').innerHTML = parrafosConNegrita(content.asesoria_sobre_mi);
  document.getElementById('content-para-quien').innerHTML = itemsALista(content.asesoria_para_quien);
  document.getElementById('content-que-trabajamos').innerHTML = itemsALista(content.asesoria_que_trabajamos);
  document.getElementById('content-que-llevas').innerHTML = itemsALista(content.asesoria_que_llevas);

  if (content.asesoria_hero_image) {
    document.getElementById('hero-section').style.backgroundImage =
      `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('${content.asesoria_hero_image}')`;
  }
  if (content.asesoria_avatar) document.getElementById('avatar-img').src = content.asesoria_avatar;
  if (content.asesoria_sobremi_image) document.getElementById('sobremi-img').src = content.asesoria_sobremi_image;

  if (content.whatsapp_number) whatsappNumberActual = content.whatsapp_number;
}

document.addEventListener('DOMContentLoaded', () => {
    renderHeader('asesoria');
    renderFooter();
    cargarContenidoAsesoria();

    document.getElementById('whatsapp-form').addEventListener('submit', function (e) {
        e.preventDefault();

        const nombre = document.getElementById('nombre').value;
        const email = document.getElementById('email').value;
        const telefono = document.getElementById('telefono').value;
        const mensaje = document.getElementById('mensaje').value;

        let text = `*Nuevo contacto desde la web*%0A%0A`;
        text += `*Nombre:* ${nombre}%0A`;
        text += `*Email:* ${email}%0A`;
        if (telefono) text += `*Teléfono:* ${telefono}%0A`;
        text += `*Mensaje:* ${mensaje}`;

        const url = `https://wa.me/${whatsappNumberActual}?text=${text}`;
        window.open(url, '_blank');
    });
});
