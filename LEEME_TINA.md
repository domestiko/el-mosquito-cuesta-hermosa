# Configuración TinaCMS para El Mosquito

Copia estos archivos en tu proyecto estando en la rama `tina-panel`.

Luego ejecuta:

```bash
npx tinacms dev -c "npm run dev"
```

Abre:

```text
http://localhost:5173/admin/index.html
```

Deben aparecer las colecciones `Noticias` y `Avisos`.

Los JSON usan este formato para que Tina los edite:

```json
{
  "items": []
}
```
