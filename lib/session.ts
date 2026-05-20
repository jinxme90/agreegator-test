export function getSessionId(): string {
  if (typeof window === 'undefined') return 'server'
  let sessionId = localStorage.getItem('ux-radar-session')
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    localStorage.setItem('ux-radar-session', sessionId)
  }
  return sessionId
}
