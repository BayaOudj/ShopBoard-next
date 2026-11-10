'use client'
import Link from 'next/link'
import { useState, type ReactNode } from 'react'
import { PersonIcon } from '../../components/ui/person-icon'
import { Button } from '../../components/ui/button'
import { Modal } from '../../components/ui/modal'
import { ThemeToggle } from '../../modules/appearance/components/ThemeToggle'
import { navigation, type SectionId } from '../navigation'
export function Header({
  activeSection,
  cartButton,
  pageTitle,
}: {
  pageTitle?: string
  activeSection: SectionId
  cartButton: ReactNode
}) {
  const [notices, setNotices] = useState(false)
  const current =
    pageTitle ??
    navigation.find((item) => item.id === activeSection)?.label ??
    'Overview'
  return (
    <>
      <header className="sticky top-0 z-5 flex flex-wrap items-center justify-between gap-3 border-b border-header-line bg-header px-5 py-4 backdrop-blur-xl min-[360px]:flex-nowrap sm:px-7 lg:px-9.5 lg:py-4.5">
        <span className="basis-full text-label whitespace-nowrap text-subtle min-[360px]:basis-auto">
          <span className="hidden sm:inline">
            Workspace{' '}
            <span className="mx-2.5 text-faint" aria-hidden="true">
              /
            </span>{' '}
          </span>
          <strong className="font-medium text-ink">{current}</strong>
        </span>
        <div className="ml-auto flex items-center gap-2.25">
          <Link
            className="mr-2 hidden items-center gap-2.5 text-caption text-subtle sm:flex"
            href="/products#search-products"
          >
            <span className="text-logo-desktop" aria-hidden="true">
              ⌕
            </span>{' '}
            Search products{' '}
            <kbd className="rounded-sm border border-line px-1.25 [font:inherit]">
              /
            </kbd>
          </Link>
          <ThemeToggle />
          <Button
            variant="unstyled"
            size="icon"
            className="relative rounded-button border border-border bg-surface text-logo"
            aria-label="Workspace notifications"
            aria-haspopup="dialog"
            onClick={() => setNotices(true)}
          >
            <span aria-hidden="true">♧</span>
            <span className="absolute top-2.5 right-2.5 size-1.25 rounded-full bg-notice-dot" />
          </Button>
          {cartButton}
          <Link
            className="grid size-8.75 shrink-0 place-items-center rounded-full border-2 border-border bg-(image:--background-image-avatar) text-avatar-ink"
            href="/community"
            aria-label="Join Shopboard"
          >
            <PersonIcon />
          </Link>
        </div>
      </header>
      <Modal
        open={notices}
        onClose={() => setNotices(false)}
        title="You're all caught up"
        size="sm"
      >
        <p className="mb-3 text-body">
          Explore thoughtfully selected products and three collections.
        </p>
        <p className="mb-3 text-body text-subtle">
          This demo has no live order or account notifications.
        </p>
        <Button
          variant="link"
          className="text-label"
          onClick={() => setNotices(false)}
        >
          Dismiss
        </Button>
      </Modal>
    </>
  )
}
