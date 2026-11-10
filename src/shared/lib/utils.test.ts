import { expect, it } from 'vitest'
import { cn } from './utils'
it('preserves semantic font sizes when a color is overridden', () => {
  expect(cn('text-label text-ink', 'text-subtle')).toBe(
    'text-label text-subtle',
  )
  expect(cn('[&_h2]:text-label [&_h2]:text-ink', '[&_h2]:text-subtle')).toBe(
    '[&_h2]:text-label [&_h2]:text-subtle',
  )
})
it('replaces conflicting radius tokens when a shared component is customized', () => {
  expect(cn('rounded-card', 'rounded-panel')).toBe('rounded-panel')
  expect(cn('rounded-input', 'rounded-icon')).toBe('rounded-icon')
})
