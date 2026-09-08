const CONTENT_FIELDS = [
  { key: 'asesoria_hero_title', label: 'Título principal', type: 'input' },
  { key: 'asesoria_hero_subtitle', label: 'Bajada del hero', type: 'textarea' },
  { key: 'asesoria_hero_text', label: 'Texto de presentación (debajo de la bajada)', type: 'textarea' },
  { key: 'asesoria_sobre_mi', label: '"Un poco de mí" (un párrafo por línea)', type: 'textarea-large' },
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

function renderFormulario() {
  document.getElementById('contenido-form').innerHTML = CONTENT_FIELDS.map(f => `
    <div>
      <label class="text-sm text-gray-600 block mb-1">${f.label}</label>
      ${f.type === 'input'
        ? `<input type="text" id="field-${f.key}" class="w-full p-3 border border-gray-300 rounded-2xl">`
        : `<textarea id="field-${f.key}" rows="${f.type === 'textarea-large' ? 8 : 4}" class="w-full p-3 border border-gray-300 rounded-2xl"></textarea>`
      }
    </div>
  `).join('') + `
    <button type="submit" id="contenido-submit-btn" class="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-full transition">
      Guardar cambios
    </button>
    <p id="contenido-guardado" class="text-green-600 text-sm text-center hidden">Cambios guardados ✓</p>
  `;
}

async function cargarContenido() {
  const { data } = await supabaseClient.from('site_content').select('*');
  (data || []).forEach(row => {
    const el = document.getElementById(`field-${row.key}`);
    if (el) el.value = row.value;
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
