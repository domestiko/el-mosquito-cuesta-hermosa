// tina/config.js
import { defineConfig } from "tinacms";
var branch = process.env.TINA_BRANCH || process.env.HEAD || "main";
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
        label: "Configuraci\xC3\xB3n del sitio",
        path: "docs/data",
        format: "json",
        match: {
          include: "site"
        },
        ui: {
          allowedActions: {
            create: false,
            delete: false
          }
        },
        fields: [
          {
            type: "string",
            name: "siteName",
            label: "Nombre del peri\xC3\xB3dico"
          },
          {
            type: "string",
            name: "communityName",
            label: "Nombre de la comunidad"
          },
          {
            type: "string",
            name: "subtitle",
            label: "Subt\xC3\xADtulo"
          },
          {
            type: "string",
            name: "tagline",
            label: "Frase corta"
          },
          {
            type: "image",
            name: "logo",
            label: "Logo peque\xC3\xB1o del encabezado"
          },
          {
            type: "string",
            name: "heroImage",
            label: "Ruta de la foto principal fija de portada",
            description: "Primero sube la imagen en Media Manager. Luego escribe aqu\xC3\xAD la ruta. Ejemplo: /uploads/logo-el-mosquito.png"
          },
          {
            type: "string",
            name: "location",
            label: "Ubicaci\xC3\xB3n"
          },
          {
            type: "string",
            name: "editionLabel",
            label: "Etiqueta de edici\xC3\xB3n"
          },
          {
            type: "string",
            name: "heroLabel",
            label: "Etiqueta de portada"
          },
          {
            type: "string",
            name: "heroTitle",
            label: "T\xC3\xADtulo principal"
          },
          {
            type: "string",
            name: "heroText",
            label: "Texto principal",
            ui: {
              component: "textarea"
            }
          },
          {
            type: "string",
            name: "heroButtonText",
            label: "Texto del bot\xC3\xB3n principal"
          },
          {
            type: "string",
            name: "whatsappNumber",
            label: "WhatsApp"
          },
          {
            type: "string",
            name: "primaryColor",
            label: "Color principal"
          },
          {
            type: "string",
            name: "accentColor",
            label: "Color secundario"
          },
          {
            type: "string",
            name: "darkColor",
            label: "Color oscuro"
          },
          {
            type: "string",
            name: "paperColor",
            label: "Color de fondo"
          }
        ]
      },
      {
        name: "categorias",
        label: "Categor\xC3\xADas",
        path: "docs/data",
        format: "json",
        match: {
          include: "categorias"
        },
        ui: {
          allowedActions: {
            create: false,
            delete: false
          }
        },
        fields: [
          {
            type: "object",
            name: "items",
            label: "Lista de categor\xC3\xADas",
            list: true,
            ui: {
              itemProps: (item) => {
                return { label: item?.name || "Nueva categor\xC3\xADa" };
              }
            },
            fields: [
              {
                type: "string",
                name: "name",
                label: "Nombre",
                required: true
              },
              {
                type: "string",
                name: "description",
                label: "Descripci\xC3\xB3n",
                ui: {
                  component: "textarea"
                }
              },
              {
                type: "string",
                name: "color",
                label: "Color"
              },
              {
                type: "image",
                name: "image",
                label: "Imagen de categor\xC3\xADa"
              },
              {
                type: "boolean",
                name: "featured",
                label: "Mostrar en portada"
              },
              {
                type: "number",
                name: "order",
                label: "Orden"
              }
            ]
          }
        ]
      },
      {
        name: "noticias",
        label: "Noticias",
        path: "docs/data",
        format: "json",
        match: {
          include: "noticias"
        },
        ui: {
          allowedActions: {
            create: false,
            delete: false
          }
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
              }
            },
            fields: [
              {
                type: "string",
                name: "id",
                label: "ID \xC3\xBAnico",
                description: "Ejemplo: comision-contra-inundaciones",
                required: true
              },
              {
                type: "string",
                name: "category",
                label: "Categor\xC3\xADa",
                options: [
                  "Editorial",
                  "Seguridad",
                  "Mantenimiento",
                  "Comunidad",
                  "Actividades",
                  "Elecciones",
                  "Opini\xC3\xB3n",
                  "Avisos"
                ],
                required: true
              },
              {
                type: "string",
                name: "title",
                label: "T\xC3\xADtulo",
                required: true
              },
              {
                type: "string",
                name: "summary",
                label: "Resumen",
                ui: {
                  component: "textarea"
                }
              },
              {
                type: "string",
                name: "author",
                label: "Autor"
              },
              {
                type: "datetime",
                name: "date",
                label: "Fecha"
              },
              {
                type: "boolean",
                name: "featured",
                label: "Noticia principal de portada"
              },
              {
                type: "image",
                name: "image",
                label: "Foto de la noticia",
                description: "Esta imagen solo se ver\xC3\xA1 dentro de la noticia, no en el bloque grande fijo de portada."
              },
              {
                type: "image",
                name: "gallery",
                label: "Galer\xC3\xADa de fotos",
                list: true,
                description: "Aqu\xC3\xAD puedes subir varias fotos relacionadas con la noticia."
              },
              {
                type: "object",
                name: "attachments",
                label: "Archivos adjuntos",
                list: true,
                description: "Para PDF o documentos: primero s\xC3\xBAbelos a Media Manager o GitHub y luego escribe la ruta.",
                ui: {
                  itemProps: (item) => {
                    return { label: item?.title || "Archivo adjunto" };
                  }
                },
                fields: [
                  {
                    type: "string",
                    name: "title",
                    label: "T\xC3\xADtulo del archivo",
                    required: true
                  },
                  {
                    type: "string",
                    name: "description",
                    label: "Descripci\xC3\xB3n del archivo",
                    ui: {
                      component: "textarea"
                    }
                  },
                  {
                    type: "string",
                    name: "file",
                    label: "Ruta del archivo",
                    description: "Ejemplo: /uploads/informe-tecnico-drenaje-pluvial.pdf",
                    required: true
                  }
                ]
              },
              {
                type: "string",
                name: "body",
                label: "Texto completo",
                ui: {
                  component: "textarea"
                }
              }
            ]
          }
        ]
      },
      {
        name: "avisos",
        label: "Avisos",
        path: "docs/data",
        format: "json",
        match: {
          include: "avisos"
        },
        ui: {
          allowedActions: {
            create: false,
            delete: false
          }
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
              }
            },
            fields: [
              {
                type: "string",
                name: "title",
                label: "T\xC3\xADtulo",
                required: true
              },
              {
                type: "string",
                name: "text",
                label: "Texto",
                ui: {
                  component: "textarea"
                }
              }
            ]
          }
        ]
      },
      {
        name: "documentos",
        label: "Documentos descargables",
        path: "docs/data",
        format: "json",
        match: {
          include: "documentos"
        },
        ui: {
          allowedActions: {
            create: false,
            delete: false
          }
        },
        fields: [
          {
            type: "object",
            name: "items",
            label: "Lista de documentos",
            list: true,
            ui: {
              itemProps: (item) => {
                return { label: item?.title || "Nuevo documento" };
              }
            },
            fields: [
              {
                type: "string",
                name: "title",
                label: "T\xC3\xADtulo",
                required: true
              },
              {
                type: "string",
                name: "description",
                label: "Descripci\xC3\xB3n",
                ui: {
                  component: "textarea"
                }
              },
              {
                type: "string",
                name: "category",
                label: "Categor\xC3\xADa"
              },
              {
                type: "datetime",
                name: "date",
                label: "Fecha"
              },
              {
                type: "string",
                name: "file",
                label: "Ruta del archivo",
                description: "Ejemplo: /uploads/informe-tecnico-drenaje-pluvial.pdf",
                required: true
              },
              {
                type: "boolean",
                name: "featured",
                label: "Mostrar en la p\xC3\xA1gina"
              }
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
