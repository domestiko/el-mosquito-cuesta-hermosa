import { defineConfig } from "tinacms";

const branch = process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || "tina-panel";

export default defineConfig({
  branch,
  clientId: null,
  token: null,
  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  media: {
    tina: {
      mediaRoot: "uploads",
      publicFolder: "docs",
    },
  },
  schema: {
    collections: [
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
              { type: "string", name: "id", label: "ID único", required: true, description: "Sin espacios ni acentos. Ejemplo: jornada-limpieza" },
              { type: "string", name: "category", label: "Categoría", options: ["Editorial", "Seguridad", "Mantenimiento", "Agenda", "Comunidad", "Avisos", "Otro"], required: true },
              { type: "string", name: "title", label: "Título", required: true },
              { type: "string", name: "summary", label: "Resumen", ui: { component: "textarea" } },
              { type: "string", name: "author", label: "Autor" },
              { type: "datetime", name: "date", label: "Fecha" },
              { type: "boolean", name: "featured", label: "Destacar en portada" },
              { type: "image", name: "image", label: "Foto" },
              { type: "string", name: "body", label: "Texto completo", ui: { component: "textarea" } }
            ],
          },
        ],
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
              { type: "string", name: "title", label: "Título", required: true },
              { type: "string", name: "text", label: "Texto", ui: { component: "textarea" } }
            ],
          },
        ],
      },
    ],
  },
});
