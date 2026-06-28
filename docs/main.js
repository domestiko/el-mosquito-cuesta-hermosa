const DEFAULT_SITE = {
  siteName: 'El Mosquito',
  communityName: 'Cuesta Hermosa II',
  subtitle: 'Periódico comunitario de Cuesta Hermosa II',
  logo: '/uploads/logo-cuesta-hermosa.jpg',
  heroTitle: 'Información clara para una comunidad más organizada',
  heroText: 'Noticias, avisos, mantenimiento, seguridad y temas de interés para los residentes de Cuesta Hermosa II.',
  heroButtonText: 'Ver noticias',
  location: 'Cuesta Hermosa II · Santo Domingo',
  whatsappNumber: '',
  primaryColor: '#526E3F',
  accentColor: '#C8793D',
  darkColor: '#1F2420',
  lightColor: '#F7F4EE'
}

let site = DEFAULT_SITE
let articles = []
let notices = []
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
    const data = await response.json()
    return data
  } catch (error) {
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

function applyTheme() {
  document.documentElement.style.setProperty('--primary', site.primaryColor || DEFAULT_SITE.primaryColor)
  document.documentElement.style.setProperty('--accent', site.accentColor || DEFAULT_SITE.accentColor)
  document.documentElement.style.setProperty('--dark', site.darkColor || DEFAULT_SITE.darkColor)
  document.documentElement.style.setProperty('--light', site.lightColor || DEFAULT_SITE.lightColor)
}

function categories() {
  const unique = [...new Set(articles.map(article => article.category).filter(Boolean))]
  return ['Todas', ...unique]
}

function filteredArticles() {
  return articles.filter(article => {
    const matchCategory = activeCategory === 'Todas' || article.category === activeCategory
    const words = `${article.title} ${article.summary} ${article.body} ${article.category}`.toLowerCase()
    const matchSearch = words.includes(searchTerm.toLowerCase())
    return matchCategory && matchSearch
  })
}

function articleImage(article, extraClass = '') {
  const src = imageUrl(article.image)
  if (!src) {
    return `
      <div class="image-placeholder ${extraClass}">
        <img src="${imageUrl(site.logo)}" alt="${safe(site.communityName)}" />
      </div>
    `
  }

  return `
    <img class="article-image ${extraClass}" src="${src}" alt="${safe(article.title)}" loading="lazy" />
  `
}

function whatsappLink(message) {
  if (!site.whatsappNumber) return ''
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`
}

function bodyToHTML(text) {
  return safe(text)
    .split('\n')
    .filter(Boolean)
    .map(paragraph => `<p>${paragraph}</p>`)
    .join('')
}

function render() {
  applyTheme()

  const featured = articles.find(article => article.featured) || articles[0]
  const list = filteredArticles()
  const logoSrc = imageUrl(site.logo)

  document.querySelector('#app').innerHTML = `
    <div class="site-shell">
      <header class="site-header">
        <div class="header-inner">
          <a class="brand" href="#portada" aria-label="${safe(site.siteName)}">
            <img src="${logoSrc}" alt="${safe(site.communityName)}" />
            <div>
              <span>${safe(site.communityName)}</span>
              <strong>${safe(site.siteName)}</strong>
            </div>
          </a>

          <button class="menu-button" aria-label="Abrir menú">
            <span></span>
            <span></span>
            <span></span>
          </button>

          <nav class="main-nav">
            <a href="#portada">Portada</a>
            <a href="#noticias">Noticias</a>
            <a href="#avisos">Avisos</a>
            <a href="#publicar">Publicar</a>
          </nav>
        </div>
      </header>

      <main>
        <section id="portada" class="hero">
          <div class="hero-bg"></div>

          <div class="hero-content">
            <div class="hero-copy">
              <div class="eyebrow">Periódico comunitario</div>
              <h1>${safe(site.siteName)}</h1>
              <h2>${safe(site.heroTitle)}</h2>
              <p>${safe(site.heroText)}</p>

              <div class="hero-actions">
                <a class="primary-button" href="#noticias">${safe(site.heroButtonText || 'Ver noticias')}</a>
                <a class="secondary-button" href="#avisos">Ver avisos</a>
              </div>
            </div>

            <aside class="hero-card">
              <img src="${logoSrc}" alt="${safe(site.communityName)}" />
              <p>${safe(site.subtitle)}</p>
              <span>${safe(site.location)}</span>
            </aside>
          </div>
        </section>

        ${featured ? `
          <section class="featured-section">
            <article class="featured-card">
              <div class="featured-text">
                <div class="label">${safe(featured.category)}</div>
                <h2>${safe(featured.title)}</h2>
                <p>${safe(featured.summary)}</p>
                <div class="story-meta">
                  <span>${safe(featured.author || 'Redacción CH II')}</span>
                  <span>${formatDate(featured.date)}</span>
                </div>
                <button class="read-button" data-open="${safe(featured.id)}">Leer noticia completa</button>
              </div>
              ${articleImage(featured, 'featured-image')}
            </article>
          </section>
        ` : ''}

        <section class="tools">
          <div class="search-box">
            <span>Buscar</span>
            <input id="searchInput" value="${safe(searchTerm)}" placeholder="Buscar noticia, aviso o tema..." />
          </div>

          <div class="chips">
            ${categories().map(category => `
              <button class="chip ${category === activeCategory ? 'active' : ''}" data-category="${safe(category)}">
                ${safe(category)}
              </button>
            `).join('')}
          </div>
        </section>

        <section id="noticias" class="section">
          <div class="section-title">
            <span>Edición digital</span>
            <h2>Noticias y reportajes</h2>
            <p>Contenido actualizado para mantener informada a la comunidad.</p>
          </div>

          <div class="articles-grid">
            ${list.map(article => `
              <article class="article-card">
                ${articleImage(article)}
                <div class="article-content">
                  <div class="label">${safe(article.category)}</div>
                  <h3>${safe(article.title)}</h3>
                  <p>${safe(article.summary)}</p>
                  <div class="story-meta">
                    <span>${safe(article.author || 'Redacción CH II')}</span>
                    <span>${formatDate(article.date)}</span>
                  </div>
                  <button class="text-button" data-open="${safe(article.id)}">Leer más</button>
                </div>
              </article>
            `).join('') || `<div class="empty">No encontramos noticias con ese filtro.</div>`}
          </div>
        </section>

        <section id="avisos" class="section notices-section">
          <div class="section-title">
            <span>Comunidad</span>
            <h2>Avisos importantes</h2>
            <p>Recordatorios, comunicados y temas de interés general.</p>
          </div>

          <div class="notice-board">
            ${notices.map(notice => `
              <article>
                <strong>${safe(notice.title)}</strong>
                <p>${safe(notice.text)}</p>
              </article>
            `).join('') || `<div class="empty">No hay avisos publicados.</div>`}
          </div>
        </section>

        <section id="publicar" class="publish-section">
          <div class="publish-card">
            <div>
              <span class="eyebrow">Participa</span>
              <h2>Enviar una noticia o aviso</h2>
              <p>Comparte información útil para la comunidad. Puedes preparar el mensaje y enviarlo a la administración.</p>
            </div>

            <form id="publishForm" class="publish-form">
              <label>
                Nombre
                <input name="name" placeholder="Tu nombre" required />
              </label>

              <label>
                Categoría
                <select name="category" required>
                  <option>Comunicado</option>
                  <option>Seguridad</option>
                  <option>Mantenimiento</option>
                  <option>Agenda</option>
                  <option>Otro</option>
                </select>
              </label>

              <label class="full">
                Título
                <input name="title" placeholder="Título de la noticia o aviso" required />
              </label>

              <label class="full">
                Detalle
                <textarea name="detail" rows="5" placeholder="Escribe aquí la información..." required></textarea>
              </label>

              <button class="submit-button full" type="submit">Preparar envío</button>
            </form>
          </div>
        </section>
      </main>

      <footer class="site-footer">
        <img src="${logoSrc}" alt="${safe(site.communityName)}" />
        <div>
          <strong>${safe(site.siteName)}</strong>
          <span>${safe(site.subtitle)}</span>
        </div>
      </footer>

      <dialog id="articleDialog">
        <div class="dialog-content"></div>
        <button class="close-dialog">Cerrar</button>
      </dialog>
    </div>
  `

  bindEvents()
}

function bindEvents() {
  document.querySelector('.menu-button')?.addEventListener('click', () => {
    document.querySelector('.main-nav')?.classList.toggle('open')
  })

  document.querySelectorAll('[data-category]').forEach(button => {
    button.addEventListener('click', () => {
      activeCategory = button.dataset.category
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

  dialog.querySelector('.dialog-content').innerHTML = `
    ${articleImage(article, 'dialog-image')}
    <div class="label">${safe(article.category)}</div>
    <h2>${safe(article.title)}</h2>
    <div class="story-meta dialog-meta">
      <span>${safe(article.author || 'Redacción CH II')}</span>
      <span>${formatDate(article.date)}</span>
    </div>
    <div class="dialog-body">${bodyToHTML(article.body)}</div>
  `

  dialog.showModal()
}

async function init() {
  document.querySelector('#app').innerHTML = `
    <div class="loading-screen">
      <img src="./uploads/logo-cuesta-hermosa.jpg" alt="Cuesta Hermosa II" />
      <strong>El Mosquito</strong>
      <span>Cargando periódico comunitario...</span>
    </div>
  `

  const loadedSite = await getJSON('/data/site.json', DEFAULT_SITE)
  site = { ...DEFAULT_SITE, ...loadedSite }

  const loadedArticles = await getJSON('/data/noticias.json', { items: [] })
  const loadedNotices = await getJSON('/data/avisos.json', { items: [] })

  articles = normalizeList(loadedArticles)
  notices = normalizeList(loadedNotices)

  render()
}

init()
