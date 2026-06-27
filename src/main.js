import './style.css'

const whatsappNumber = ''
// Para activar contacto por WhatsApp, coloca aquí el número con código de país, sin + ni guiones.
// Ejemplo: const whatsappNumber = '18091234567'

const articles = [
  {
    id: 'editorial',
    category: 'Editorial',
    title: 'Cuesta Hermosa II: una comunidad que se informa y participa',
    summary: 'Nace un espacio digital para compartir noticias, alertas, actividades, propuestas y temas de interés vecinal.',
    author: 'Redacción CH II',
    date: '2026-06-27',
    featured: true,
    body: 'Este periódico comunitario busca mantener a los residentes informados sobre temas importantes de Cuesta Hermosa II: seguridad, mantenimiento, drenajes, tránsito, actividades vecinales, servicios y proyectos de mejora. La participación de cada residente ayuda a construir una comunidad más organizada, segura y activa.'
  },
  {
    id: 'seguridad',
    category: 'Seguridad',
    title: 'Recomendaciones para fortalecer la seguridad residencial',
    summary: 'Pequeñas acciones coordinadas pueden mejorar la vigilancia, la comunicación y la prevención dentro del residencial.',
    author: 'Comunidad',
    date: '2026-06-26',
    featured: false,
    body: 'Se recomienda mantener actualizados los canales de comunicación, reportar movimientos inusuales, verificar accesos y reforzar la colaboración entre vecinos y administración. La seguridad comunitaria funciona mejor cuando todos participan con responsabilidad.'
  },
  {
    id: 'drenaje',
    category: 'Mantenimiento',
    title: 'Limpieza preventiva de imbornales y drenajes',
    summary: 'El mantenimiento constante de los drenajes ayuda a reducir acumulaciones de agua durante temporadas de lluvia.',
    author: 'Redacción CH II',
    date: '2026-06-25',
    featured: false,
    body: 'La limpieza de imbornales, cunetas y zonas de escorrentía debe realizarse de forma preventiva. Cualquier punto donde el agua permanezca estancada debe ser documentado y reportado para seguimiento.'
  },
  {
    id: 'agenda',
    category: 'Agenda',
    title: 'Agenda comunitaria: reuniones, jornadas y actividades',
    summary: 'Un espacio para mantener visibles las próximas reuniones, operativos y actividades de integración vecinal.',
    author: 'Administración',
    date: '2026-06-24',
    featured: false,
    body: 'La agenda comunitaria permitirá publicar convocatorias, jornadas de limpieza, reuniones, actividades familiares y fechas importantes. Este espacio puede actualizarse cada semana.'
  }
]

const notices = [
  'Espacio disponible para avisos de la administración.',
  'Puedes publicar recordatorios de pago, reuniones o cierres temporales.',
  'Sección ideal para emergencias, comunicados y alertas rápidas.'
]

const categories = ['Todas', 'Editorial', 'Seguridad', 'Mantenimiento', 'Agenda', 'Comunicados']

function formatDate(date) {
  return new Intl.DateTimeFormat('es-DO', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(date))
}

function whatsappLink(message) {
  if (!whatsappNumber) return ''
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
}

function app() {
  let activeCategory = 'Todas'
  let searchTerm = ''

  function filteredArticles() {
    return articles.filter(article => {
      const matchCategory = activeCategory === 'Todas' || article.category === activeCategory
      const words = `${article.title} ${article.summary} ${article.body} ${article.category}`.toLowerCase()
      const matchSearch = words.includes(searchTerm.toLowerCase())
      return matchCategory && matchSearch
    })
  }

  function render() {
    const featured = articles.find(article => article.featured)
    const list = filteredArticles()

    document.querySelector('#app').innerHTML = `
      <div class="newspaper">
        <header class="masthead">
          <div class="topline">
            <span>Cuesta Hermosa II · Santo Domingo</span>
            <span>${new Intl.DateTimeFormat('es-DO', { dateStyle: 'full' }).format(new Date())}</span>
          </div>

          <div class="brand">
            <p>Periódico Comunitario</p>
            <h1>Cuesta Hermosa II</h1>
            <span>Noticias, avisos y participación vecinal</span>
          </div>

          <nav class="nav">
            <a href="#portada">Portada</a>
            <a href="#noticias">Noticias</a>
            <a href="#avisos">Avisos</a>
            <a href="#publicar">Publicar</a>
          </nav>
        </header>

        <main>
          <section id="portada" class="hero-grid">
            <article class="lead-story">
              <div class="label">${featured.category}</div>
              <h2>${featured.title}</h2>
              <p>${featured.summary}</p>
              <div class="story-meta">
                <span>${featured.author}</span>
                <span>${formatDate(featured.date)}</span>
              </div>
              <button class="read-button" data-open="${featured.id}">Leer noticia completa</button>
            </article>

            <aside class="bulletin">
              <h3>Últimos avisos</h3>
              ${notices.map(notice => `<p>• ${notice}</p>`).join('')}
              <a class="whatsapp" href="#publicar">Enviar información</a>
            </aside>
          </section>

          <section class="tools">
            <div class="search">
              <span>Buscar</span>
              <input id="searchInput" value="${searchTerm}" placeholder="Buscar noticia, aviso o tema..." />
            </div>
            <div class="chips">
              ${categories.map(category => `<button class="chip ${category === activeCategory ? 'active' : ''}" data-category="${category}">${category}</button>`).join('')}
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
                  <div class="label">${article.category}</div>
                  <h3>${article.title}</h3>
                  <p>${article.summary}</p>
                  <div class="story-meta">
                    <span>${article.author}</span>
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
              <article>
                <strong>Comunicados oficiales</strong>
                <p>Publica informaciones de la administración, reuniones, mantenimientos o decisiones vecinales.</p>
              </article>
              <article>
                <strong>Alertas rápidas</strong>
                <p>Ideal para avisos de seguridad, tránsito, agua, energía, fumigación o emergencias.</p>
              </article>
              <article>
                <strong>Actividades</strong>
                <p>Comparte jornadas, reuniones, actividades familiares y proyectos de integración.</p>
              </article>
            </div>
          </section>

          <section id="publicar" class="section publish-section">
            <div>
              <div class="section-title left">
                <p>Participa</p>
                <h2>Enviar noticia o aviso</h2>
              </div>
              <p class="muted">Completa este formulario. Por ahora se genera un mensaje listo para enviar. Luego podemos conectar una base de datos para publicar desde un panel administrativo.</p>
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
          <strong>Periódico Cuesta Hermosa II</strong>
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

    document.querySelector('.close-dialog').addEventListener('click', () => {
      document.querySelector('#articleDialog').close()
    })

    document.querySelector('#publishForm').addEventListener('submit', event => {
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
        alert('El mensaje fue preparado. Como no hay número de WhatsApp configurado, se copió al portapapeles si tu navegador lo permite.')
      }
    })
  }

  function openArticle(id) {
    const article = articles.find(item => item.id === id)
    const dialog = document.querySelector('#articleDialog')
    dialog.querySelector('.dialog-content').innerHTML = `
      <div class="label">${article.category}</div>
      <h2>${article.title}</h2>
      <div class="story-meta dialog-meta">
        <span>${article.author}</span>
        <span>${formatDate(article.date)}</span>
      </div>
      <p>${article.body}</p>
    `
    dialog.showModal()
  }

  render()
}

app()
