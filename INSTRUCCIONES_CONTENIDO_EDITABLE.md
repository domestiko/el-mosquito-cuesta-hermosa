# Actualización: contenido editable para Periódico Cuesta Hermosa II

Esta actualización permite editar noticias, avisos y fotos desde archivos separados.

## Copiar al proyecto
Copia estas carpetas/archivos sobre tu proyecto actual:

- src/main.js
- src/style.css
- public/data/noticias.json
- public/data/avisos.json
- public/uploads/.gitkeep
- docs/main.js
- docs/style.css
- docs/data/noticias.json
- docs/data/avisos.json
- docs/uploads/.gitkeep

## Agregar una noticia desde GitHub
Edita `docs/data/noticias.json` y agrega un bloque como este:

```json
{
  "id": "jornada-limpieza",
  "category": "Mantenimiento",
  "title": "Jornada de limpieza comunitaria",
  "summary": "La comunidad realizará una jornada de limpieza este sábado.",
  "author": "Administración",
  "date": "2026-07-01",
  "featured": false,
  "image": "jornada-limpieza.jpg",
  "body": "Texto completo de la noticia."
}
```

## Subir foto
Sube la imagen en `docs/uploads/` y coloca el nombre en el campo `image`.
Usa nombres sin espacios ni acentos.

## App iPhone
La app intenta leer contenido desde `https://www.elmosquito.do/data/noticias.json`.
Cuando el dominio esté activo, las noticias pueden actualizarse en la app sin recompilar.
