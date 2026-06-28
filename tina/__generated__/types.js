export function gql(strings, ...args) {
  let str = "";
  strings.forEach((string, i) => {
    str += string + (args[i] || "");
  });
  return str;
}
export const SitePartsFragmentDoc = gql`
    fragment SiteParts on Site {
  __typename
  siteName
  communityName
  subtitle
  tagline
  logo
  location
  editionLabel
  heroLabel
  heroTitle
  heroText
  heroButtonText
  whatsappNumber
  primaryColor
  accentColor
  darkColor
  paperColor
}
    `;
export const CategoriasPartsFragmentDoc = gql`
    fragment CategoriasParts on Categorias {
  __typename
  items {
    __typename
    name
    description
    color
    featured
    order
  }
}
    `;
export const NoticiasPartsFragmentDoc = gql`
    fragment NoticiasParts on Noticias {
  __typename
  items {
    __typename
    id
    category
    title
    summary
    author
    date
    featured
    image
    body
  }
}
    `;
export const AvisosPartsFragmentDoc = gql`
    fragment AvisosParts on Avisos {
  __typename
  items {
    __typename
    title
    text
  }
}
    `;
export const SiteDocument = gql`
    query site($relativePath: String!) {
  site(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...SiteParts
  }
}
    ${SitePartsFragmentDoc}`;
export const SiteConnectionDocument = gql`
    query siteConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: SiteFilter) {
  siteConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...SiteParts
      }
    }
  }
}
    ${SitePartsFragmentDoc}`;
export const CategoriasDocument = gql`
    query categorias($relativePath: String!) {
  categorias(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...CategoriasParts
  }
}
    ${CategoriasPartsFragmentDoc}`;
export const CategoriasConnectionDocument = gql`
    query categoriasConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: CategoriasFilter) {
  categoriasConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...CategoriasParts
      }
    }
  }
}
    ${CategoriasPartsFragmentDoc}`;
export const NoticiasDocument = gql`
    query noticias($relativePath: String!) {
  noticias(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...NoticiasParts
  }
}
    ${NoticiasPartsFragmentDoc}`;
export const NoticiasConnectionDocument = gql`
    query noticiasConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: NoticiasFilter) {
  noticiasConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...NoticiasParts
      }
    }
  }
}
    ${NoticiasPartsFragmentDoc}`;
export const AvisosDocument = gql`
    query avisos($relativePath: String!) {
  avisos(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...AvisosParts
  }
}
    ${AvisosPartsFragmentDoc}`;
export const AvisosConnectionDocument = gql`
    query avisosConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: AvisosFilter) {
  avisosConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...AvisosParts
      }
    }
  }
}
    ${AvisosPartsFragmentDoc}`;
export function getSdk(requester) {
  return {
    site(variables, options) {
      return requester(SiteDocument, variables, options);
    },
    siteConnection(variables, options) {
      return requester(SiteConnectionDocument, variables, options);
    },
    categorias(variables, options) {
      return requester(CategoriasDocument, variables, options);
    },
    categoriasConnection(variables, options) {
      return requester(CategoriasConnectionDocument, variables, options);
    },
    noticias(variables, options) {
      return requester(NoticiasDocument, variables, options);
    },
    noticiasConnection(variables, options) {
      return requester(NoticiasConnectionDocument, variables, options);
    },
    avisos(variables, options) {
      return requester(AvisosDocument, variables, options);
    },
    avisosConnection(variables, options) {
      return requester(AvisosConnectionDocument, variables, options);
    }
  };
}
import { createClient } from "tinacms/dist/client";
const generateRequester = (client) => {
  const requester = async (doc, vars, options) => {
    let url = client.apiUrl;
    if (options?.branch) {
      const index = client.apiUrl.lastIndexOf("/");
      url = client.apiUrl.substring(0, index + 1) + options.branch;
    }
    const data = await client.request({
      query: doc,
      variables: vars,
      url
    }, options);
    return { data: data?.data, errors: data?.errors, query: doc, variables: vars || {} };
  };
  return requester;
};
export const ExperimentalGetTinaClient = () => getSdk(
  generateRequester(
    createClient({
      url: "http://localhost:4001/graphql",
      queries
    })
  )
);
export const queries = (client) => {
  const requester = generateRequester(client);
  return getSdk(requester);
};
