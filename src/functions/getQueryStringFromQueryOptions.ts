type GetQueryStringFromQueryOptions = (options?: Record<string, any>) => string

export const getQueryStringFromQueryOptions: GetQueryStringFromQueryOptions = (options = {}) => {
  const query = Object.entries(options)
    .filter(([key, val]) => key && val)
    .map(([key, cal]) => `&${key.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`)}=${cal}`)
    .join('')

  return query ? `?${query.slice(1)}` : ''
}
