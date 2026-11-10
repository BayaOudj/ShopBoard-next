export type Theme = 'light' | 'dark'
export const themeCookie = 'shopboard-theme'
export function parseTheme(value: unknown): Theme {
  return value === 'dark' ? 'dark' : 'light'
}
export function saveTheme(theme: Theme): boolean {
  try {
    document.cookie =
      themeCookie +
      '=' +
      theme +
      '; Path=/; Max-Age=31536000; SameSite=Lax' +
      (location.protocol === 'https:' ? '; Secure' : '')
    return true
  } catch {
    return false
  }
}
