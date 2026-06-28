const CONFIG = {
  siteTitle: 'Periódico Cuesta Hermosa II',
  subtitle: 'Noticias, avisos y participación vecinal',
  location: 'Cuesta Hermosa II · Santo Domingo',
  whatsappNumber: '',
  remoteDataBase: 'https://domestiko.github.io/el-mosquito-cuesta-hermosa'
}

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

async function getJSON(path) {
  const relativePath = `.${path}`
  const remotePath = `${CONFIG.remoteDataBase}${path}`

  const isHttp = window.location.protocol === 'http:' || window.location.protocol === 'https:'
  const urls = isHttp ? [relativePath, remotePath] : [remotePath, relativePath]

  for (const url of urls) {
    try {
      const response = await fetch(url, { cache: 'no-store' })
      if (response.ok) return normalizeList(await response.json())
    } catch (error) {
      // Intentar la próxima URL.
    }
  }

  return []
}

async function loadContent() {
  const [loadedArticles, loadedNotices] = await Promise.all([
    getJSON('/data/noticias.json'),
    getJSON('/data/avisos.json')
  ])

  articles = loadedArticles
  notices = loadedNotices
}

function formatDate(date) {
  if (!date) return ''
  return new Intl.DateTimeFormat('es-DO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(date))
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

function whatsappLink(message) {
  if (!CONFIG.whatsappNumber) return ''
  return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`
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
  if (!src) return `<div class="image-placeholder ${extraClass}">CH II</div>`

  return `
    <img class="article-image ${extraClass}" src="${src}" alt="${article.title}" loading="lazy" />
  `
}

function render() {
  const featured = articles.find(article => article.featured) || articles[0]
  const list = filteredArticles()

  document.querySelector('#app').innerHTML = `
    <div class="newspaper">
      <header class="masthead">
        <div class="topline">
          <span>${CONFIG.location}</span>
          <span>${new Intl.DateTimeFormat('es-DO', { dateStyle: 'full' }).format(new Date())}</span>
        </div>

        <div class="brand">
          <p>Periódico Comunitario</p>
          <h1>Cuesta Hermosa II</h1>
          <span>${CONFIG.subtitle}</span>
        </div>

        <nav class="nav">
          <a href="#portada">Portada</a>
          <a href="#noticias">Noticias</a>
          <a href="#avisos">Avisos</a>
          <a href="#publicar">Publicar</a>
        </nav>
      </header>

      <main>
        ${featured ? `
          <section id="portada" class="hero-grid">
            <article class="lead-story">
              <div class="lead-copy">
                <div class="label">${featured.category}</div>
                <h2>${featured.title}</h2>
                <p>${featured.summary}</p>
                <div class="story-meta">
                  <span>${featured.author || 'Redacción CH II'}</span>
                  <span>${formatDate(featured.date)}</span>
                </div>
                <button class="read-button" data-open="${featured.id}">Leer noticia completa</button>
              </div>
              ${articleImage(featured, 'lead-image')}
            </article>

            <aside class="bulletin">
              <h3>Últimos avisos</h3>
              ${notices.map(notice => `
                <article class="mini-notice">
                  <strong>${notice.title}</strong>
                  <p>${notice.text}</p>
                </article>
              `).join('')}
              <a class="whatsapp" href="#publicar">Enviar información</a>
            </aside>
          </section>
        ` : `
          <section class="section">
            <h2>No hay noticias publicadas</h2>
            <p class="muted">Agrega noticias desde TinaCMS.</p>
          </section>
        `}

        <section class="tools">
          <div class="search">
            <span>Buscar</span>
            <input id="searchInput" value="${searchTerm}" placeholder="Buscar noticia, aviso o tema..." />
          </div>
          <div class="chips">
            ${categories().map(category => `
              <button class="chip ${category === activeCategory ? 'active' : ''}" data-category="${category}">
                ${category}
              </button>
            `).join('')}
          </div>
        </section>

        <section id="noticias" class="section">
          <div class="section-title">
            <p>Edición digital</p>
            <h2>Noticias y reportajes</h2>
          </div>

          <div class="articles-grid">
            ${list.map(article => `
              <article class="article-card">
                ${articleImage(article)}
                <div class="label">${article.category}</div>
                <h3>${article.title}</h3>
                <p>${article.summary}</p>
                <div class="story-meta">
                  <span>${article.author || 'Redacción CH II'}</span>
                  <span>${formatDate(article.date)}</span>
                </div>
                <button class="text-button" data-open="${article.id}">Leer más</button>
              </article>
            `).join('') || `<div class="empty">No encontramos noticias con ese filtro.</div>`}
          </div>
        </section>

        <section id="avisos" class="section notices-section">
          <div class="section-title">
            <p>Comunidad</p>
            <h2>Avisos importantes</h2>
          </div>

          <div class="notice-board">
            ${notices.map(notice => `
              <article>
                <strong>${notice.title}</strong>
                <p>${notice.text}</p>
              </article>
            `).join('')}
          </div>
        </section>

        <section id="publicar" class="section publish-section">
          <div>
            <div class="section-title left">
              <p>Participa</p>
              <h2>Enviar noticia o aviso</h2>
            </div>
            <p class="muted">
              Completa este formulario. Por ahora prepara un mensaje listo para copiar o enviar.
            </p>
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
        </section>
      </main>

      <footer>
        <strong>${CONFIG.siteTitle}</strong>
        <span>Un espacio informativo para la comunidad.</span>
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
  document.querySelectorAll('[data-category]').forEach(button => {
    button.addEventListener('click', () => {
      activeCategory = button.dataset.category
      render()
    })
  })

  const searchInput = document.querySelector('#searchInput')
  searchInput.addEventListener('input', event => {
    searchTerm = event.target.value
    render()
    setTimeout(() => {
      const nextInput = document.querySelector('#searchInput')
      nextInput.focus()
      nextInput.setSelectionRange(nextInput.value.length, nextInput.value.length)
    }, 0)
  })

  document.querySelectorAll('[data-open]').forEach(button => {
    button.addEventListener('click', () => openArticle(button.dataset.open))
  })

  document.querySelector('.close-dialog')?.addEventListener('click', () => {
    document.querySelector('#articleDialog').close()
  })

  document.querySelector('#publishForm')?.addEventListener('submit', event => {
    event.preventDefault()
    const data = new FormData(event.target)
    const message = [
      'Nueva información para Periódico Cuesta Hermosa II',
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
      alert('Mensaje preparado y copiado al portapapeles, si tu navegador lo permite.')
    }
  })
}

function openArticle(id) {
  const article = articles.find(item => item.id === id)
  if (!article) return

  const dialog = document.querySelector('#articleDialog')
  dialog.querySelector('.dialog-content').innerHTML = `
    ${articleImage(article, 'dialog-image')}
    <div class="label">${article.category}</div>
    <h2>${article.title}</h2>
    <div class="story-meta dialog-meta">
      <span>${article.author || 'Redacción CH II'}</span>
      <span>${formatDate(article.date)}</span>
    </div>
    <p>${article.body}</p>
  `
  dialog.showModal()
}

async function init() {
  document.querySelector('#app').innerHTML = `
    <div class="loading-screen">
      <strong>Periódico Cuesta Hermosa II</strong>
      <span>Cargando noticias...</span>
    </div>
  `
  await loadContent()
  render()
}

init()
