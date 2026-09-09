const CONTENT_FIELDS = [
  { key: 'asesoria_hero_title', label: 'Título principal', type: 'input' },
  { key: 'asesoria_hero_subtitle', label: 'Bajada del hero', type: 'textarea' },
  { key: 'asesoria_hero_text', label: 'Texto de presentación (debajo de la bajada)', type: 'textarea' },
  { key: 'asesoria_hero_image', label: 'Imagen de fondo del hero', type: 'image' },
  { key: 'asesoria_avatar', label: 'Foto de perfil (círculo del hero)', type: 'image' },
  { key: 'asesoria_sobre_mi', label: '"Un poco de mí" (un párrafo por línea)', type: 'textarea-large' },
  { key: 'asesoria_sobremi_image', label: 'Foto de "Un poco de mí"', type: 'image' },
  { key: 'asesoria_para_quien', label: '¿Para quién es? (un ítem por línea)', type: 'textarea' },
  { key: 'asesoria_que_trabajamos', label: '¿Qué trabajamos? (un ítem por línea)', type: 'textarea' },
  { key: 'asesoria_que_llevas', label: '¿Qué te llevás? (un ítem por línea)', type: 'textarea' },
  { key: 'whatsapp_number', label: 'Número de WhatsApp (con código de país, sin +)', type: 'input' },
];

async function init() {
  await requireAuth();
  renderAdminLayout('contenido');
  renderFormulario();
  await cargarContenido();
}

function campoImagen(f) {
  return `
    <div>
      <label class="text-sm text-gray-600 block mb-1">${f.label}</label>
      <div class="flex items-center gap-3 mb-2">
        <img id="preview-${f.key}" class="w-16 h-16 object-cover rounded-xl border border-gray-200 bg-gray-50">
        <input type="file" id="file-${f.key}" accept="image/*" class="text-sm">
      </div>
      <input type="text" id="field-${f.key}" placeholder="URL de la imagen" class="w-full p-2 border border-gray-300 rounded-xl text-sm">
    </div>
  `;
}

function renderFormulario() {
  document.getElementById('contenido-form').innerHTML = CONTENT_FIELDS.map(f => {
    if (f.type === 'image') return campoImagen(f);
    return `
    <div>
      <label class="text-sm text-gray-600 block mb-1">${f.label}</label>
      ${f.type === 'input'
        ? `<input type="text" id="field-${f.key}" class="w-full p-3 border border-gray-300 rounded-2xl">`
        : `<textarea id="field-${f.key}" rows="${f.type === 'textarea-large' ? 8 : 4}" class="w-full p-3 border border-gray-300 rounded-2xl"></textarea>`
      }
    </div>
  `;
  }).join('') + `
    <button type="submit" id="contenido-submit-btn" class="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-full transition">
      Guardar cambios
    </button>
    <p id="contenido-guardado" class="text-green-600 text-sm text-center hidden">Cambios guardados ✓</p>
  `;

  // Subida de imágenes al bucket "site-assets"
  CONTENT_FIELDS.filter(f => f.type === 'image').forEach(f => {
    document.getElementById(`file-${f.key}`).addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const path = `${Date.now()}-${file.name}`;
      const { error } = await supabaseClient.storage.from('site-assets').upload(path, file);
      if (error) { alert('Error al subir la imagen: ' + error.message); return; }
      const { data } = supabaseClient.storage.from('site-assets').getPublicUrl(path);
      document.getElementById(`field-${f.key}`).value = data.publicUrl;
      document.getElementById(`preview-${f.key}`).src = data.publicUrl;
    });
  });
}

async function cargarContenido() {
  const { data } = await supabaseClient.from('site_content').select('*');
  (data || []).forEach(row => {
    const el = document.getElementById(`field-${row.key}`);
    if (el) el.value = row.value;
    const preview = document.getElementById(`preview-${row.key}`);
    if (preview && row.value) preview.src = row.value;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  init();

  document.getElementById('contenido-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('contenido-submit-btn');
    btn.disabled = true;
    btn.textContent = 'Guardando...';

    const updates = CONTENT_FIELDS.map(f => ({
      key: f.key,
      value: document.getElementById(`field-${f.key}`).value,
      updated_at: new Date().toISOString(),
    }));

    await supabaseClient.from('site_content').upsert(updates, { onConflict: 'key' });

    btn.disabled = false;
    btn.textContent = 'Guardar cambios';
    const aviso = document.getElementById('contenido-guardado');
    aviso.classList.remove('hidden');
    setTimeout(() => aviso.classList.add('hidden'), 2500);
  });
});
