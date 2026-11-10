import { render, screen } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ThemeProvider } from './ThemeProvider'
import { ThemeToggle } from './components/ThemeToggle'
import { parseTheme, themeCookie } from './model/theme.persistence'

beforeEach(() => {
  document.cookie = themeCookie + '=; Path=/; Max-Age=0'
})

describe('appearance preference', () => {
  it('validates the public cookie and uses the original light design for invalid values', () => {
    expect(parseTheme('dark')).toBe('dark')
    for (const value of ['light', '', 'system', null, {}, '__proto__'])
      expect(parseTheme(value)).toBe('light')
  })

  it('changes the visible theme, announces it and saves the preference', async () => {
    const user = userEvent.setup()
    const view = render(
      <ThemeProvider initialTheme="light">
        <ThemeToggle />
      </ThemeProvider>,
    )
    await user.click(
      screen.getByRole('button', { name: 'Switch to dark mode' }),
    )
    expect(
      screen.getByRole('button', { name: 'Switch to light mode' }),
    ).toHaveAttribute('aria-pressed', 'true')
    expect(view.container.querySelector('[data-theme]')).toHaveAttribute(
      'data-theme',
      'dark',
    )
    expect(document.cookie).toContain('shopboard-theme=dark')
    expect(screen.getByRole('status')).toHaveTextContent('Dark theme enabled.')
    await user.click(
      screen.getByRole('button', { name: 'Switch to light mode' }),
    )
    expect(document.cookie).toContain('shopboard-theme=light')
  })

  it('renders a saved dark preference on the server without accessing browser persistence', () => {
    const write = vi.spyOn(Document.prototype, 'cookie', 'set')
    const html = renderToString(
      <ThemeProvider initialTheme="dark">
        <ThemeToggle />
      </ThemeProvider>,
    )
    expect(html).toContain('data-theme="dark"')
    expect(html).toContain('Switch to light mode')
    expect(write).not.toHaveBeenCalled()
  })

  it('keeps theme switching usable when the browser denies saving cookies', async () => {
    const denied = vi
      .spyOn(Document.prototype, 'cookie', 'set')
      .mockImplementation(() => {
        throw new DOMException('Denied', 'SecurityError')
      })
    const user = userEvent.setup()
    render(
      <ThemeProvider initialTheme="light">
        <ThemeToggle />
      </ThemeProvider>,
    )
    await user.click(
      screen.getByRole('button', { name: 'Switch to dark mode' }),
    )
    expect(
      screen.getByRole('button', { name: 'Switch to light mode' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(
      'Dark theme enabled for this visit.',
    )
    denied.mockRestore()
  })
})
