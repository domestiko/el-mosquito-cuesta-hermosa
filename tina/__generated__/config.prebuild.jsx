// tina/config.js
import { defineConfig } from "tinacms";
var branch = process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || "main";
var config_default = defineConfig({
  branch,
  clientId: process.env.TINA_PUBLIC_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  build: {
    outputFolder: "admin",
    publicFolder: "docs"
  },
  media: {
    tina: {
      mediaRoot: "uploads",
      publicFolder: "docs"
    }
  },
  schema: {
    collections: [
      {
        name: "site",
        label: "Configuraci\xF3n del sitio",
        path: "docs/data",
        format: "json",
        match: { include: "site" },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          { type: "string", name: "siteName", label: "Nombre principal" },
          { type: "string", name: "communityName", label: "Nombre de la comunidad" },
          { type: "string", name: "subtitle", label: "Subt\xEDtulo" },
          { type: "string", name: "tagline", label: "Frase corta debajo del nombre" },
          { type: "image", name: "logo", label: "Logo" },
          { type: "string", name: "location", label: "Ubicaci\xF3n" },
          { type: "string", name: "editionLabel", label: "Etiqueta de edici\xF3n" },
          { type: "string", name: "heroLabel", label: "Etiqueta de portada" },
          { type: "string", name: "heroTitle", label: "T\xEDtulo editorial de portada" },
          { type: "string", name: "heroText", label: "Texto editorial de portada", ui: { component: "textarea" } },
          { type: "string", name: "heroButtonText", label: "Texto del bot\xF3n principal" },
          { type: "string", name: "whatsappNumber", label: "WhatsApp", description: "Solo n\xFAmeros, con c\xF3digo de pa\xEDs. Ejemplo: 18092454846" },
          { type: "string", name: "primaryColor", label: "Color principal" },
          { type: "string", name: "accentColor", label: "Color de acento" },
          { type: "string", name: "darkColor", label: "Color oscuro" },
          { type: "string", name: "paperColor", label: "Color papel/fondo" }
        ]
      },
      {
        name: "categorias",
        label: "Categor\xEDas",
        path: "docs/data",
        format: "json",
        match: { include: "categorias" },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          {
            type: "object",
            name: "items",
            label: "Lista de categor\xEDas",
            list: true,
            ui: { itemProps: (item) => ({ label: item?.name || "Nueva categor\xEDa" }) },
            fields: [
              { type: "string", name: "name", label: "Nombre", required: true },
              { type: "string", name: "description", label: "Descripci\xF3n", ui: { component: "textarea" } },
              { type: "string", name: "color", label: "Color" },
              { type: "boolean", name: "featured", label: "Mostrar en portada" },
              { type: "number", name: "order", label: "Orden" }
            ]
          }
        ]
      },
      {
        name: "noticias",
        label: "Noticias",
        path: "docs/data",
        format: "json",
        match: { include: "noticias" },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          {
            type: "object",
            name: "items",
            label: "Lista de noticias",
            list: true,
            ui: { itemProps: (item) => ({ label: item?.title || "Nueva noticia" }) },
            fields: [
              { type: "string", name: "id", label: "ID \xFAnico", required: true, description: "Sin espacios ni acentos. Ejemplo: jornada-limpieza" },
              { type: "string", name: "category", label: "Categor\xEDa", options: ["Editorial", "Seguridad", "Mantenimiento", "Comunidad", "Actividades", "Opini\xF3n", "Avisos", "Otro"], required: true },
              { type: "string", name: "title", label: "T\xEDtulo", required: true },
              { type: "string", name: "summary", label: "Resumen", ui: { component: "textarea" } },
              { type: "string", name: "author", label: "Autor" },
              { type: "datetime", name: "date", label: "Fecha" },
              { type: "boolean", name: "featured", label: "Destacar como noticia principal" },
              { type: "image", name: "image", label: "Foto" },
              { type: "string", name: "body", label: "Texto completo", ui: { component: "textarea" } }
            ]
          }
        ]
      },
      {
        name: "avisos",
        label: "Avisos",
        path: "docs/data",
        format: "json",
        match: { include: "avisos" },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          {
            type: "object",
            name: "items",
            label: "Lista de avisos",
            list: true,
            ui: { itemProps: (item) => ({ label: item?.title || "Nuevo aviso" }) },
            fields: [
              { type: "string", name: "title", label: "T\xEDtulo", required: true },
              { type: "string", name: "text", label: "Texto", ui: { component: "textarea" } }
            ]
          }
        ]
      }
    ]
  }
});
export {
  config_default as default
};
