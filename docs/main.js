const DEFAULT_SITE = {
  siteName: 'El Mosquito',
  communityName: 'Cuesta Hermosa II',
  subtitle: 'Periodico comunitario de Cuesta Hermosa II',
  tagline: 'Noticias, avisos y participacion vecinal',
  logo: '/uploads/logo-encabezado-mosquito.png',
  heroImage: '/uploads/logo-el-mosquito-transparente.png',
  location: 'Cuesta Hermosa II - Santo Domingo',
  editionLabel: 'Edicion digital',
  heroLabel: 'Portada',
  heroTitle: 'La voz comunitaria de Cuesta Hermosa II',
  heroText: 'Un espacio editorial para informar, organizar y conectar a los residentes con noticias, avisos, mantenimiento, seguridad y actividades de interes comun.',
  heroButtonText: 'Leer portada',
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
let currentCategory = 'all'
let currentSearch = ''
let currentMagazinePage = 0
let magazineDirection = 'next'

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

function sortByDate(items) {
  return items.slice().sort(function(a, b) {
    return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
  })
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

function getImage(path, alt, className) {
  if (!path) return '<div class="' + className + ' fallback-image"><span>El Mosquito</span></div>'

  return '<img class="' + className + '" src="' + pathUrl(path) + '" alt="' + safe(alt || 'Imagen') + '" loading="lazy" />'
}

function reportHref(type) {
  const number = String(site.whatsappNumber || '').replace(/\D/g, '')
  if (!number) return '#reportar'

  const message = type
    ? 'Hola, quiero reportar una situacion para El Mosquito / Cuesta Hermosa II.\n\nTipo de reporte: ' + type + '\nUbicacion exacta:\nDescripcion:\nFoto o evidencia:'
    : 'Hola, quiero reportar una situacion para El Mosquito / Cuesta Hermosa II.'

  return 'https://wa.me/' + number + '?text=' + encodeURIComponent(message)
}

function renderTopUpdate(lead) {
  const parts = []
  if (lead && lead.title) parts.push('Principal: ' + safe(lead.title))
  if (documents.length) parts.push('Documentos oficiales disponibles')
  if (notices.length) parts.push('Avisos comunitarios activos')

  if (!parts.length) return ''

  return '<section class="update-bar">' +
    '<span>Ultima actualizacion</span>' +
    '<div>' + parts.slice(0, 3).join(' &middot; ') + '</div>' +
  '</section>'
}

function renderArticleButton(article, label) {
  if (!article) return ''
  return '<button class="text-button" data-open-article="' + safe(article.id || '') + '">' + safe(label || 'Leer noticia') + '</button>'
}

function renderSmallArticle(article) {
  return '<article class="magazine-mini-story">' +
    '<div class="row-kicker">' +
      '<span>' + safe(article.category || 'Noticia') + '</span>' +
      (article.date ? '<span>' + formatDate(article.date) + '</span>' : '') +
    '</div>' +
    '<h3>' + safe(article.title || '') + '</h3>' +
    '<p>' + safe(article.summary || '') + '</p>' +
    renderArticleButton(article, 'Leer') +
  '</article>'
}

function renderArticleCard(article) {
  return '<article class="news-row professional-news-row">' +
    '<div class="row-kicker">' +
      '<span>' + safe(article.category || 'Noticia') + '</span>' +
      (article.date ? '<span>' + formatDate(article.date) + '</span>' : '') +
    '</div>' +
    '<h3>' + safe(article.title || '') + '</h3>' +
    '<p>' + safe(article.summary || '') + '</p>' +
    renderArticleButton(article, 'Leer noticia') +
  '</article>'
}

function getFilteredArticles() {
  let list = sortByDate(articles)

  if (currentCategory !== 'all') {
    list = list.filter(function(article) {
      return article.category === currentCategory
    })
  }

  if (currentSearch.trim()) {
    const query = currentSearch.trim().toLowerCase()
    list = list.filter(function(article) {
      const content = [
        article.title,
        article.summary,
        article.category,
        article.author,
        article.body
      ].join(' ').toLowerCase()

      return content.indexOf(query) !== -1
    })
  }

  return list
}

function updateNewsList() {
  const newsList = document.querySelector('#newsList')
  const resultsCount = document.querySelector('#resultsCount')
  const list = getFilteredArticles()

  if (newsList) {
    newsList.innerHTML = list.length
      ? list.map(function(article) { return renderArticleCard(article) }).join('')
      : '<div class="empty-state">No encontramos publicaciones con ese filtro.</div>'
  }

  if (resultsCount) {
    resultsCount.textContent = list.length + ' publicaciones'
  }

  bindArticleButtons()
}

function renderDocuments() {
  const list = documents.filter(function(doc) { return doc && doc.featured !== false })

  if (!list.length) return '<p class="magazine-muted">No hay documentos disponibles en este momento.</p>'

  return '<div class="documents-grid magazine-documents-grid">' +
    list.map(function(doc) {
      return '<details class="document-card">' +
        '<summary>' +
          '<span>' + safe(doc.category || 'Documento') + '</span>' +
          '<strong>' + safe(doc.title || 'Documento oficial') + '</strong>' +
        '</summary>' +
        (doc.description ? '<p>' + safe(doc.description) + '</p>' : '') +
        (doc.date ? '<small>' + formatDate(doc.date) + '</small>' : '') +
        (doc.file ? '<a href="' + pathUrl(doc.file) + '" target="_blank" rel="noopener noreferrer">Descargar archivo</a>' : '') +
      '</details>'
    }).join('') +
  '</div>'
}

function renderNotices() {
  if (!notices.length) {
    return '<article class="notice-item"><h3>No hay avisos disponibles</h3><p>Los avisos comunitarios apareceran aqui.</p></article>'
  }

  return notices.map(function(notice) {
    return '<article class="notice-item"><h3>' + safe(notice.title || 'Aviso') + '</h3><p>' + safe(notice.text || '') + '</p></article>'
  }).join('')
}

function renderReportSection() {
  const reports = [
    ['Inundacion / Drenaje', 'Imbornales, acumulacion de agua o filtrantes.'],
    ['Seguridad', 'Accesos, vigilancia o situaciones de riesgo.'],
    ['Mantenimiento', 'Calles, luces, tapas o areas comunes.'],
    ['Limpieza', 'Basura, escombros, poda o sedimentos.'],
    ['Otro reporte', 'Cualquier situacion comunitaria.']
  ]

  return '<div class="report-grid">' +
    reports.map(function(item, index) {
      return '<a class="report-card" href="' + reportHref(item[0]) + '" target="_blank" rel="noopener noreferrer">' +
        '<span>' + String(index + 1).padStart(2, '0') + '</span>' +
        '<strong>' + safe(item[0]) + '</strong>' +
        '<small>' + safe(item[1]) + '</small>' +
      '</a>'
    }).join('') +
  '</div>'
}

function renderMagazineControls(totalPages, label) {
  return '<div class="magazine-controls">' +
    '<button class="magazine-control" data-magazine-prev type="button"' + (currentMagazinePage === 0 ? ' disabled' : '') + '>Anterior</button>' +
    '<span>Pagina ' + (currentMagazinePage + 1) + ' de ' + totalPages + '</span>' +
    '<button class="magazine-control primary" data-magazine-next type="button"' + (currentMagazinePage === totalPages - 1 ? ' disabled' : '') + '>Siguiente</button>' +
  '</div>' +
  '<div class="magazine-page-label">' + safe(label || '') + '</div>'
}

function renderMagazineDots(totalPages) {
  let dots = ''
  for (let i = 0; i < totalPages; i++) {
    dots += '<button class="magazine-dot ' + (i === currentMagazinePage ? 'is-active' : '') + '" data-magazine-go="' + i + '" type="button" aria-label="Ir a pagina ' + (i + 1) + '"></button>'
  }
  return '<div class="magazine-dots">' + dots + '</div>'
}

function renderMagazinePage(pageIndex, totalPages, lead, side, moreNews, categories) {
  const pageClass = 'magazine-page magazine-page-' + pageIndex + ' is-active direction-' + magazineDirection

  if (pageIndex === 0) {
    return '<section id="portada" class="' + pageClass + '">' +
      renderMagazineControls(totalPages, 'Portada') +
      '<div class="magazine-spread cover-spread">' +
        '<div class="magazine-cover-image">' +
          getImage(site.heroImage || site.logo, site.siteName, 'story-image lead-image fixed-cover-image') +
        '</div>' +
        '<article class="magazine-cover-story">' +
          '<span class="eyebrow">' + safe(lead ? (lead.category || 'Noticia principal') : 'Portada') + '</span>' +
          '<h2>' + safe(lead ? lead.title : site.heroTitle) + '</h2>' +
          '<p>' + safe(lead ? (lead.summary || '') : (site.heroText || '')) + '</p>' +
          '<div class="story-meta">' +
            '<span>' + safe(lead ? (lead.author || 'Redaccion') : 'Redaccion') + '</span>' +
            (lead && lead.date ? '<span>' + formatDate(lead.date) + '</span>' : '') +
          '</div>' +
          (lead ? '<button class="primary-button" data-open-article="' + safe(lead.id || '') + '">' + safe(site.heroButtonText || 'Leer portada') + '</button>' : '') +
        '</article>' +
      '</div>' +
      renderMagazineDots(totalPages) +
    '</section>'
  }

  if (pageIndex === 1) {
    return '<section id="noticias" class="' + pageClass + '">' +
      renderMagazineControls(totalPages, 'Noticias principales') +
      '<div class="magazine-spread two-column-spread">' +
        '<div class="magazine-column main-column">' +
          '<div class="section-heading"><span>En desarrollo</span><h2>Noticias principales</h2></div>' +
          side.concat(moreNews.slice(0, 1)).map(renderSmallArticle).join('') +
        '</div>' +
        '<aside class="magazine-column side-column">' +
          '<div class="section-heading"><span>Avisos</span><h2>Comunidad</h2></div>' +
          '<div class="notice-list">' + renderNotices() + '</div>' +
        '</aside>' +
      '</div>' +
      renderMagazineDots(totalPages) +
    '</section>'
  }

  if (pageIndex === 2) {
    return '<section id="categorias" class="' + pageClass + '">' +
      renderMagazineControls(totalPages, 'Secciones') +
      '<div class="magazine-spread">' +
        '<div class="magazine-full">' +
          '<div class="section-heading"><span>Secciones</span><h2>Explorar el periodico</h2></div>' +
          '<section class="interactive-panel professional-search magazine-search">' +
            '<div class="search-box">' +
              '<label for="searchInput">Buscar en el periodico</label>' +
              '<input id="searchInput" type="search" placeholder="Buscar: imbornales, elecciones, seguridad..." value="' + safe(currentSearch) + '" />' +
            '</div>' +
            '<div class="interactive-meta">' +
              '<span id="resultsCount">' + getFilteredArticles().length + ' publicaciones</span>' +
              '<a href="#documentos" data-magazine-link="3">Ver documentos</a>' +
              '<a href="' + reportHref() + '" target="_blank" rel="noopener noreferrer">Reportar situacion</a>' +
            '</div>' +
          '</section>' +
          '<div class="category-ribbon magazine-category-ribbon">' +
            '<button class="category-card ' + (currentCategory === 'all' ? 'is-active' : '') + '" data-filter-category="all"><span>Todas</span><p>Ver todas.</p></button>' +
            categories.map(function(category) {
              return '<button class="category-card ' + (currentCategory === category.name ? 'is-active' : '') + '" data-filter-category="' + safe(category.name || '') + '">' +
                '<span>' + safe(category.name || 'Categoria') + '</span>' +
                '<p>' + safe(category.description || '') + '</p>' +
              '</button>'
            }).join('') +
          '</div>' +
          '<div id="newsList" class="news-list magazine-news-list">' +
            getFilteredArticles().map(renderArticleCard).join('') +
          '</div>' +
        '</div>' +
      '</div>' +
      renderMagazineDots(totalPages) +
    '</section>'
  }

  if (pageIndex === 3) {
    return '<section id="documentos" class="' + pageClass + '">' +
      renderMagazineControls(totalPages, 'Archivo institucional') +
      '<div class="magazine-spread">' +
        '<div class="magazine-full">' +
          '<div class="section-heading"><span>Archivo institucional</span><h2>Documentos oficiales</h2></div>' +
          renderDocuments() +
        '</div>' +
      '</div>' +
      renderMagazineDots(totalPages) +
    '</section>'
  }

  return '<section id="reportar" class="' + pageClass + '">' +
    renderMagazineControls(totalPages, 'Participacion comunitaria') +
    '<div class="magazine-spread">' +
      '<div class="magazine-full">' +
        '<div class="section-heading"><span>Participacion comunitaria</span><h2>Reportar situaciones</h2></div>' +
        '<p class="report-intro">Usa esta seccion para reportar situaciones que afecten la seguridad, el mantenimiento, el drenaje, la limpieza o la convivencia dentro de Cuesta Hermosa II.</p>' +
        renderReportSection() +
        '<p class="report-note">Al enviar el reporte, incluye ubicacion exacta, foto si la tienes, hora aproximada y una breve descripcion.</p>' +
      '</div>' +
    '</div>' +
    renderMagazineDots(totalPages) +
  '</section>'
}

function goToMagazinePage(index) {
  const totalPages = 5
  const nextIndex = Math.max(0, Math.min(totalPages - 1, Number(index)))

  if (nextIndex === currentMagazinePage) return

  magazineDirection = nextIndex > currentMagazinePage ? 'next' : 'prev'
  currentMagazinePage = nextIndex
  render()

  const reader = document.querySelector('#revista')
  if (reader) {
    reader.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

function render() {
  document.documentElement.style.setProperty('--primary', site.primaryColor || DEFAULT_SITE.primaryColor)
  document.documentElement.style.setProperty('--accent', site.accentColor || DEFAULT_SITE.accentColor)
  document.documentElement.style.setProperty('--dark', site.darkColor || DEFAULT_SITE.darkColor)
  document.documentElement.style.setProperty('--paper', site.paperColor || DEFAULT_SITE.paperColor)

  const sorted = sortByDate(articles)
  const lead = sorted.find(function(article) { return article.featured }) || sorted[0]
  const side = sorted.filter(function(article) { return !lead || article.id !== lead.id }).slice(0, 3)
  const moreNews = sorted.filter(function(article) { return !lead || article.id !== lead.id }).slice(3)
  const categories = categoriesData.filter(function(category) { return category && category.featured !== false })
  const totalPages = 5

  app.innerHTML = '<div class="page newspaper-page magazine-site">' +
    '<header class="masthead professional-masthead magazine-masthead">' +
      '<div class="topline">' +
        '<span>' + safe(site.editionLabel || 'Edicion digital') + '</span>' +
        '<span>' + safe(site.location || '') + '</span>' +
        '<span>' + formatDate(new Date()) + '</span>' +
      '</div>' +
      '<div class="brand-row">' +
        (site.logo ? '<img class="brand-logo" src="' + pathUrl(site.logo) + '" alt="' + safe(site.communityName) + '" />' : '') +
        '<div class="masthead-title">' +
          '<p>' + safe(site.subtitle || '') + '</p>' +
          '<h1>' + safe(site.siteName || 'El Mosquito') + '</h1>' +
          '<span>' + safe(site.tagline || '') + '</span>' +
        '</div>' +
      '</div>' +
      '<nav class="nav-links professional-nav">' +
        '<a href="#portada" data-magazine-link="0">Portada</a>' +
        '<a href="#noticias" data-magazine-link="1">Noticias</a>' +
        '<a href="#categorias" data-magazine-link="2">Secciones</a>' +
        '<a href="#documentos" data-magazine-link="3">Documentos</a>' +
        '<a href="#reportar" data-magazine-link="4">Reportar</a>' +
      '</nav>' +
    '</header>' +

    '<main>' +
      renderTopUpdate(lead) +
      '<section id="revista" class="magazine-reader" aria-live="polite">' +
        renderMagazinePage(currentMagazinePage, totalPages, lead, side, moreNews, categories) +
      '</section>' +
    '</main>' +

    '<footer class="footer professional-footer magazine-footer">' +
      '<div><strong>' + safe(site.siteName) + ' - ' + safe(site.communityName) + '</strong><p>Medio informativo vecinal para noticias, avisos, documentos oficiales y participacion comunitaria.</p></div>' +
      '<nav><a href="#portada" data-magazine-link="0">Portada</a><a href="#noticias" data-magazine-link="1">Noticias</a><a href="#documentos" data-magazine-link="3">Documentos</a><a href="#reportar" data-magazine-link="4">Reportar</a></nav>' +
    '</footer>' +
  '</div>' +
  '<a class="floating-report" href="' + reportHref() + '" target="_blank" rel="noopener noreferrer">Reportar situacion</a>' +
  '<dialog id="articleDialog" class="article-dialog magazine-dialog">' +
    '<button class="dialog-close" type="button" aria-label="Cerrar noticia">x</button>' +
    '<div class="dialog-body"></div>' +
  '</dialog>'

  bindEvents()
}

function bindArticleButtons() {
  document.querySelectorAll('[data-open-article]').forEach(function(button) {
    button.addEventListener('click', function() {
      openArticle(button.getAttribute('data-open-article'))
    })
  })
}

function bindEvents() {
  bindArticleButtons()

  document.querySelectorAll('[data-magazine-prev]').forEach(function(button) {
    button.addEventListener('click', function() {
      goToMagazinePage(currentMagazinePage - 1)
    })
  })

  document.querySelectorAll('[data-magazine-next]').forEach(function(button) {
    button.addEventListener('click', function() {
      goToMagazinePage(currentMagazinePage + 1)
    })
  })

  document.querySelectorAll('[data-magazine-go]').forEach(function(button) {
    button.addEventListener('click', function() {
      goToMagazinePage(button.getAttribute('data-magazine-go'))
    })
  })

  document.querySelectorAll('[data-magazine-link]').forEach(function(link) {
    link.addEventListener('click', function(event) {
      event.preventDefault()
      goToMagazinePage(link.getAttribute('data-magazine-link'))
    })
  })

  const searchInput = document.querySelector('#searchInput')
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      currentSearch = searchInput.value || ''
      updateNewsList()
    })
  }

  document.querySelectorAll('[data-filter-category]').forEach(function(button) {
    button.addEventListener('click', function() {
      currentCategory = button.getAttribute('data-filter-category') || 'all'

      document.querySelectorAll('[data-filter-category]').forEach(function(item) {
        item.classList.remove('is-active')
      })

      button.classList.add('is-active')
      updateNewsList()
    })
  })

  const dialog = document.querySelector('#articleDialog')
  const closeButton = document.querySelector('.dialog-close')

  if (dialog && closeButton) {
    closeButton.addEventListener('click', function() {
      dialog.close()
    })

    dialog.addEventListener('click', function(event) {
      if (event.target === dialog) {
        dialog.close()
      }
    })
  }

  document.addEventListener('keydown', handleMagazineKeys)
}

function handleMagazineKeys(event) {
  if (event.key === 'ArrowRight') {
    goToMagazinePage(currentMagazinePage + 1)
  }

  if (event.key === 'ArrowLeft') {
    goToMagazinePage(currentMagazinePage - 1)
  }

  if (event.key === 'Escape') {
    const dialog = document.querySelector('#articleDialog')
    if (dialog && dialog.open) dialog.close()
  }
}

function openArticle(id) {
  const article = articles.find(function(item) { return String(item.id) === String(id) })
  if (!article) return

  const dialog = document.querySelector('#articleDialog')
  const body = document.querySelector('#articleDialog .dialog-body')
  if (!dialog || !body) return

  body.innerHTML = '<article class="article-detail">' +
    (article.image ? getImage(article.image, article.title, 'article-detail-image') : '') +
    '<span class="eyebrow">' + safe(article.category || 'Noticia') + '</span>' +
    '<h1>' + safe(article.title || '') + '</h1>' +
    '<div class="story-meta">' +
      '<span>' + safe(article.author || 'Redaccion') + '</span>' +
      (article.date ? '<span>' + formatDate(article.date) + '</span>' : '') +
    '</div>' +
    (article.summary ? '<p class="article-summary">' + safe(article.summary) + '</p>' : '') +
    '<div class="article-full">' + bodyToHTML(article.body || article.summary || '') + '</div>' +
  '</article>'

  dialog.showModal()
}

function showFatalError(error) {
  console.error(error)

  app.innerHTML = '<main style="max-width:760px;margin:40px auto;padding:24px;border:1px solid #ddd;background:#fff;font-family:Arial,sans-serif;">' +
    '<h1 style="margin-top:0;">El Mosquito</h1>' +
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
      getJSON('/data/documentos.json', { items: [] })
    ])

    site = Object.assign({}, DEFAULT_SITE, results[0] || {})
    articles = normalizeList(results[1])
    notices = normalizeList(results[2])
    categoriesData = normalizeList(results[3])
    documents = normalizeList(results[4])

    render()
  } catch (error) {
    showFatalError(error)
  }
}

init()
