'use client'
import { Moon, Sun } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { useTheme } from '../hooks/useTheme'
import { useHydrated } from '../../../shared/hooks/useHydrated'
export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const hydrated = useHydrated()
  const label =
    theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'
  return (
    <Button
      variant="unstyled"
      size="icon"
      className="rounded-button border border-border bg-surface text-accent-ink"
      aria-label={label}
      aria-pressed={theme === 'dark'}
      title={label}
      disabled={!hydrated}
      onClick={toggle}
    >
      {theme === 'light' ? (
        <Moon size={18} aria-hidden="true" />
      ) : (
        <Sun size={18} aria-hidden="true" />
      )}
    </Button>
  )
}
