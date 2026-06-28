const DEFAULT_SITE = {
  siteName: 'El Mosquito',
  communityName: 'Cuesta Hermosa II',
  subtitle: 'Periódico comunitario de Cuesta Hermosa II',
  tagline: 'Noticias, avisos y participación vecinal',
  logo: '/uploads/logo-cuesta-hermosa.jpg',
  location: 'Cuesta Hermosa II · Santo Domingo',
  editionLabel: 'Edición digital',
  heroLabel: 'Portada',
  heroTitle: 'La voz comunitaria de Cuesta Hermosa II',
  heroText: 'Un espacio editorial para informar, organizar y conectar a los residentes con noticias, avisos, mantenimiento, seguridad y actividades de interés común.',
  heroButtonText: 'Leer portada',
  whatsappNumber: '',
  primaryColor: '#526E3F',
  accentColor: '#A45B2B',
  darkColor: '#171717',
  paperColor: '#F7F2E9'
}

let site = DEFAULT_SITE
let articles = []
let notices = []
let categoriesData = []
let activeCategory = 'Todas'
let searchTerm = ''

function normalizeList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.noticias)) return data.noticias
  if (Array.isArray(data?.avisos)) return data.avisos
  return []
}

async function getJSON(path, fallback) {
  try {
    const response = await fetch(`.${path}`, { cache: 'no-store' })
    if (!response.ok) return fallback
    return await response.json()
  } catch {
    return fallback
  }
}

function safe(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function imageUrl(path) {
  if (!path) return ''
  if (path.startsWith('http')) return path

  const clean = path
    .replace(/^\.?\//, '')
    .replace(/^uploads\//, 'uploads/')

  if (clean.startsWith('uploads/')) return `./${clean}`
  return `./uploads/${clean}`
}

function formatDate(date) {
  if (!date) return ''
  try {
    return new Intl.DateTimeFormat('es-DO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date(date))
  } catch {
    return ''
  }
}

function currentDate() {
  return new Intl.DateTimeFormat('es-DO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date())
}

function applyTheme() {
  document.documentElement.style.setProperty('--primary', site.primaryColor || DEFAULT_SITE.primaryColor)
  document.documentElement.style.setProperty('--accent', site.accentColor || DEFAULT_SITE.accentColor)
  document.documentElement.style.setProperty('--dark', site.darkColor || DEFAULT_SITE.darkColor)
  document.documentElement.style.setProperty('--paper', site.paperColor || DEFAULT_SITE.paperColor)
}

function categoryNames() {
  const fromArticles = articles.map(article => article.category).filter(Boolean)
  const fromConfig = categoriesData.map(category => category.name).filter(Boolean)
  const unique = [...new Set([...fromConfig, ...fromArticles])]
  return ['Todas', ...unique]
}

function featuredCategories() {
  return categoriesData
    .filter(category => category.featured)
    .sort((a, b) => Number(a.order || 99) - Number(b.order || 99))
    .slice(0, 6)
}

function filteredArticles() {
  return articles.filter(article => {
    const matchCategory = activeCategory === 'Todas' || article.category === activeCategory
    const words = `${article.title} ${article.summary} ${article.body} ${article.category}`.toLowerCase()
    const matchSearch = words.includes(searchTerm.toLowerCase())
    return matchCategory && matchSearch
  })
}

function sortedArticles() {
  return [...articles].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
}

function topStories() {
  const sorted = sortedArticles()
  const lead = sorted.find(article => article.featured) || sorted[0]
  const rest = sorted.filter(article => article !== lead)
  return { lead, side: rest.slice(0, 2) }
}

function articleImage(article, className = '') {
  const src = imageUrl(article.image)
  if (!src) {
    return `
      <div class="fallback-image ${className}">
        <img src="${imageUrl(site.logo)}" alt="${safe(site.communityName)}" />
      </div>
    `
  }

  return `<img class="story-image ${className}" src="${src}" alt="${safe(article.title)}" loading="lazy" />`
}

function bodyToHTML(text) {
  return safe(text)
    .split('\n')
    .filter(Boolean)
    .map(paragraph => `<p>${paragraph}</p>`)
    .join('')
}

function whatsappLink(message) {
  if (!site.whatsappNumber) return ''
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`
}

function renderStoryMini(article) {
  if (!article) return ''
  return `
    <article class="side-story">
      ${articleImage(article, 'side-story-image')}
      <div>
        <span class="kicker">${safe(article.category)}</span>
        <h3>${safe(article.title)}</h3>
        <p>${safe(article.summary)}</p>
        <button data-open="${safe(article.id)}">Leer más</button>
      </div>
    </article>
  `
}

function render() {
  applyTheme()

  const { lead, side } = topStories()
  const logo = imageUrl(site.logo)
  const filtered = filteredArticles()

  document.querySelector('#app').innerHTML = `
    <div class="page">
      <div class="top-strip">
        <div>
          <span>${safe(site.location)}</span>
          <span>${currentDate()}</span>
        </div>
        <strong>${safe(site.editionLabel)}</strong>
      </div>

      <header class="masthead">
        <a class="institutional-logo" href="#portada">
          <img src="${logo}" alt="${safe(site.communityName)}" />
        </a>

        <div class="masthead-title">
          <p>${safe(site.subtitle)}</p>
          <h1>${safe(site.siteName)}</h1>
          <span>${safe(site.tagline)}</span>
        </div>
      </header>

      <nav class="edition-nav">
        <button class="menu-button" aria-label="Abrir menú">Menú</button>
        <div class="nav-links">
          <a href="#portada">Portada</a>
          ${categoryNames().filter(category => category !== 'Todas').slice(0, 7).map(category => `
            <button data-category="${safe(category)}">${safe(category)}</button>
          `).join('')}
          <a href="#avisos">Avisos</a>
        </div>
      </nav>

      <main>
        <section id="portada" class="front-page">
          <div class="front-label">
            <span>${safe(site.heroLabel)}</span>
            <strong>${safe(site.communityName)}</strong>
          </div>

          <div class="front-grid">
            ${lead ? `
              <article class="lead-story">
                ${articleImage(lead, 'lead-image')}
                <div class="lead-content">
                  <span class="kicker">${safe(lead.category)}</span>
                  <h2>${safe(lead.title)}</h2>
                  <p>${safe(lead.summary || site.heroText)}</p>
                  <div class="meta">
                    <span>${safe(lead.author || 'Redacción CH II')}</span>
                    <span>${formatDate(lead.date)}</span>
                  </div>
                  <button class="main-button" data-open="${safe(lead.id)}">${safe(site.heroButtonText || 'Leer portada')}</button>
                </div>
              </article>
            ` : `
              <article class="lead-story empty-lead">
                <div class="lead-content">
                  <span class="kicker">${safe(site.heroLabel)}</span>
                  <h2>${safe(site.heroTitle)}</h2>
                  <p>${safe(site.heroText)}</p>
                </div>
              </article>
            `}

            <aside class="front-side">
              <div class="briefing-card">
                <span class="kicker">Resumen editorial</span>
                <h3>${safe(site.heroTitle)}</h3>
                <p>${safe(site.heroText)}</p>
              </div>

              ${side.map(renderStoryMini).join('')}
            </aside>
          </div>
        </section>

        <section class="category-ribbon">
          ${featuredCategories().map(category => `
            <button class="category-card" data-category="${safe(category.name)}" style="--category-color: ${safe(category.color || site.primaryColor)}">
              <span>${safe(category.name)}</span>
              <p>${safe(category.description)}</p>
            </button>
          `).join('')}
        </section>

        <section id="noticias" class="content-layout">
          <div class="main-column">
            <div class="section-heading">
              <span>Últimas publicaciones</span>
              <h2>Noticias de la comunidad</h2>
            </div>

            <div class="tools">
              <div class="search-box">
                <label for="searchInput">Buscar en el periódico</label>
                <input id="searchInput" value="${safe(searchTerm)}" placeholder="Buscar por tema, categoría o palabra clave..." />
              </div>

              <div class="chips">
                ${categoryNames().map(category => `
                  <button class="chip ${category === activeCategory ? 'active' : ''}" data-category="${safe(category)}">
                    ${safe(category)}
                  </button>
                `).join('')}
              </div>
            </div>

            <div class="story-list">
              ${filtered.map(article => `
                <article class="news-row">
                  ${articleImage(article, 'row-image')}
                  <div>
                    <span class="kicker">${safe(article.category)}</span>
                    <h3>${safe(article.title)}</h3>
                    <p>${safe(article.summary)}</p>
                    <div class="meta">
                      <span>${safe(article.author || 'Redacción CH II')}</span>
                      <span>${formatDate(article.date)}</span>
                    </div>
                    <button data-open="${safe(article.id)}">Leer noticia</button>
                  </div>
                </article>
              `).join('') || `<div class="empty-state">No encontramos noticias con ese filtro.</div>`}
            </div>
          </div>

          <aside class="sidebar">
            <section id="avisos" class="sidebar-block urgent">
              <span class="kicker">Avisos</span>
              <h2>Comunicados importantes</h2>
              ${notices.map(notice => `
                <article class="notice-item">
                  <strong>${safe(notice.title)}</strong>
                  <p>${safe(notice.text)}</p>
                </article>
              `).join('') || '<p>No hay avisos publicados.</p>'}
            </section>

            <section class="sidebar-block">
              <span class="kicker">Institucional</span>
              <img class="sidebar-logo" src="${logo}" alt="${safe(site.communityName)}" />
              <p>${safe(site.subtitle)}</p>
            </section>
          </aside>
        </section>

        <section id="publicar" class="submit-section">
          <div>
            <span class="kicker">Participa</span>
            <h2>Envía una noticia, aviso o reporte</h2>
            <p>Comparte información útil para la comunidad. El mensaje queda listo para copiar o enviar a la administración.</p>
          </div>

          <form id="publishForm">
            <label>
              Nombre
              <input name="name" placeholder="Tu nombre" required />
            </label>

            <label>
              Categoría
              <select name="category" required>
                ${categoryNames().filter(category => category !== 'Todas').map(category => `
                  <option>${safe(category)}</option>
                `).join('')}
              </select>
            </label>

            <label class="full">
              Título
              <input name="title" placeholder="Título de la información" required />
            </label>

            <label class="full">
              Detalle
              <textarea name="detail" rows="5" placeholder="Escribe aquí la información..." required></textarea>
            </label>

            <button class="submit-button full" type="submit">Preparar envío</button>
          </form>
        </section>
      </main>

      <footer class="footer">
        <img src="${logo}" alt="${safe(site.communityName)}" />
        <div>
          <strong>${safe(site.siteName)}</strong>
          <span>${safe(site.subtitle)}</span>
        </div>
      </footer>

      <dialog id="articleDialog">
        <div class="dialog-body"></div>
        <button class="close-dialog">Cerrar</button>
      </dialog>
    </div>
  `

  bindEvents()
}

function bindEvents() {
  document.querySelector('.menu-button')?.addEventListener('click', () => {
    document.querySelector('.nav-links')?.classList.toggle('open')
  })

  document.querySelectorAll('[data-category]').forEach(button => {
    button.addEventListener('click', () => {
      activeCategory = button.dataset.category
      document.querySelector('#noticias')?.scrollIntoView({ behavior: 'smooth' })
      render()
    })
  })

  const searchInput = document.querySelector('#searchInput')
  searchInput?.addEventListener('input', event => {
    searchTerm = event.target.value
    render()
    setTimeout(() => {
      const nextInput = document.querySelector('#searchInput')
      nextInput?.focus()
      nextInput?.setSelectionRange(nextInput.value.length, nextInput.value.length)
    }, 0)
  })

  document.querySelectorAll('[data-open]').forEach(button => {
    button.addEventListener('click', () => openArticle(button.dataset.open))
  })

  document.querySelector('.close-dialog')?.addEventListener('click', () => {
    document.querySelector('#articleDialog')?.close()
  })

  document.querySelector('#publishForm')?.addEventListener('submit', event => {
    event.preventDefault()

    const data = new FormData(event.target)
    const message = [
      `Nueva información para ${site.siteName}`,
      '',
      `Nombre: ${data.get('name')}`,
      `Categoría: ${data.get('category')}`,
      `Título: ${data.get('title')}`,
      '',
      `Detalle: ${data.get('detail')}`
    ].join('\n')

    const link = whatsappLink(message)

    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer')
    } else {
      navigator.clipboard?.writeText(message)
      alert('Mensaje preparado. Si tu navegador lo permite, fue copiado al portapapeles.')
    }
  })
}

function openArticle(id) {
  const article = articles.find(item => item.id === id)
  if (!article) return

  const dialog = document.querySelector('#articleDialog')
  dialog.querySelector('.dialog-body').innerHTML = `
    ${articleImage(article, 'dialog-image')}
    <span class="kicker">${safe(article.category)}</span>
    <h2>${safe(article.title)}</h2>
    <div class="meta">
      <span>${safe(article.author || 'Redacción CH II')}</span>
      <span>${formatDate(article.date)}</span>
    </div>
    <div class="article-full">${bodyToHTML(article.body)}</div>
  `

  dialog.showModal()
}

async function init() {
  document.querySelector('#app').innerHTML = `
    <div class="loading">
      <img src="./uploads/logo-cuesta-hermosa.jpg" alt="Cuesta Hermosa II" />
      <strong>El Mosquito</strong>
      <span>Cargando edición digital...</span>
    </div>
  `

  const [loadedSite, loadedArticles, loadedNotices, loadedCategories] = await Promise.all([
    getJSON('/data/site.json', DEFAULT_SITE),
    getJSON('/data/noticias.json', { items: [] }),
    getJSON('/data/avisos.json', { items: [] }),
    getJSON('/data/categorias.json', { items: [] })
  ])

  site = { ...DEFAULT_SITE, ...loadedSite }
  articles = normalizeList(loadedArticles)
  notices = normalizeList(loadedNotices)
  categoriesData = normalizeList(loadedCategories)

  render()
}

init()
