* V7 main.js - ASCII safe. Accents are encoded to avoid mojibake. */
const DEFAULT_SITE = {
  siteName: 'El Mosquito',
  communityName: 'Cuesta Hermosa II',
  subtitle: 'Peri\u00f3dico comunitario de Cuesta Hermosa II',
  tagline: 'Noticias, avisos y participaci\u00f3n vecinal',
  logo: '/uploads/logo-cuesta-hermosa.jpg',
  heroImage: '/uploads/logo-el-mosquito.jpg',
  location: 'Cuesta Hermosa II \u00b7 Santo Domingo',
  editionLabel: 'Edici\u00f3n digital',
  heroLabel: 'Portada',
  heroTitle: 'La voz comunitaria de Cuesta Hermosa II',
  heroText: 'Un espacio editorial para informar, organizar y conectar a los residentes con noticias, avisos, mantenimiento, seguridad y actividades de inter\u00e9s com\u00fan.',
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
let currentLeadId = ''

const app = document.querySelector('#app') || document.body

function pathUrl(path) {
  if (!path) return ''
  if (path.startsWith('http')) return path

  const clean = path.replace(/^\.?\//, '').replace(/^\//, '')
  return `${BASE_PATH}/${clean}`
}

function imageUrl(path) {
  return pathUrl(path)
}

function assetUrl(path) {
  return pathUrl(path)
}

function dataUrl(path) {
  const clean = path.replace(/^\.?\//, '').replace(/^\//, '')
  return `${BASE_PATH}/${clean}`
}

async function getJSON(path, fallback) {
  try {
    const response = await fetch(dataUrl(path), {
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`No se pudo cargar ${path}`)
    }

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

function safe(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function formatDate(dateValue) {
  if (!dateValue) return ''

  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat('es-DO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date)
}

function sortByDate(items) {
  return [...items].sort((a, b) => {
    const dateA = new Date(a.date || 0).getTime()
    const dateB = new Date(b.date || 0).getTime()
    return dateB - dateA
  })
}

function getCategoryInfo(categoryName) {
  return categoriesData.find((category) => category.name === categoryName) || {}
}

function featuredCategories() {
  return [...categoriesData]
    .filter((category) => category.featured !== false)
    .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
}

function bodyToHTML(text) {
  if (!text) return ''

  return String(text)
    .split('\n\n')
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${safe(paragraph).replaceAll('\n', '<br>')}</p>`)
    .join('')
}

function articleImage(article, className = '') {
  const src = imageUrl(article.image)

  if (src) {
    return `
      <img
        class="story-image ${className}"
        src="${src}"
        alt="${safe(article.title)}"
        loading="lazy"
      />
    `
  }

  const category = getCategoryInfo(article.category)
  const categorySrc = imageUrl(category.image)

  if (categorySrc) {
    return `
      <img
        class="story-image ${className}"
        src="${categorySrc}"
        alt="${safe(article.category)}"
        loading="lazy"
      />
    `
  }

  if (site.logo) {
    return `
      <div class="fallback-image ${className}">
        <img src="${imageUrl(site.logo)}" alt="${safe(site.communityName)}" />
      </div>
    `
  }

  return `
    <div class="fallback-image ${className}">
      <span>${safe(site.siteName)}</span>
    </div>
  `
}

function siteHeroImage(className = '') {
  const src = imageUrl(site.heroImage || site.logo)

  if (src) {
    return `
      <img
        class="story-image ${className}"
        src="${src}"
        alt="${safe(site.siteName || 'El Mosquito')}"
        loading="lazy"
      />
    `
  }

  return `
    <div class="fallback-image ${className}">
      <span>${safe(site.siteName || 'El Mosquito')}</span>
    </div>
  `
}

function renderGallery(article) {
  const gallery = Array.isArray(article.gallery)
    ? article.gallery.filter(Boolean)
    : []

  if (!gallery.length) return ''

  return `
    <section class="article-gallery">
      <h3>Galer&iacute;a de fotos</h3>

      <div class="gallery-grid">
        ${gallery.map((photo, index) => `
          <a href="${assetUrl(photo)}" target="_blank" rel="noopener noreferrer">
            <img
              src="${assetUrl(photo)}"
              alt="Foto ${index + 1} de ${safe(article.title)}"
              loading="lazy"
            />
          </a>
        `).join('')}
      </div>
    </section>
  `
}

function renderAttachments(article) {
  const attachments = Array.isArray(article.attachments)
    ? article.attachments.filter((item) => item && item.file)
    : []

  if (!attachments.length) return ''

  return `
    <section class="article-attachments">
      <h3>Archivos adjuntos</h3>

      <div class="attachment-list">
        ${attachments.map((item) => `
          <a
            class="attachment-card"
            href="${assetUrl(item.file)}"
            target="_blank"
            rel="noopener noreferrer"
            download
          >
            <span>Archivo</span>
            <strong>${safe(item.title || 'Documento adjunto')}</strong>
            ${item.description ? `<p>${safe(item.description)}</p>` : ''}
            <em>Descargar / abrir</em>
          </a>
        `).join('')}
      </div>
    </section>
  `
}

function reportHref() {
  const number = String(site.whatsappNumber || '').replace(/\D/g, '')

  if (number) {
    const text = encodeURIComponent('Hola, quiero reportar una situaci\u00f3n para El Mosquito / Cuesta Hermosa II.')
    return `https://wa.me/${number}?text=${text}`
  }

  return '#reportar'
}

function reportHrefWithType(type) {
  const number = String(site.whatsappNumber || '').replace(/\D/g, '')

  if (number) {
    const text = encodeURIComponent(
      `Hola, quiero reportar una situaci\u00f3n para El Mosquito / Cuesta Hermosa II.\n\nTipo de reporte: ${type}\nUbicaci\u00f3n exacta:\nDescripci\u00f3n:\nFoto o evidencia:`
    )

    return `https://wa.me/${number}?text=${text}`
  }

  return '#reportar'
}

function renderUpdateBar(leadArticle) {
  const items = []

  if (leadArticle) {
    items.push(`Principal: ${safe(leadArticle.title)}`)
  }

  const election = sortByDate(articles).find((article) => article.category === 'Elecciones')
  if (election) {
    items.push(`Elecciones: ${safe(election.title)}`)
  }

  const document = documents.find((doc) => doc.featured !== false)
  if (document) {
    items.push('Documentos oficiales disponibles')
  }

  if (!items.length) return ''

  return `
    <section class="update-bar">
      <span>&Uacute;ltima actualizaci&oacute;n</span>
      <div>${items.slice(0, 3).join(' \u00b7 ')}</div>
    </section>
  `
}

function renderHighlights(leadArticle) {
  const maintenanceArticle = sortByDate(articles).find((article) => article.category === 'Mantenimiento')
  const electionArticle = sortByDate(articles).find((article) => article.category === 'Elecciones')
  const firstDocument = documents.find((doc) => doc.featured !== false)

  const cards = []

  if (maintenanceArticle) {
    cards.push(`
      <button class="priority-card" data-open-article="${safe(maintenanceArticle.id)}">
        <span>Tema prioritario</span>
        <strong>${safe(maintenanceArticle.title)}</strong>
        <em>Ver seguimiento</em>
      </button>
    `)
  }

  if (electionArticle) {
    cards.push(`
      <button class="priority-card" data-open-article="${safe(electionArticle.id)}">
        <span>Proceso comunitario</span>
        <strong>${safe(electionArticle.title)}</strong>
        <em>Ver informaci&oacute;n</em>
      </button>
    `)
  }

  if (firstDocument) {
    cards.push(`
      <a class="priority-card" href="#documentos">
        <span>Archivo oficial</span>
        <strong>${safe(firstDocument.title)}</strong>
        <em>Descargar documento</em>
      </a>
    `)
  }

  if (!cards.length && leadArticle) {
    cards.push(`
      <button class="priority-card" data-open-article="${safe(leadArticle.id)}">
        <span>Portada</span>
        <strong>${safe(leadArticle.title)}</strong>
        <em>Leer ahora</em>
      </button>
    `)
  }

  return `
    <section id="importante" class="priority-section">
      <div class="section-heading compact-heading">
        <span>Agenda comunitaria</span>
        <h2>Lo m&aacute;s importante ahora</h2>
      </div>

      <div class="priority-grid">
        ${cards.slice(0, 3).join('')}
      </div>
    </section>
  `
}

function renderDocuments() {
  const visibleDocuments = documents.filter((doc) => doc.featured !== false)

  if (!visibleDocuments.length) {
    return ''
  }

  return `
    <section id="documentos" class="documents-section official-documents">
      <div class="section-heading">
        <span>Archivo institucional</span>
        <h2>Documentos oficiales</h2>
      </div>

      <div class="documents-grid">
        ${visibleDocuments.map((doc) => `
          <details class="document-card">
            <summary>
              <span>${safe(doc.category || 'Documento oficial')}</span>
              <strong>${safe(doc.title)}</strong>
            </summary>

            ${doc.description ? `<p>${safe(doc.description)}</p>` : ''}
            ${doc.date ? `<small>${formatDate(doc.date)}</small>` : ''}

            <a
              href="${assetUrl(doc.file)}"
              target="_blank"
              rel="noopener noreferrer"
              download
            >
              Descargar archivo
            </a>
          </details>
        `).join('')}
      </div>
    </section>
  `
}

function getFilteredArticles() {
  let filtered = sortByDate(articles)
    .filter((article) => article.id !== currentLeadId)

  if (currentCategory !== 'all') {
    filtered = filtered.filter((article) => article.category === currentCategory)
  }

  if (currentSearch.trim()) {
    const query = currentSearch.trim().toLowerCase()

    filtered = filtered.filter((article) => {
      const content = [
        article.title,
        article.summary,
        article.category,
        article.author,
        article.body
      ].join(' ').toLowerCase()

      return content.includes(query)
    })
  }

  return filtered
}

function renderArticleList(list) {
  if (!list.length) {
    return `
      <div class="empty-state">
        No encontramos publicaciones con ese filtro o b&uacute;squeda.
      </div>
    `
  }

  return list.map((article) => `
    <article class="news-row professional-news-row" data-category="${safe(article.category)}">
      <div>
        <div class="row-kicker">
          <span>${safe(article.category || 'Noticia')}</span>
          ${article.date ? `<span>${formatDate(article.date)}</span>` : ''}
        </div>

        <h3>${safe(article.title)}</h3>
        <p>${safe(article.summary)}</p>

        <button class="text-button" data-open-article="${safe(article.id)}">
          Leer noticia
        </button>
      </div>
    </article>
  `).join('')
}

function updateNewsList() {
  const filtered = getFilteredArticles()
  const newsList = document.querySelector('#newsList')
  const resultsCount = document.querySelector('#resultsCount')

  if (newsList) {
    newsList.innerHTML = renderArticleList(filtered)
  }

  if (resultsCount) {
    resultsCount.textContent = filtered.length === 1
      ? '1 publicaci\u00f3n'
      : `${filtered.length} publicaciones`
  }

  bindArticleButtons()
}

function renderReportSection() {
  return `
    <section id="reportar" class="report-section professional-report">
      <div class="section-heading compact-heading">
        <span>Participaci&oacute;n comunitaria</span>
        <h2>Reportar situaciones</h2>
      </div>

      <p class="report-intro">
        Usa esta secci&oacute;n para reportar situaciones que afecten la seguridad, el mantenimiento,
        el drenaje, la limpieza o la convivencia dentro de Cuesta Hermosa II.
      </p>

      <div class="report-grid">
        <a class="report-card" href="${reportHrefWithType('Inundaci\u00f3n o drenaje')}" target="_blank" rel="noopener noreferrer">
          <span>01</span>
          <strong>Inundaci&oacute;n / Drenaje</strong>
          <small>Imbornales tapados, acumulaci&oacute;n de agua, ca&ntilde;ada o filtrantes.</small>
        </a>

        <a class="report-card" href="${reportHrefWithType('Seguridad')}" target="_blank" rel="noopener noreferrer">
          <span>02</span>
          <strong>Seguridad</strong>
          <small>Accesos, vigilancia, personas sospechosas o situaciones de riesgo.</small>
        </a>

        <a class="report-card" href="${reportHrefWithType('Mantenimiento')}" target="_blank" rel="noopener noreferrer">
          <span>03</span>
          <strong>Mantenimiento</strong>
          <small>Calles, &aacute;reas comunes, luces, tapas, jardiner&iacute;a o infraestructura.</small>
        </a>

        <a class="report-card" href="${reportHrefWithType('Basura o limpieza')}" target="_blank" rel="noopener noreferrer">
          <span>04</span>
          <strong>Limpieza</strong>
          <small>Desechos, escombros, poda, sedimentos o limpieza pendiente.</small>
        </a>

        <a class="report-card" href="${reportHrefWithType('Otro reporte')}" target="_blank" rel="noopener noreferrer">
          <span>05</span>
          <strong>Otro reporte</strong>
          <small>Cualquier situaci&oacute;n comunitaria que necesite seguimiento.</small>
        </a>
      </div>

      <p class="report-note">
        Al enviar el reporte, incluye ubicaci&oacute;n exacta, foto si la tienes, hora aproximada y una breve descripci&oacute;n.
      </p>
    </section>
  `
}

function render() {
  document.documentElement.style.setProperty('--primary', site.primaryColor || DEFAULT_SITE.primaryColor)
  document.documentElement.style.setProperty('--accent', site.accentColor || DEFAULT_SITE.accentColor)
  document.documentElement.style.setProperty('--dark', site.darkColor || DEFAULT_SITE.darkColor)
  document.documentElement.style.setProperty('--paper', site.paperColor || DEFAULT_SITE.paperColor)

  const sortedArticles = sortByDate(articles)
  const leadArticle = sortedArticles.find((article) => article.featured) || sortedArticles[0]
  currentLeadId = leadArticle?.id || ''

  const sideArticles = sortedArticles
    .filter((article) => article.id !== leadArticle?.id)
    .slice(0, 3)

  app.innerHTML = `
    <div class="page newspaper-page">
      <header class="masthead professional-masthead">
        <div class="topline">
          <span>${safe(site.editionLabel || 'Edici\u00f3n digital')}</span>
          <span>${safe(site.location || '')}</span>
          <span>${formatDate(new Date())}</span>
        </div>

        <div class="brand-row">
          ${site.logo ? `
            <img class="brand-logo" src="${imageUrl(site.logo)}" alt="${safe(site.communityName)}" />
          ` : ''}

          <div class="masthead-title">
            <p>${safe(site.subtitle || '')}</p>
            <h1>${safe(site.siteName || 'El Mosquito')}</h1>
            <span>${safe(site.tagline || '')}</span>
          </div>
        </div>

        <nav class="nav-links professional-nav">
          <a href="#portada">Portada</a>
          <a href="#importante">Importante</a>
          <a href="#noticias">Noticias</a>
          <a href="#categorias">Categor&iacute;as</a>
          <a href="#documentos">Documentos</a>
          <a href="#reportar">Reportar</a>
          <a href="#avisos">Avisos</a>
        </nav>
      </header>

      <main>
        ${renderUpdateBar(leadArticle)}

        <section id="portada" class="hero-section professional-hero">
          <div class="section-heading">
            <span>${safe(site.heroLabel || 'Portada')}</span>
            <h2>${safe(site.heroTitle || '')}</h2>
          </div>

          <div class="front-grid">
            ${leadArticle ? `
              <article class="lead-story">
                ${siteHeroImage('lead-image fixed-cover-image')}

                <div class="lead-content">
                  <span class="eyebrow">${safe(leadArticle.category || 'Noticia principal')}</span>
                  <h2>${safe(leadArticle.title)}</h2>
                  <p>${safe(leadArticle.summary)}</p>

                  <div class="story-meta">
                    <span>${safe(leadArticle.author || 'Redacci\u00f3n')}</span>
                    ${leadArticle.date ? `<span>${formatDate(leadArticle.date)}</span>` : ''}
                  </div>

                  <button class="primary-button" data-open-article="${safe(leadArticle.id)}">
                    ${safe(site.heroButtonText || 'Leer portada')}
                  </button>
                </div>
              </article>
            ` : `
              <article class="lead-story">
                ${siteHeroImage('lead-image fixed-cover-image')}
                <div class="lead-content">
                  <span class="eyebrow">${safe(site.heroLabel || 'Portada')}</span>
                  <h2>${safe(site.heroTitle || '')}</h2>
                  <p>${safe(site.heroText || '')}</p>
                </div>
              </article>
            `}

            <aside class="front-side secondary-front">
              <div class="front-side-title">En desarrollo</div>
              ${sideArticles.map((article) => `
                <article class="side-story">
                  <div>
                    <span class="eyebrow">${safe(article.category || 'Noticia')}</span>
                    <h3>${safe(article.title)}</h3>
                    <p>${safe(article.summary)}</p>

                    <button class="text-button" data-open-article="${safe(article.id)}">
                      Leer m&aacute;s
                    </button>
                  </div>
                </article>
              `).join('')}
            </aside>
          </div>
        </section>

        ${renderHighlights(leadArticle)}

        <section class="interactive-panel professional-search">
          <div class="search-box">
            <label for="searchInput">Buscar en el peri&oacute;dico</label>
            <input
              id="searchInput"
              type="search"
              placeholder="Buscar: imbornales, elecciones, seguridad, ca&ntilde;ada..."
            />
          </div>

          <div class="interactive-meta">
            <span id="resultsCount">${getFilteredArticles().length} publicaciones</span>
            <a href="#documentos">Ver documentos</a>
            <a href="${reportHref()}" target="_blank" rel="noopener noreferrer">Reportar situaci&oacute;n</a>
          </div>
        </section>

        <section id="categorias" class="categories-section professional-categories">
          <div class="section-heading compact-heading">
            <span>Secciones</span>
            <h2>Explorar por categor&iacute;a</h2>
          </div>

          <div class="category-ribbon">
            <button class="category-card is-active" data-filter-category="all">
              <span>Todas</span>
              <p>Ver todas las publicaciones.</p>
            </button>

            ${featuredCategories().map((category) => `
              <button
                class="category-card"
                data-filter-category="${safe(category.name)}"
                style="--category-color: ${safe(category.color || site.primaryColor)}"
              >
                <span>${safe(category.name)}</span>
                <p>${safe(category.description)}</p>
              </button>
            `).join('')}
          </div>
        </section>

        <section class="content-layout professional-layout">
          <div id="noticias" class="news-section">
            <div class="section-heading">
              <span>Noticias</span>
              <h2>&Uacute;ltimas publicaciones</h2>
            </div>

            <div id="newsList" class="news-list">
              ${renderArticleList(getFilteredArticles())}
            </div>
          </div>

          <aside id="avisos" class="sidebar professional-sidebar">
            <div class="sidebar-block urgent">
              <h2>Avisos</h2>

              <div class="notice-list">
                ${notices.map((notice) => `
                  <article class="notice-item">
                    <h3>${safe(notice.title)}</h3>
                    <p>${safe(notice.text)}</p>
                  </article>
                `).join('') || `
                  <article class="notice-item">
                    <h3>No hay avisos disponibles</h3>
                    <p>Los avisos comunitarios aparecer&aacute;n aqu&iacute;.</p>
                  </article>
                `}
              </div>
            </div>
          </aside>
        </section>

        ${renderDocuments()}

        ${renderReportSection()}
      </main>

      <footer class="footer professional-footer">
        <div>
          <strong>${safe(site.siteName)} \u00b7 ${safe(site.communityName)}</strong>
          <p>Medio informativo vecinal para noticias, avisos, documentos oficiales y participaci&oacute;n comunitaria.</p>
        </div>

        <nav>
          <a href="#portada">Portada</a>
          <a href="#noticias">Noticias</a>
          <a href="#documentos">Documentos</a>
          <a href="#reportar">Reportar</a>
        </nav>
      </footer>
    </div>

    <a class="floating-report" href="${reportHref()}" target="_blank" rel="noopener noreferrer">
      Reportar situaci&oacute;n
    </a>

    <dialog id="articleDialog" class="article-dialog">
      <button class="dialog-close" type="button" aria-label="Cerrar noticia">\u00d7</button>
      <div class="dialog-body"></div>
    </dialog>
  `

  bindEvents()
}

function bindArticleButtons() {
  document.querySelectorAll('[data-open-article]').forEach((button) => {
    button.addEventListener('click', () => {
      openArticle(button.dataset.openArticle)
    })
  })
}

function bindEvents() {
  bindArticleButtons()

  const searchInput = document.querySelector('#searchInput')

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      currentSearch = searchInput.value || ''
      updateNewsList()
    })
  }

  document.querySelectorAll('[data-filter-category]').forEach((button) => {
    button.addEventListener('click', () => {
      currentCategory = button.dataset.filterCategory || 'all'

      document.querySelectorAll('[data-filter-category]').forEach((item) => {
        item.classList.remove('is-active')
      })

      button.classList.add('is-active')
      updateNewsList()

      const newsSection = document.querySelector('#noticias')

      if (newsSection) {
        newsSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }
    })
  })

  const dialog = document.querySelector('#articleDialog')
  const closeButton = document.querySelector('.dialog-close')

  if (dialog && closeButton) {
    closeButton.addEventListener('click', () => {
      dialog.close()
    })

    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) {
        dialog.close()
      }
    })
  }
}

function openArticle(id) {
  const article = articles.find((item) => item.id === id)

  if (!article) return

  const dialog = document.querySelector('#articleDialog')
  const dialogBody = document.querySelector('#articleDialog .dialog-body')

  if (!dialog || !dialogBody) return

  dialogBody.innerHTML = `
    <article class="article-detail">
      ${article.image ? `
        <img
          class="article-detail-image"
          src="${imageUrl(article.image)}"
          alt="${safe(article.title)}"
        />
      ` : ''}

      <span class="eyebrow">${safe(article.category || 'Noticia')}</span>

      <h1>${safe(article.title)}</h1>

      <div class="story-meta">
        <span>${safe(article.author || 'Redacci\u00f3n')}</span>
        ${article.date ? `<span>${formatDate(article.date)}</span>` : ''}
      </div>

      ${article.summary ? `<p class="article-summary">${safe(article.summary)}</p>` : ''}

      <div class="article-full">
        ${bodyToHTML(article.body)}
      </div>

      ${renderGallery(article)}
      ${renderAttachments(article)}
    </article>
  `

  dialog.showModal()
}

async function init() {
  const [
    loadedSite,
    loadedArticles,
    loadedNotices,
    loadedCategories,
    loadedDocuments
  ] = await Promise.all([
    getJSON('/data/site.json', DEFAULT_SITE),
    getJSON('/data/noticias.json', { items: [] }),
    getJSON('/data/avisos.json', { items: [] }),
    getJSON('/data/categorias.json', { items: [] }),
    getJSON('/data/documentos.json', { items: [] })
  ])

  site = {
    ...DEFAULT_SITE,
    ...loadedSite
  }

  articles = normalizeList(loadedArticles)
  notices = normalizeList(loadedNotices)
  categoriesData = normalizeList(loadedCategories)
  documents = normalizeList(loadedDocuments)

  render()
}

init()
