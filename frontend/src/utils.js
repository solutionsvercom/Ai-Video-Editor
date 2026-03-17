export function createPageUrl(pageName) {
  const [page, query] = pageName.split('?');
  const path = `/${page}`;
  return query ? `${path}?${query}` : path;
}
