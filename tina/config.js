import { defineConfig } from "tinacms";

const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  "main";

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
            label: "Nombre principal",
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
            type: "image",
            name: "logo",
            label: "Logo",
          },
          {
            type: "string",
            name: "heroTitle",
            label: "Título de portada",
          },
          {
            type: "string",
            name: "heroText",
            label: "Texto de portada",
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
            name: "location",
            label: "Ubicación",
          },
          {
            type: "string",
            name: "whatsappNumber",
            label: "WhatsApp",
            description: "Solo números, con código de país. Ejemplo: 18092454846",
          },
          {
            type: "string",
            name: "primaryColor",
            label: "Color principal",
          },
          {
            type: "string",
            name: "accentColor",
            label: "Color de acento",
          },
          {
            type: "string",
            name: "darkColor",
            label: "Color oscuro",
          },
          {
            type: "string",
            name: "lightColor",
            label: "Color claro",
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
                return { label: item?.title || "Nueva noticia" };
              },
            },
            fields: [
              {
                type: "string",
                name: "id",
                label: "ID único",
                required: true,
                description: "Sin espacios ni acentos. Ejemplo: jornada-limpieza",
              },
              {
                type: "string",
                name: "category",
                label: "Categoría",
                options: [
                  "Editorial",
                  "Seguridad",
                  "Mantenimiento",
                  "Agenda",
                  "Comunidad",
                  "Avisos",
                  "Otro",
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
                label: "Destacar en portada",
              },
              {
                type: "image",
                name: "image",
                label: "Foto",
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
                return { label: item?.title || "Nuevo aviso" };
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
    ],
  },
});
