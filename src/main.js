import './style.css'

const CONFIG = {
  siteTitle: 'Periódico Cuesta Hermosa II',
  subtitle: 'Noticias, avisos y participación vecinal',
  location: 'Cuesta Hermosa II · Santo Domingo',
  whatsappNumber: '',
  remoteDataBase: 'https://www.elmosquito.do'
}

let articles = []
let notices = []
let activeCategory = 'Todas'
let searchTerm = ''

async function getJSON(path, fallback = []) {
  const urls = [`${CONFIG.remoteDataBase}${path}`, path]
  for (const url of urls) {
    try {
      const response = await fetch(url, { cache: 'no-store' })
      if (response.ok) return await response.json()
    } catch (error) {}
  }
  return fallback
}

async function loadContent() {
  const [loadedArticles, loadedNotices] = await Promise.all([
    getJSON('/data/noticias.json', []),
    getJSON('/data/avisos.json', [])
  ])
  articles = Array.isArray(loadedArticles) ? loadedArticles : []
  notices = Array.isArray(loadedNotices) ? loadedNotices : []
}

function formatDate(date) {
  if (!date) return ''
  return new Intl.DateTimeFormat('es-DO', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${date}T12:00:00`))
}

function imageUrl(path) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  if (path.startsWith('./')) return path.replace('./', '/')
  if (path.startsWith('/')) return path
  return `/uploads/${path}`
}

function whatsappLink(message) {
  if (!CONFIG.whatsappNumber) return ''
  return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`
}

function categories() {
  return ['Todas', ...new Set(articles.map(a => a.category).filter(Boolean))]
}

function filteredArticles() {
  return articles.filter(a => {
    const matchCategory = activeCategory === 'Todas' || a.category === activeCategory
    const words = `${a.title} ${a.summary} ${a.body} ${a.category}`.toLowerCase()
    return matchCategory && words.includes(searchTerm.toLowerCase())
  })
}

function articleImage(article, extraClass = '') {
  const src = imageUrl(article.image || '')
  if (!src) return `<div class="image-placeholder ${extraClass}">CH II</div>`
  return `<img class="article-image ${extraClass}" src="${src}" alt="${article.title}" loading="lazy" />`
}

function render() {
  const featured = articles.find(a => a.featured) || articles[0]
  const list = filteredArticles()
  document.querySelector('#app').innerHTML = `
    <div class="newspaper">
      <header class="masthead">
        <div class="topline"><span>${CONFIG.location}</span><span>${new Intl.DateTimeFormat('es-DO', { dateStyle: 'full' }).format(new Date())}</span></div>
        <div class="brand"><p>Periódico Comunitario</p><h1>Cuesta Hermosa II</h1><span>${CONFIG.subtitle}</span></div>
        <nav class="nav"><a href="#portada">Portada</a><a href="#noticias">Noticias</a><a href="#avisos">Avisos</a><a href="#publicar">Publicar</a></nav>
      </header>
      <main>
        ${featured ? `<section id="portada" class="hero-grid"><article class="lead-story"><div class="lead-copy"><div class="label">${featured.category}</div><h2>${featured.title}</h2><p>${featured.summary}</p><div class="story-meta"><span>${featured.author || 'Redacción CH II'}</span><span>${formatDate(featured.date)}</span></div><button class="read-button" data-open="${featured.id}">Leer noticia completa</button></div>${articleImage(featured, 'lead-image')}</article><aside class="bulletin"><h3>Últimos avisos</h3>${notices.map(n => `<article class="mini-notice"><strong>${n.title}</strong><p>${n.text}</p></article>`).join('')}<a class="whatsapp" href="#publicar">Enviar información</a></aside></section>` : `<section class="section"><h2>No hay noticias publicadas</h2><p class="muted">Agrega noticias en <strong>docs/data/noticias.json</strong>.</p></section>`}
        <section class="tools"><div class="search"><span>Buscar</span><input id="searchInput" value="${searchTerm}" placeholder="Buscar noticia, aviso o tema..." /></div><div class="chips">${categories().map(c => `<button class="chip ${c === activeCategory ? 'active' : ''}" data-category="${c}">${c}</button>`).join('')}</div></section>
        <section id="noticias" class="section"><div class="section-title"><p>Edición digital</p><h2>Noticias y reportajes</h2></div><div class="articles-grid">${list.map(a => `<article class="article-card">${articleImage(a)}<div class="label">${a.category}</div><h3>${a.title}</h3><p>${a.summary}</p><div class="story-meta"><span>${a.author || 'Redacción CH II'}</span><span>${formatDate(a.date)}</span></div><button class="text-button" data-open="${a.id}">Leer más</button></article>`).join('') || `<div class="empty">No encontramos noticias con ese filtro.</div>`}</div></section>
        <section id="avisos" class="section notices-section"><div class="section-title"><p>Comunidad</p><h2>Avisos importantes</h2></div><div class="notice-board">${notices.map(n => `<article><strong>${n.title}</strong><p>${n.text}</p></article>`).join('')}</div></section>
        <section id="publicar" class="section publish-section"><div><div class="section-title left"><p>Participa</p><h2>Enviar noticia o aviso</h2></div><p class="muted">Completa este formulario. Por ahora prepara un mensaje listo para copiar o enviar. Luego podemos conectarlo a un panel administrativo.</p></div><form id="publishForm" class="publish-form"><label>Nombre<input name="name" placeholder="Tu nombre" required /></label><label>Categoría<select name="category" required><option>Comunicado</option><option>Seguridad</option><option>Mantenimiento</option><option>Agenda</option><option>Otro</option></select></label><label class="full">Título<input name="title" placeholder="Título de la noticia o aviso" required /></label><label class="full">Detalle<textarea name="detail" rows="5" placeholder="Escribe aquí la información..." required></textarea></label><button class="submit-button full" type="submit">Preparar envío</button></form></section>
      </main>
      <footer><strong>${CONFIG.siteTitle}</strong><span>Un espacio informativo para la comunidad.</span></footer>
      <dialog id="articleDialog"><div class="dialog-content"></div><button class="close-dialog">Cerrar</button></dialog>
    </div>`
  bindEvents()
}

function bindEvents() {
  document.querySelectorAll('[data-category]').forEach(b => b.addEventListener('click', () => { activeCategory = b.dataset.category; render() }))
  const input = document.querySelector('#searchInput')
  input?.addEventListener('input', e => { searchTerm = e.target.value; render(); setTimeout(() => { const next = document.querySelector('#searchInput'); next?.focus(); next?.setSelectionRange(next.value.length, next.value.length) }, 0) })
  document.querySelectorAll('[data-open]').forEach(b => b.addEventListener('click', () => openArticle(b.dataset.open)))
  document.querySelector('.close-dialog')?.addEventListener('click', () => document.querySelector('#articleDialog').close())
  document.querySelector('#publishForm')?.addEventListener('submit', e => {
    e.preventDefault()
    const d = new FormData(e.target)
    const message = ['Nueva información para Periódico Cuesta Hermosa II', '', `Nombre: ${d.get('name')}`, `Categoría: ${d.get('category')}`, `Título: ${d.get('title')}`, '', `Detalle: ${d.get('detail')}`].join('\n')
    const link = whatsappLink(message)
    if (link) window.open(link, '_blank', 'noopener,noreferrer')
    else { navigator.clipboard?.writeText(message); alert('Mensaje preparado y copiado al portapapeles, si tu navegador lo permite.') }
  })
}

function openArticle(id) {
  const article = articles.find(a => a.id === id)
  if (!article) return
  const dialog = document.querySelector('#articleDialog')
  dialog.querySelector('.dialog-content').innerHTML = `${articleImage(article, 'dialog-image')}<div class="label">${article.category}</div><h2>${article.title}</h2><div class="story-meta dialog-meta"><span>${article.author || 'Redacción CH II'}</span><span>${formatDate(article.date)}</span></div><p>${article.body}</p>`
  dialog.showModal()
}

async function init() {
  document.querySelector('#app').innerHTML = `<div class="loading-screen"><strong>Periódico Cuesta Hermosa II</strong><span>Cargando noticias...</span></div>`
  await loadContent()
  render()
}
init()
