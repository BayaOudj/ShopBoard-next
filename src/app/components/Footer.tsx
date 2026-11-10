import { Brand } from './Brand'

export function Footer() {
  return (
    <footer className="mx-auto flex max-w-[1450px] flex-wrap items-center justify-between gap-4.5 border-t border-border px-5 py-6 [&_p]:m-0 [&_p]:text-caption [&_p]:text-subtle [&_small]:m-0 [&_small]:text-caption [&_small]:text-subtle lg:px-9.5 lg:py-6.25">
      <Brand compact />
      <p>A little more intention. A little more everyday joy.</p>
      <small>© 2026 Shopboard</small>
    </footer>
  )
}
