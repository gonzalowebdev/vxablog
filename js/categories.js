// Fuente única de verdad para las categorías del portal.
// Si en algún momento agregás/sacás una categoría, se hace acá y se propaga a todo el sitio.
const CATEGORIES = [
  { slug: 'cordoba',      label: 'Córdoba',      description: 'Destinos, pueblos, escapadas, novedades turísticas.' },
  { slug: 'gastronomia',  label: 'Gastronomía',  description: 'Restaurantes, bares, bodegas, productos, aperturas, experiencias.' },
  { slug: 'escapadas',    label: 'Escapadas',    description: 'Hoteles, cabañas, destinos cercanos, propuestas de fin de semana.' },
  { slug: 'experiencias', label: 'Experiencias', description: 'Qué hacer, eventos, actividades, propuestas diferentes.' },
  { slug: 'viajes',       label: 'Viajes',       description: 'Destinos nacionales e internacionales.' },
  { slug: 'agenda',       label: 'Agenda',       description: 'Eventos, fiestas, ferias, propuestas para hacer.' },
  { slug: 'recomendados', label: 'Recomendados', description: 'Curaduría de lugares y experiencias recomendadas.' },
];

// Placeholder inline para notas sin imagen de portada (evita depender de un archivo extra)
const PLACEHOLDER_IMAGE = "data:image/svg+xml;utf8," + encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><rect width='100%' height='100%' fill='#fde8c8'/><text x='50%' y='50%' font-family='sans-serif' font-size='16' fill='#b45309' text-anchor='middle' dy='.3em'>Vamos por ahí</text></svg>`
);

function getCategoryLabel(slug) {
  const cat = CATEGORIES.find(c => c.slug === slug);
  return cat ? cat.label : slug;
}
