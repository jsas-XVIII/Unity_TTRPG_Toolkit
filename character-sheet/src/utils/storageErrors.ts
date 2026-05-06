export function isQuotaError(e: unknown): boolean {
  return e instanceof DOMException && e.name === 'QuotaExceededError'
}
