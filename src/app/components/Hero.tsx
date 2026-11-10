import { Button } from '../../components/ui/button'
import Link from 'next/link'
import type { Ref } from 'react'

export function Hero({ sectionRef }: { sectionRef: Ref<HTMLElement> }) {
  return (
    <section
      ref={sectionRef}
      id="hero"
      className="flex flex-wrap items-center justify-between gap-5 pt-8.5 pb-7 lg:pt-9.75 lg:pb-7.5"
      aria-labelledby="hero-title"
      tabIndex={-1}
    >
      <div className="[&>p:not(:first-child)]:m-0 [&>p:not(:first-child)]:max-w-[450px] [&>p:not(:first-child)]:text-body [&>p:not(:first-child)]:text-subtle">
        <p className="mb-3 text-tiny font-semibold tracking-[2px] text-subtle">
          A FRESH PERSPECTIVE
        </p>
        <h1 id="hero-title">
          Your everyday, <em>elevated.</em>
        </h1>
        <p>
          A little clarity. A lot of possibility. Welcome to your Shopboard
          overview.
        </p>
      </div>
      <Button
        asChild
        className="inline-flex min-h-11 items-center justify-between gap-6 rounded-button border border-primary bg-primary px-4.5 py-3 text-body text-primary-foreground transition-[transform,background,box-shadow] duration-250 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-action motion-reduce:transition-none motion-reduce:hover:translate-y-0 [&_span]:text-hero-icon"
      >
        <Link href="/products">
          Explore products <span aria-hidden="true">↗</span>
        </Link>
      </Button>
    </section>
  )
}
