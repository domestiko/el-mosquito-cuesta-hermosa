
import { defineConfig } from "tinacms"

const branch =
  process.env.TINA_BRANCH ||
  process.env.HEAD ||
  "main"

export default defineConfig({
  branch,
  clientId: process.env.TINA_PUBLIC_CLIENT_ID,
  token: process.env.TINA_TOKEN,

  build: {
    outputFolder: "admin",
    publicFolder: "docs",
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
        name: "site",
        label: "Configuración del sitio",
        path: "docs/data",
        format: "json",
        match: {
          include: "site",
        },
        ui: {
          allowedActions: {
            create: false,
            delete: false,
          },
        },
        fields: [
          {
            type: "string",
            name: "siteName",
            label: "Nombre del periódico",
          },
          {
            type: "string",
            name: "communityName",
            label: "Nombre de la comunidad",
          },
          {
            type: "string",
            name: "subtitle",
            label: "Subtítulo",
          },
          {
            type: "string",
            name: "tagline",
            label: "Frase corta",
          },
          {
            type: "image",
            name: "logo",
            label: "Logo",
          },
          {
            type: "string",
            name: "location",
            label: "Ubicación",
          },
          {
            type: "string",
            name: "editionLabel",
            label: "Etiqueta de edición",
          },
          {
            type: "string",
            name: "heroLabel",
            label: "Etiqueta de portada",
          },
          {
            type: "string",
            name: "heroTitle",
            label: "Título principal",
          },
          {
            type: "string",
            name: "heroText",
            label: "Texto principal",
            ui: {
              component: "textarea",
            },
          },
          {
            type: "string",
            name: "heroButtonText",
            label: "Texto del botón principal",
          },
          {
            type: "string",
            name: "whatsappNumber",
            label: "WhatsApp",
          },
          {
            type: "string",
            name: "primaryColor",
            label: "Color principal",
          },
          {
            type: "string",
            name: "accentColor",
            label: "Color secundario",
          },
          {
            type: "string",
            name: "darkColor",
            label: "Color oscuro",
          },
          {
            type: "string",
            name: "paperColor",
            label: "Color de fondo",
          },
        ],
      },

      {
        name: "categorias",
        label: "Categorías",
        path: "docs/data",
        format: "json",
        match: {
          include: "categorias",
        },
        ui: {
          allowedActions: {
            create: false,
            delete: false,
          },
        },
        fields: [
          {
            type: "object",
            name: "items",
            label: "Lista de categorías",
            list: true,
            ui: {
              itemProps: (item) => {
                return { label: item?.name || "Nueva categoría" }
              },
            },
            fields: [
              {
                type: "string",
                name: "name",
                label: "Nombre",
                required: true,
              },
              {
                type: "string",
                name: "description",
                label: "Descripción",
                ui: {
                  component: "textarea",
                },
              },
              {
                type: "string",
                name: "color",
                label: "Color",
              },
              {
                type: "image",
                name: "image",
                label: "Imagen de categoría",
              },
              {
                type: "boolean",
                name: "featured",
                label: "Mostrar en portada",
              },
              {
                type: "number",
                name: "order",
                label: "Orden",
              },
            ],
          },
        ],
      },

      {
        name: "noticias",
        label: "Noticias",
        path: "docs/data",
        format: "json",
        match: {
          include: "noticias",
        },
        ui: {
          allowedActions: {
            create: false,
            delete: false,
          },
        },
        fields: [
          {
            type: "object",
            name: "items",
            label: "Lista de noticias",
            list: true,
            ui: {
              itemProps: (item) => {
                return { label: item?.title || "Nueva noticia" }
              },
            },
            fields: [
              {
                type: "string",
                name: "id",
                label: "ID único",
                description: "Ejemplo: comision-contra-inundaciones",
                required: true,
              },
              {
                type: "string",
                name: "category",
                label: "Categoría",
                options: [
                  "Editorial",
                  "Seguridad",
                  "Mantenimiento",
                  "Comunidad",
                  "Actividades",
                  "Elecciones",
                  "Opinión",
                  "Avisos",
                ],
                required: true,
              },
              {
                type: "string",
                name: "title",
                label: "Título",
                required: true,
              },
              {
                type: "string",
                name: "summary",
                label: "Resumen",
                ui: {
                  component: "textarea",
                },
              },
              {
                type: "string",
                name: "author",
                label: "Autor",
              },
              {
                type: "datetime",
                name: "date",
                label: "Fecha",
              },
              {
                type: "boolean",
                name: "featured",
                label: "Noticia principal de portada",
              },
              {
                type: "image",
                name: "image",
                label: "Foto principal de la noticia",
                description: "Esta imagen se usa como foto principal de la noticia.",
              },
              {
                type: "image",
                name: "gallery",
                label: "Galería de fotos",
                list: true,
                description: "Aquí puedes subir varias fotos relacionadas con la noticia.",
              },
              {
                type: "object",
                name: "attachments",
                label: "Archivos adjuntos",
                list: true,
                description: "Aquí puedes agregar PDFs, documentos o imágenes descargables.",
                ui: {
                  itemProps: (item) => {
                    return { label: item?.title || "Archivo adjunto" }
                  },
                },
                fields: [
                  {
                    type: "string",
                    name: "title",
                    label: "Título del archivo",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "description",
                    label: "Descripción del archivo",
                    ui: {
                      component: "textarea",
                    },
                  },
                  {
                    type: "image",
                    name: "file",
                    label: "Archivo",
                    description: "Sube o selecciona aquí el PDF, documento o imagen.",
                    required: true,
                  },
                ],
              },
              {
                type: "string",
                name: "body",
                label: "Texto completo",
                ui: {
                  component: "textarea",
                },
              },
            ],
          },
        ],
      },

      {
        name: "avisos",
        label: "Avisos",
        path: "docs/data",
        format: "json",
        match: {
          include: "avisos",
        },
        ui: {
          allowedActions: {
            create: false,
            delete: false,
          },
        },
        fields: [
          {
            type: "object",
            name: "items",
            label: "Lista de avisos",
            list: true,
            ui: {
              itemProps: (item) => {
                return { label: item?.title || "Nuevo aviso" }
              },
            },
            fields: [
              {
                type: "string",
                name: "title",
                label: "Título",
                required: true,
              },
              {
                type: "string",
                name: "text",
                label: "Texto",
                ui: {
                  component: "textarea",
                },
              },
            ],
          },
        ],
      },

      {
        name: "documentos",
        label: "Documentos descargables",
        path: "docs/data",
        format: "json",
        match: {
          include: "documentos",
        },
        ui: {
          allowedActions: {
            create: false,
            delete: false,
          },
        },
        fields: [
          {
            type: "object",
            name: "items",
            label: "Lista de documentos",
            list: true,
            ui: {
              itemProps: (item) => {
                return { label: item?.title || "Nuevo documento" }
              },
            },
            fields: [
              {
                type: "string",
                name: "title",
                label: "Título",
                required: true,
              },
              {
                type: "string",
                name: "description",
                label: "Descripción",
                ui: {
                  component: "textarea",
                },
              },
              {
                type: "string",
                name: "category",
                label: "Categoría",
              },
              {
                type: "datetime",
                name: "date",
                label: "Fecha",
              },
              {
                type: "image",
                name: "file",
                label: "Archivo",
                description: "Sube o selecciona el PDF, imagen o documento.",
                required: true,
              },
              {
                type: "boolean",
                name: "featured",
                label: "Mostrar en la página",
              },
            ],
          },
        ],
      },
    ],
  },
})
