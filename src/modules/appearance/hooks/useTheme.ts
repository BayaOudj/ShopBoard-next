'use client'
import { createContext, useContext } from 'react'
import type { Theme } from '../model/theme.persistence'
export const ThemeContext = createContext<{
  theme: Theme
  toggle: () => void
} | null>(null)
export function useTheme() {
  const value = useContext(ThemeContext)
  if (!value) throw new Error('ThemeProvider is required')
  return value
}
