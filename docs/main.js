const DEFAULT_SITE = {
  siteName: 'El Mosquito',
  communityName: 'Cuesta Hermosa II',
  subtitle: 'Periodico comunitario de Cuesta Hermosa II',
  tagline: 'Noticias, avisos y participacion vecinal',
  logo: '/uploads/logo-cuesta-hermosa.jpg',
  heroImage: '/uploads/logo-el-mosquito.jpg',
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

function renderArticleCard(article, compact) {
  return '<article class="' + (compact ? 'side-story' : 'news-row professional-news-row') + '">' +
    '<div class="row-kicker">' +
      '<span>' + safe(article.category || 'Noticia') + '</span>' +
      (article.date ? '<span>' + formatDate(article.date) + '</span>' : '') +
    '</div>' +
    '<h3>' + safe(article.title) + '</h3>' +
    (compact ? '' : '<p>' + safe(article.summary || '') + '</p>') +
    '<button class="text-button" data-open-article="' + safe(article.id || '') + '">Leer noticia</button>' +
  '</article>'
}

function renderDocuments() {
  const list = documents.filter(function(doc) { return doc && doc.featured !== false })

  if (!list.length) return ''

  return '<section id="documentos" class="documents-section official-documents">' +
    '<div class="section-heading">' +
      '<span>Archivo institucional</span>' +
      '<h2>Documentos oficiales</h2>' +
    '</div>' +
    '<div class="documents-grid">' +
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
    '</div>' +
  '</section>'
}

function renderReportSection() {
  const reports = [
    ['Inundacion / Drenaje', 'Imbornales, acumulacion de agua o filtrantes.'],
    ['Seguridad', 'Accesos, vigilancia o situaciones de riesgo.'],
    ['Mantenimiento', 'Calles, luces, tapas o areas comunes.'],
    ['Limpieza', 'Basura, escombros, poda o sedimentos.'],
    ['Otro reporte', 'Cualquier situacion comunitaria.']
  ]

  return '<section id="reportar" class="report-section professional-report">' +
    '<div class="section-heading compact-heading">' +
      '<span>Participacion comunitaria</span>' +
      '<h2>Reportar situaciones</h2>' +
    '</div>' +
    '<p class="report-intro">Usa esta seccion para reportar situaciones que afecten la seguridad, el mantenimiento, el drenaje, la limpieza o la convivencia dentro de Cuesta Hermosa II.</p>' +
    '<div class="report-grid">' +
      reports.map(function(item, index) {
        return '<a class="report-card" href="' + reportHref(item[0]) + '" target="_blank" rel="noopener noreferrer">' +
          '<span>' + String(index + 1).padStart(2, '0') + '</span>' +
          '<strong>' + safe(item[0]) + '</strong>' +
          '<small>' + safe(item[1]) + '</small>' +
        '</a>'
      }).join('') +
    '</div>' +
    '<p class="report-note">Al enviar el reporte, incluye ubicacion exacta, foto si la tienes, hora aproximada y una breve descripcion.</p>' +
  '</section>'
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
      ? list.map(function(article) { return renderArticleCard(article, false) }).join('')
      : '<div class="empty-state">No encontramos publicaciones con ese filtro.</div>'
  }

  if (resultsCount) {
    resultsCount.textContent = list.length + ' publicaciones'
  }

  bindArticleButtons()
}

function render() {
  document.documentElement.style.setProperty('--primary', site.primaryColor || DEFAULT_SITE.primaryColor)
  document.documentElement.style.setProperty('--accent', site.accentColor || DEFAULT_SITE.accentColor)
  document.documentElement.style.setProperty('--dark', site.darkColor || DEFAULT_SITE.darkColor)
  document.documentElement.style.setProperty('--paper', site.paperColor || DEFAULT_SITE.paperColor)

  const sorted = sortByDate(articles)
  const lead = sorted.find(function(article) { return article.featured }) || sorted[0]
  const side = sorted.filter(function(article) { return !lead || article.id !== lead.id }).slice(0, 3)
  const news = sorted.filter(function(article) { return !lead || article.id !== lead.id })
  const categories = categoriesData.filter(function(category) { return category && category.featured !== false })

  app.innerHTML = '<div class="page newspaper-page">' +
    '<header class="masthead professional-masthead">' +
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
        '<a href="#portada">Portada</a>' +
        '<a href="#noticias">Noticias</a>' +
        '<a href="#categorias">Categorias</a>' +
        '<a href="#documentos">Documentos</a>' +
        '<a href="#reportar">Reportar</a>' +
        '<a href="#avisos">Avisos</a>' +
      '</nav>' +
    '</header>' +

    '<main>' +
      renderTopUpdate(lead) +

      '<section id="portada" class="hero-section professional-hero">' +
        '<div class="section-heading">' +
          '<span>' + safe(site.heroLabel || 'Portada') + '</span>' +
          '<h2>' + safe(site.heroTitle || 'La voz comunitaria') + '</h2>' +
        '</div>' +
        '<div class="front-grid">' +
          '<article class="lead-story">' +
            getImage(site.heroImage || site.logo, site.siteName, 'story-image lead-image fixed-cover-image') +
            '<div class="lead-content">' +
              '<span class="eyebrow">' + safe(lead ? (lead.category || 'Noticia principal') : 'Portada') + '</span>' +
              '<h2>' + safe(lead ? lead.title : site.heroTitle) + '</h2>' +
              '<p>' + safe(lead ? (lead.summary || '') : (site.heroText || '')) + '</p>' +
              '<div class="story-meta">' +
                '<span>' + safe(lead ? (lead.author || 'Redaccion') : 'Redaccion') + '</span>' +
                (lead && lead.date ? '<span>' + formatDate(lead.date) + '</span>' : '') +
              '</div>' +
              (lead ? '<button class="primary-button" data-open-article="' + safe(lead.id || '') + '">' + safe(site.heroButtonText || 'Leer portada') + '</button>' : '') +
            '</div>' +
          '</article>' +
          '<aside class="front-side secondary-front">' +
            '<div class="front-side-title">En desarrollo</div>' +
            side.map(function(article) { return renderArticleCard(article, true) }).join('') +
          '</aside>' +
        '</div>' +
      '</section>' +

      '<section class="interactive-panel professional-search">' +
        '<div class="search-box">' +
          '<label for="searchInput">Buscar en el periodico</label>' +
          '<input id="searchInput" type="search" placeholder="Buscar: imbornales, elecciones, seguridad..." />' +
        '</div>' +
        '<div class="interactive-meta">' +
          '<span id="resultsCount">' + news.length + ' publicaciones</span>' +
          '<a href="#documentos">Ver documentos</a>' +
          '<a href="' + reportHref() + '" target="_blank" rel="noopener noreferrer">Reportar situacion</a>' +
        '</div>' +
      '</section>' +

      '<section id="categorias" class="categories-section professional-categories">' +
        '<div class="section-heading compact-heading">' +
          '<span>Secciones</span>' +
          '<h2>Explorar por categoria</h2>' +
        '</div>' +
        '<div class="category-ribbon">' +
          '<button class="category-card is-active" data-filter-category="all"><span>Todas</span><p>Ver todas.</p></button>' +
          categories.map(function(category) {
            return '<button class="category-card" data-filter-category="' + safe(category.name || '') + '">' +
              '<span>' + safe(category.name || 'Categoria') + '</span>' +
              '<p>' + safe(category.description || '') + '</p>' +
            '</button>'
          }).join('') +
        '</div>' +
      '</section>' +

      '<section class="content-layout professional-layout">' +
        '<div id="noticias" class="news-section">' +
          '<div class="section-heading">' +
            '<span>Noticias</span>' +
            '<h2>Ultimas publicaciones</h2>' +
          '</div>' +
          '<div id="newsList" class="news-list">' +
            news.map(function(article) { return renderArticleCard(article, false) }).join('') +
          '</div>' +
        '</div>' +
        '<aside id="avisos" class="sidebar professional-sidebar">' +
          '<div class="sidebar-block urgent">' +
            '<h2>Avisos</h2>' +
            '<div class="notice-list">' +
              (notices.length ? notices.map(function(notice) {
                return '<article class="notice-item"><h3>' + safe(notice.title || 'Aviso') + '</h3><p>' + safe(notice.text || '') + '</p></article>'
              }).join('') : '<article class="notice-item"><h3>No hay avisos disponibles</h3><p>Los avisos comunitarios apareceran aqui.</p></article>') +
            '</div>' +
          '</div>' +
        '</aside>' +
      '</section>' +

      renderDocuments() +
      renderReportSection() +
    '</main>' +

    '<footer class="footer professional-footer">' +
      '<div><strong>' + safe(site.siteName) + ' - ' + safe(site.communityName) + '</strong><p>Medio informativo vecinal para noticias, avisos, documentos oficiales y participacion comunitaria.</p></div>' +
      '<nav><a href="#portada">Portada</a><a href="#noticias">Noticias</a><a href="#documentos">Documentos</a><a href="#reportar">Reportar</a></nav>' +
    '</footer>' +
  '</div>' +
  '<a class="floating-report" href="' + reportHref() + '" target="_blank" rel="noopener noreferrer">Reportar situacion</a>' +
  '<div id="articleModal" class="article-dialog" hidden><button class="dialog-close" type="button">x</button><div class="dialog-body"></div></div>'

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

  const modal = document.querySelector('#articleModal')
  const closeButton = document.querySelector('.dialog-close')

  if (modal && closeButton) {
    closeButton.addEventListener('click', function() {
      modal.hidden = true
    })
  }
}

function openArticle(id) {
  const article = articles.find(function(item) { return String(item.id) === String(id) })
  if (!article) return

  const modal = document.querySelector('#articleModal')
  const body = document.querySelector('#articleModal .dialog-body')
  if (!modal || !body) return

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

  modal.hidden = false
}

function showFatalError(error) {
  console.error(error)

  app.innerHTML = '<main style="max-width:760px;margin:40px auto;padding:24px;border:1px solid #ddd;background:#fff;font-family:Arial,sans-serif;">' +
    '<h1 style="margin-top:0;">El Mosquito</h1>' +
    '<p>La pagina cargo, pero hubo un error mostrando el contenido.</p>' +
    '<p style="color:#777;">Esto confirma que el problema esta en JavaScript o en algun archivo de datos.</p>' +
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
