const DEFAULT_SITE = {
  siteName: 'El Mosquito',
  communityName: 'Cuesta Hermosa II',
  subtitle: 'Periodico comunitario de Cuesta Hermosa II',
  tagline: 'Informacion, transparencia y comunidad en un solo lugar.',
  logo: '/uploads/logo-encabezado-mosquito.png',
  heroImage: '/uploads/logo-el-mosquito-transparente.png',
  location: 'Cuesta Hermosa II - Santo Domingo',
  editionLabel: 'Edicion digital',
  heroTitle: 'La voz comunitaria de Cuesta Hermosa II',
  heroText: 'Informacion, transparencia y comunidad en un solo lugar.',
  heroButtonText: 'Leer mas',
  whatsappNumber: '',
  primaryColor: '#526E3F',
  accentColor: '#A45B2B',
  darkColor: '#171717',
  paperColor: '#F7F2E9'
}

const BASE_PATH = window.location.hostname.includes('github.io')
  ? '/el-mosquito-cuesta-hermosa'
  : ''

let site = DEFAULT_SITE
let articles = []
let notices = []
let categoriesData = []
let documents = []
let directiva = []

let currentPage = 0
let pageDirection = 'next'
let currentSearch = ''

const app = document.querySelector('#app') || document.body

function cleanPath(path) {
  return String(path || '').replace(/^\.?\//, '').replace(/^\//, '')
}

function pathUrl(path) {
  if (!path) return ''
  if (String(path).startsWith('http')) return path
  return BASE_PATH + '/' + cleanPath(path)
}

function dataUrl(path) {
  return BASE_PATH + '/' + cleanPath(path)
}

function safe(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

async function getJSON(path, fallback) {
  try {
    const response = await fetch(dataUrl(path), { cache: 'no-store' })
    if (!response.ok) throw new Error('No se pudo cargar ' + path)
    return await response.json()
  } catch (error) {
    console.warn(error)
    return fallback
  }
}

function normalizeList(data) {
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data.items)) return data.items
  return []
}

function sortByDate(items) {
  return items.slice().sort(function(a, b) {
    return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
  })
}

function formatDate(dateValue) {
  if (!dateValue) return ''
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat('es-DO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date)
}

function bodyToHTML(text) {
  if (!text) return ''
  return String(text)
    .split('\n\n')
    .map(function(paragraph) { return paragraph.trim() })
    .filter(Boolean)
    .map(function(paragraph) {
      return '<p>' + safe(paragraph).replace(/\n/g, '<br>') + '</p>'
    })
    .join('')
}

function imageTag(path, alt, className) {
  if (!path) {
    return '<div class="' + className + ' image-fallback"><span>El Mosquito</span></div>'
  }

  return '<img class="' + className + '" src="' + pathUrl(path) + '" alt="' + safe(alt || 'Imagen') + '" loading="lazy" />'
}

function reportHref(type) {
  const number = String(site.whatsappNumber || '').replace(/\D/g, '')
  if (!number) return '#'

  const message = type
    ? 'Hola, quiero reportar una situacion para El Mosquito / Cuesta Hermosa II.\n\nTipo de reporte: ' + type + '\nUbicacion exacta:\nDescripcion:\nFoto o evidencia:'
    : 'Hola, quiero reportar una situacion para El Mosquito / Cuesta Hermosa II.'

  return 'https://wa.me/' + number + '?text=' + encodeURIComponent(message)
}

function getLead() {
  const sorted = sortByDate(articles)
  return sorted.find(function(article) { return article.featured }) || sorted[0]
}

function otherArticles() {
  const lead = getLead()
  return sortByDate(articles).filter(function(article) {
    return !lead || String(article.id) !== String(lead.id)
  })
}

function filteredArticles() {
  const query = currentSearch.trim().toLowerCase()
  let list = sortByDate(articles)

  if (query) {
    list = list.filter(function(article) {
      const text = [article.title, article.summary, article.category, article.body].join(' ').toLowerCase()
      return text.indexOf(query) !== -1
    })
  }

  return list
}

function openArticleButton(article, label) {
  if (!article) return ''
  return '<button type="button" class="em-read-button" data-open-article="' + safe(article.id || '') + '">' + safe(label || 'Leer mas') + '</button>'
}

function kicker(category, date) {
  return '<div class="em-kicker">' +
    '<span>' + safe(category || 'Noticia') + '</span>' +
    (date ? '<span>' + formatDate(date) + '</span>' : '') +
  '</div>'
}

function miniStory(article) {
  if (!article) return ''
  return '<article class="em-mini-story">' +
    (article.image ? imageTag(article.image, article.title, 'em-mini-photo') : '') +
    '<div>' +
      kicker(article.category, article.date) +
      '<h3>' + safe(article.title || '') + '</h3>' +
      '<p>' + safe(article.summary || '') + '</p>' +
      openArticleButton(article, 'Leer mas') +
    '</div>' +
  '</article>'
}

function mainStory(article) {
  if (!article) return '<p class="em-muted">Las noticias apareceran aqui.</p>'
  return '<article class="em-main-story">' +
    (article.image ? imageTag(article.image, article.title, 'em-main-photo') : '') +
    kicker(article.category, article.date) +
    '<h2>' + safe(article.title || '') + '</h2>' +
    '<p>' + safe(article.summary || '') + '</p>' +
    openArticleButton(article, 'Leer mas') +
  '</article>'
}

function noticeCards() {
  if (!notices.length) {
    return '<article class="em-notice-card"><h3>No hay avisos disponibles</h3><p>Los avisos apareceran aqui.</p></article>'
  }

  return notices.slice(0, 3).map(function(notice) {
    return '<article class="em-notice-card">' +
      '<h3>' + safe(notice.title || 'Aviso') + '</h3>' +
      '<p>' + safe(notice.text || '') + '</p>' +
    '</article>'
  }).join('')
}

function sectionCards() {
  const cats = categoriesData.filter(function(cat) {
    return cat && cat.featured !== false
  }).slice(0, 6)

  if (!cats.length) {
    return '<p class="em-muted">Las secciones apareceran aqui.</p>'
  }

  return cats.map(function(cat) {
    return '<article class="em-section-card">' +
      (cat.image ? imageTag(cat.image, cat.name, 'em-section-photo') : '<div class="em-section-photo empty"></div>') +
      '<h3>' + safe(cat.name || 'Seccion') + '</h3>' +
      '<p>' + safe(cat.description || '') + '</p>' +
    '</article>'
  }).join('')
}

function documentsList() {
  const docs = documents.filter(function(doc) {
    return doc && doc.featured !== false
  }).slice(0, 6)

  if (!docs.length) {
    return '<p class="em-muted">Los documentos oficiales apareceran aqui.</p>'
  }

  return docs.map(function(doc) {
    return '<article class="em-doc-row">' +
      '<div class="em-pdf-icon">PDF</div>' +
      '<div>' +
        '<h3>' + safe(doc.title || 'Documento oficial') + '</h3>' +
        '<p>' + safe(doc.description || '') + '</p>' +
        '<small>' + safe(doc.category || 'Documento') + (doc.date ? ' - ' + formatDate(doc.date) : '') + '</small>' +
      '</div>' +
      (doc.file ? '<a href="' + pathUrl(doc.file) + '" target="_blank" rel="noopener noreferrer">Ver</a>' : '') +
    '</article>'
  }).join('')
}

function reportCards() {
  const reports = [
    ['Inundacion / Drenaje', 'Imbornales, agua acumulada o filtrantes.'],
    ['Seguridad', 'Accesos, vigilancia o situaciones de riesgo.'],
    ['Mantenimiento', 'Calles, luces, tapas o areas comunes.'],
    ['Limpieza', 'Basura, poda, sedimentos o escombros.'],
    ['Agua potable', 'Fugas, baja presion o interrupciones.'],
    ['Otros', 'Otras situaciones comunitarias.']
  ]

  return reports.map(function(item, index) {
    return '<a class="em-report-card" href="' + reportHref(item[0]) + '" target="_blank" rel="noopener noreferrer">' +
      '<span>' + String(index + 1).padStart(2, '0') + '</span>' +
      '<strong>' + safe(item[0]) + '</strong>' +
      '<small>' + safe(item[1]) + '</small>' +
    '</a>'
  }).join('')
}

function controls(label) {
  return '<div class="em-controls">' +
    '<button type="button" class="em-arrow" data-prev-page ' + (currentPage === 0 ? 'disabled' : '') + '>&lsaquo;</button>' +
    '<span>' + safe(label) + ' &middot; Pagina ' + (currentPage + 1) + ' / 6</span>' +
    '<button type="button" class="em-arrow" data-next-page ' + (currentPage === 4 ? 'disabled' : '') + '>&rsaquo;</button>' +
  '</div>'
}

function dots() {
  let html = ''
  for (let i = 0; i < 6; i++) {
    html += '<button type="button" class="em-dot ' + (i === currentPage ? 'is-active' : '') + '" data-go-page="' + i + '"></button>'
  }
  return '<div class="em-dots">' + html + '</div>'
}

function pageCover() {
  const lead = getLead()

  return '<section class="em-page em-cover-page direction-' + pageDirection + '">' +
    controls('Portada') +
    '<div class="em-cover-layout">' +
      '<div class="em-cover-photo">' +
        imageTag(site.heroImage || site.logo, site.siteName, 'em-cover-logo') +
      '</div>' +
      '<div class="em-cover-copy">' +
        kicker(lead ? lead.category : 'Portada', lead ? lead.date : new Date()) +
        '<h1>' + safe(lead ? lead.title : site.heroTitle) + '</h1>' +
        '<p>' + safe(lead ? (lead.summary || '') : (site.heroText || '')) + '</p>' +
        '<div class="em-meta-line">' + safe(site.communityName || '') + ' - ' + safe(site.location || '') + '</div>' +
        (lead ? openArticleButton(lead, site.heroButtonText || 'Leer mas') : '') +
      '</div>' +
    '</div>' +
    dots() +
  '</section>'
}

function pageNewsSections() {
  const list = otherArticles()
  const principal = list[0] || getLead()
  const secondary = list.slice(1, 4)

  return '<section class="em-page direction-' + pageDirection + '">' +
    controls('Noticias y secciones') +
    '<div class="em-spread">' +
      '<div class="em-left">' +
        '<div class="em-section-heading"><h2>Noticias</h2><p>Lo mas relevante de nuestra comunidad</p></div>' +
        mainStory(principal) +
        '<div class="em-notices-grid">' + noticeCards() + '</div>' +
      '</div>' +
      '<div class="em-right">' +
        '<div class="em-section-heading"><h2>Secciones</h2><p>Encuentra lo que necesitas</p></div>' +
        '<div class="em-sections-grid">' + sectionCards() + '</div>' +
        '<div class="em-side-news">' + secondary.map(miniStory).join('') + '</div>' +
      '</div>' +
    '</div>' +
    dots() +
  '</section>'
}

function pageSearch() {
  return '<section class="em-page direction-' + pageDirection + '">' +
    controls('Buscar en el periodico') +
    '<div class="em-single-page">' +
      '<div class="em-section-heading"><h2>Buscar en el periodico</h2><p>Busca noticias, documentos, temas y avisos.</p></div>' +
      '<div class="em-search-bar">' +
        '<input id="searchInput" type="search" value="' + safe(currentSearch) + '" placeholder="Buscar noticias, documentos, temas..." />' +
        '<button type="button" data-search-action>Buscar</button>' +
      '</div>' +
      '<div id="searchResults" class="em-search-results">' + filteredArticles().slice(0, 8).map(miniStory).join('') + '</div>' +
    '</div>' +
    dots() +
  '</section>'
}

function pageDocsReports() {
  return '<section class="em-page direction-' + pageDirection + '">' +
    controls('Documentos y reportes') +
    '<div class="em-spread">' +
      '<div class="em-left">' +
        '<div class="em-section-heading"><h2>Documentos oficiales</h2><p>Transparencia y acceso a la informacion.</p></div>' +
        '<div class="em-doc-list">' + documentsList() + '</div>' +
      '</div>' +
      '<div class="em-right">' +
        '<div class="em-section-heading"><h2>Reportar situaciones</h2><p>Tu reporte ayuda a mejorar nuestra comunidad.</p></div>' +
        '<div class="em-report-grid">' + reportCards() + '</div>' +
      '</div>' +
    '</div>' +
    dots() +
  '</section>'
}


function directivaPhoto(member) {
  if (member.photo) {
    return imageTag(member.photo, member.name, 'em-directiva-photo')
  }

  return '<div class="em-directiva-photo em-directiva-placeholder">' + safe((member.name || member.role || 'J').slice(0, 1)) + '</div>'
}

function directivaCards() {
  if (!directiva.length) {
    return '<p class="em-muted">La informacion de la directiva aparecera aqui.</p>'
  }

  return directiva.map(function(member) {
    return '<article class="em-directiva-card">' +
      directivaPhoto(member) +
      '<div>' +
        '<span>' + safe(member.role || 'Posicion') + '</span>' +
        '<h3>' + safe(member.name || 'Por definir') + '</h3>' +
        (member.phone ? '<p>Tel. ' + safe(member.phone) + '</p>' : '') +
        (member.email ? '<p>' + safe(member.email) + '</p>' : '') +
        (member.description ? '<small>' + safe(member.description) + '</small>' : '') +
      '</div>' +
    '</article>'
  }).join('')
}

function pageDirectiva() {
  return '<section class="em-page direction-' + pageDirection + '">' +
    controls('Directiva Junta de Vecinos') +
    '<div class="em-single-page em-directiva-page">' +
      '<div class="em-section-heading"><h2>Directiva de la Junta de Vecinos</h2><p>Las 19 posiciones oficiales de la Junta de Vecinos y Consejo Disciplinario.</p></div>' +
      '<div class="em-directiva-grid">' + directivaCards() + '</div>' +
    '</div>' +
    dots() +
  '</section>'
}


function pageBackCover() {
  return '<section class="em-page em-back-page direction-' + pageDirection + '">' +
    controls('Cierre') +
    '<div class="em-back-content">' +
      imageTag(site.heroImage || site.logo, site.siteName, 'em-back-logo') +
      '<h2>Informacion que nos une, comunidad que nos fortalece.</h2>' +
      '<p>' + safe(site.communityName || 'Cuesta Hermosa II') + '</p>' +
      '<div class="em-back-actions">' +
        '<a href="' + reportHref() + '" target="_blank" rel="noopener noreferrer">Reportar situacion</a>' +
        '<button type="button" data-go-page="0">Volver a portada</button>' +
      '</div>' +
    '</div>' +
    dots() +
  '</section>'
}

function currentPageHTML() {
  if (currentPage === 0) return pageCover()
  if (currentPage === 1) return pageNewsSections()
  if (currentPage === 2) return pageSearch()
  if (currentPage === 3) return pageDocsReports()
  if (currentPage === 4) return pageDirectiva()
  return pageBackCover()
}

function goToPage(index) {
  const next = Math.max(0, Math.min(5, Number(index)))
  if (next === currentPage) return

  pageDirection = next > currentPage ? 'next' : 'prev'
  currentPage = next
  render()
}

function render() {
  document.documentElement.style.setProperty('--primary', site.primaryColor || DEFAULT_SITE.primaryColor)
  document.documentElement.style.setProperty('--accent', site.accentColor || DEFAULT_SITE.accentColor)
  document.documentElement.style.setProperty('--dark', site.darkColor || DEFAULT_SITE.darkColor)
  document.documentElement.style.setProperty('--paper', site.paperColor || DEFAULT_SITE.paperColor)

  app.innerHTML = '<div class="em-magazine-bg">' +
    '<div class="em-shell">' +
      '<header class="em-header">' +
        '<div class="em-topline">' +
          '<span>' + safe(site.editionLabel || 'Edicion digital') + '</span>' +
          '<span>' + safe(site.location || '') + '</span>' +
          '<span>' + formatDate(new Date()) + '</span>' +
        '</div>' +
        '<button type="button" class="em-logo-button" data-go-page="0" aria-label="Ir a portada">' +
          imageTag('/uploads/logo-masthead-el-mosquito.png', site.siteName, 'em-header-logo') +
          '<span class="em-logo-fallback">' + safe(site.siteName || 'El Mosquito') + '</span>' +
        '</button>' +
        '<nav class="em-nav">' +
          '<button type="button" data-go-page="0">Portada</button>' +
          '<button type="button" data-go-page="1">Noticias</button>' +
          '<button type="button" data-go-page="1">Secciones</button>' +
          '<button type="button" data-go-page="3">Documentos</button>' +
          '<button type="button" data-go-page="3">Reportes</button>' +
          '<button type="button" data-go-page="4">Directiva</button>' +
        '</nav>' +
      '</header>' +
      '<div class="em-update-bar"><strong>Ultima actualizacion</strong><span>' + safe(getLead() ? getLead().title : 'El periodico comunitario esta activo') + '</span></div>' +
      '<main id="emReader" class="em-reader">' + currentPageHTML() + '</main>' +
    '</div>' +
  '</div>' +
  '<dialog id="articleDialog" class="em-dialog">' +
    '<button type="button" class="em-dialog-close" aria-label="Cerrar noticia">x</button>' +
    '<div class="em-dialog-body"></div>' +
  '</dialog>'

  bindEvents()
}

function bindEvents() {
  document.querySelectorAll('[data-go-page]').forEach(function(button) {
    button.addEventListener('click', function() {
      goToPage(button.getAttribute('data-go-page'))
    })
  })

  document.querySelectorAll('[data-prev-page]').forEach(function(button) {
    button.addEventListener('click', function() { goToPage(currentPage - 1) })
  })

  document.querySelectorAll('[data-next-page]').forEach(function(button) {
    button.addEventListener('click', function() { goToPage(currentPage + 1) })
  })

  document.querySelectorAll('[data-open-article]').forEach(function(button) {
    button.addEventListener('click', function() {
      openArticle(button.getAttribute('data-open-article'))
    })
  })

  const input = document.querySelector('#searchInput')
  if (input) {
    input.addEventListener('input', function() {
      currentSearch = input.value || ''
      const results = document.querySelector('#searchResults')
      if (results) results.innerHTML = filteredArticles().slice(0, 8).map(miniStory).join('')
      bindEvents()
    })
  }

  const dialog = document.querySelector('#articleDialog')
  const close = document.querySelector('.em-dialog-close')

  if (dialog && close) {
    close.addEventListener('click', function() {
      dialog.close()
    })

    dialog.addEventListener('click', function(event) {
      if (event.target === dialog) dialog.close()
    })
  }
}

document.onkeydown = function(event) {
  const dialog = document.querySelector('#articleDialog')
  if (event.key === 'Escape' && dialog && dialog.open) {
    dialog.close()
    return
  }
  if (event.key === 'ArrowRight') goToPage(currentPage + 1)
  if (event.key === 'ArrowLeft') goToPage(currentPage - 1)
}

function openArticle(id) {
  const article = articles.find(function(item) { return String(item.id) === String(id) })
  if (!article) return

  const dialog = document.querySelector('#articleDialog')
  const body = document.querySelector('.em-dialog-body')
  if (!dialog || !body) return

  body.innerHTML = '<article class="em-article-detail">' +
    (article.image ? imageTag(article.image, article.title, 'em-article-image') : '') +
    kicker(article.category, article.date) +
    '<h1>' + safe(article.title || '') + '</h1>' +
    '<div class="em-meta-line">' + safe(article.author || 'Redaccion') + '</div>' +
    (article.summary ? '<p class="article-summary">' + safe(article.summary) + '</p>' : '') +
    '<div class="article-full">' + bodyToHTML(article.body || article.summary || '') + '</div>' +
  '</article>'

  dialog.showModal()
}

function showFatalError(error) {
  console.error(error)
  app.innerHTML = '<main style="max-width:760px;margin:40px auto;padding:24px;border:1px solid #ddd;background:#fff;font-family:Arial,sans-serif;">' +
    '<h1>El Mosquito</h1>' +
    '<p>La pagina cargo, pero hubo un error mostrando el contenido.</p>' +
    '<pre style="white-space:pre-wrap;background:#f6f6f6;padding:12px;border:1px solid #ddd;">' + safe(error && error.message ? error.message : error) + '</pre>' +
  '</main>'
}

async function init() {
  try {
    const results = await Promise.all([
      getJSON('/data/site.json', DEFAULT_SITE),
      getJSON('/data/noticias.json', { items: [] }),
      getJSON('/data/avisos.json', { items: [] }),
      getJSON('/data/categorias.json', { items: [] }),
      getJSON('/data/documentos.json', { items: [] }),
      getJSON('/data/directiva.json', { items: [] })
    ])

    site = Object.assign({}, DEFAULT_SITE, results[0] || {})
    articles = normalizeList(results[1])
    notices = normalizeList(results[2])
    categoriesData = normalizeList(results[3])
    documents = normalizeList(results[4])
    directiva = normalizeList(results[5])

    render()
  } catch (error) {
    showFatalError(error)
  }
}

init()
let emDirectivaData = []

function emLoadDirectivaData() {
  return fetch(dataUrl('/data/directiva.json'), { cache: 'no-store' })
    .then(function(response) {
      if (!response.ok) throw new Error('No se pudo cargar directiva.json')
      return response.json()
    })
    .then(function(data) {
      emDirectivaData = normalizeList(data)
    })
    .catch(function(error) {
      console.warn(error)
      emDirectivaData = []
    })
}

function emDirectivaPhoto(member) {
  if (member.photo) {
    return imageTag(member.photo, member.name || member.role, 'em-directiva-photo')
  }

  return '<div class="em-directiva-photo em-directiva-placeholder">' + safe((member.name || member.role || 'J').slice(0, 1)) + '</div>'
}

function emDirectivaCards() {
  if (!emDirectivaData.length) {
    return '<p class="em-muted">La informacion de la directiva aparecera aqui.</p>'
  }

  return emDirectivaData.map(function(member) {
    return '<article class="em-directiva-card">' +
      emDirectivaPhoto(member) +
      '<div>' +
        '<span>' + safe(member.role || 'Posicion') + '</span>' +
        '<h3>' + safe(member.name || 'Por definir') + '</h3>' +
        (member.phone ? '<p>Tel. ' + safe(member.phone) + '</p>' : '') +
        (member.email ? '<p>' + safe(member.email) + '</p>' : '') +
        (member.description ? '<small>' + safe(member.description) + '</small>' : '') +
      '</div>' +
    '</article>'
  }).join('')
}

function pageDirectiva() {
  return '<section class="em-page direction-' + pageDirection + '">' +
    controls('Directiva Junta de Vecinos') +
    '<div class="em-single-page em-directiva-page">' +
      '<div class="em-section-heading"><h2>Directiva de la Junta de Vecinos</h2><p>Las 19 posiciones oficiales de la Junta de Vecinos y el Consejo Disciplinario.</p></div>' +
      '<div class="em-directiva-grid">' + emDirectivaCards() + '</div>' +
    '</div>' +
    dots() +
  '</section>'
}

if (typeof pageBackCover !== 'function') {
  function pageBackCover() {
    return '<section class="em-page em-back-page direction-' + pageDirection + '">' +
      controls('Cierre') +
      '<div class="em-back-content">' +
        imageTag(site.heroImage || site.logo, site.siteName, 'em-back-logo') +
        '<h2>Informacion que nos une, comunidad que nos fortalece.</h2>' +
        '<p>' + safe(site.communityName || 'Cuesta Hermosa II') + '</p>' +
        '<div class="em-back-actions">' +
          '<a href="' + reportHref() + '" target="_blank" rel="noopener noreferrer">Reportar situacion</a>' +
          '<button type="button" data-go-page="0">Volver a portada</button>' +
        '</div>' +
      '</div>' +
      dots() +
    '</section>'
  }
}

/* Reemplaza el contador para que diga 6 paginas. */
controls = function(label) {
  return '<div class="em-controls">' +
    '<button type="button" class="em-arrow" data-prev-page ' + (currentPage === 0 ? 'disabled' : '') + '>&lsaquo;</button>' +
    '<span>' + safe(label) + ' &middot; Pagina ' + (currentPage + 1) + ' / 6</span>' +
    '<button type="button" class="em-arrow" data-next-page ' + (currentPage === 5 ? 'disabled' : '') + '>&rsaquo;</button>' +
  '</div>'
}

/* Reemplaza los puntos para que sean 6. */
dots = function() {
  let html = ''
  for (let i = 0; i < 6; i++) {
    html += '<button type="button" class="em-dot ' + (i === currentPage ? 'is-active' : '') + '" data-go-page="' + i + '"></button>'
  }
  return '<div class="em-dots">' + html + '</div>'
}

/* Reemplaza el cambio de pagina para permitir llegar hasta la pagina 6. */
goToPage = function(index) {
  const next = Math.max(0, Math.min(5, Number(index)))
  if (next === currentPage) return

  pageDirection = next > currentPage ? 'next' : 'prev'
  currentPage = next
  render()
}

/* Reemplaza el mapa de paginas:
   1 Portada
   2 Noticias y secciones
   3 Buscador
   4 Documentos y reportes
   5 Directiva
   6 Contraportada
*/
currentPageHTML = function() {
  if (currentPage === 0) return pageCover()
  if (currentPage === 1) return pageNewsSections()
  if (currentPage === 2) return pageSearch()
  if (currentPage === 3) return pageDocsReports()
  if (currentPage === 4) return pageDirectiva()
  return pageBackCover()
}

/* Agrega el boton Directiva en el menu si no existe. */
const emOldRender = render
render = function() {
  emOldRender()

  const nav = document.querySelector('.em-nav')
  if (nav && !nav.querySelector('[data-go-page="4"]')) {
    const button = document.createElement('button')
    button.type = 'button'
    button.setAttribute('data-go-page', '4')
    button.textContent = 'Directiva'
    button.addEventListener('click', function() {
      goToPage(4)
    })
    nav.appendChild(button)
  }
}

emLoadDirectivaData().then(function() {
  setTimeout(function() {
    if (typeof render === 'function') render()
  }, 300)
})
