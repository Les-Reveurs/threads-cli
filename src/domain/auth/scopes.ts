export const DEFAULT_THREADS_SCOPES = ['threads_basic', 'threads_content_publish']

export const normalizeScopes = (scopes?: string[]): string[] => {
  const values = (scopes || DEFAULT_THREADS_SCOPES)
    .flatMap((scope) => scope.split(','))
    .map((scope) => scope.trim())
    .filter(Boolean)

  return [...new Set(values)]
}

export const normalizeOptionalScopes = (scopes?: string[]): string[] | undefined => {
  if (!scopes?.length) return undefined
  const normalized = normalizeScopes(scopes)
  return normalized.length ? normalized : undefined
}
