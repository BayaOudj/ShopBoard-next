import { cookies } from 'next/headers'
import type { ReactNode } from 'react'
import { ThemeProvider } from '../../modules/appearance/ThemeProvider'
import {
  parseTheme,
  themeCookie,
} from '../../modules/appearance/model/theme.persistence'
export async function ThemeBoundary({ children }: { children: ReactNode }) {
  const cookieStore = await cookies()
  return (
    <ThemeProvider
      initialTheme={parseTheme(cookieStore.get(themeCookie)?.value)}
    >
      {children}
    </ThemeProvider>
  )
}
