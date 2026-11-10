'use client'
import { useState, type ReactNode } from 'react'
import { ThemeContext } from './hooks/useTheme'
import { saveTheme, type Theme } from './model/theme.persistence'
export function ThemeProvider({
  initialTheme,
  children,
}: {
  initialTheme: Theme
  children: ReactNode
}) {
  const [theme, setTheme] = useState(initialTheme)
  const [message, setMessage] = useState('')
  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark'
    const saved = saveTheme(next)
    setTheme(next)
    setMessage(
      (next === 'dark' ? 'Dark' : 'Light') +
        ' theme enabled' +
        (saved ? '.' : ' for this visit.'),
    )
  }
  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      <div
        data-theme={theme}
        className={
          (theme === 'dark' ? 'dark ' : '') +
          'relative isolate min-h-dvh bg-canvas text-ink before:pointer-events-none before:fixed before:-inset-[20%] before:-z-10 before:animate-ambient-drift before:bg-(image:--background-image-ambient) motion-reduce:before:animate-none'
        }
      >
        {children}
        <p className="sr-only" role="status">
          {message}
        </p>
      </div>
    </ThemeContext.Provider>
  )
}
