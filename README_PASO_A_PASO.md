# Periódico Cuesta Hermosa II

Esta versión convierte el proyecto en una app/web tipo periódico comunitario.

## Qué incluye

- Portada estilo periódico.
- Noticias y reportajes.
- Filtro por categorías.
- Buscador.
- Avisos importantes.
- Formulario para enviar noticia o aviso.
- Configuración para GitHub Pages.
- Configuración para Capacitor/iPhone.

## Cómo probar en tu Mac

En Terminal, entra a la carpeta:

```bash
cd ~/Desktop/el-mosquito-cuesta-hermosa
```

Instala y prueba:

```bash
npm install
npm run dev
```

Abre la URL que salga, normalmente:

```text
http://localhost:5173/
```

## Cómo subir a GitHub

Sube el contenido completo de esta carpeta al repositorio:

```text
domestiko/el-mosquito-cuesta-hermosa
```

La web quedaría en:

```text
https://domestiko.github.io/el-mosquito-cuesta-hermosa/
```

## Cómo activar GitHub Pages

En GitHub:

1. Entra al repositorio.
2. Ve a Settings.
3. Ve a Pages.
4. En Build and deployment selecciona GitHub Actions.
5. Espera el despliegue.

## Cómo actualizar la app de iPhone

En Terminal:

```bash
npm install
npm run build
npx cap add ios
npx cap sync ios
npx cap open ios
```

Si la carpeta `ios` ya existe, usa:

```bash
npm run build
npx cap sync ios
npx cap open ios
```

## Cambiar noticias

Abre:

```text
src/main.js
```

Busca:

```js
const articles = [
```

Ahí puedes editar títulos, categorías, fechas, autores y contenido.

## Activar WhatsApp

Abre:

```text
src/main.js
```

Busca:

```js
const whatsappNumber = ''
```

Cambia por un número con código de país, sin + ni guiones:

```js
const whatsappNumber = '18091234567'
```
