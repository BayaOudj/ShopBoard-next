'use client'
import { Card } from '../../../components/ui/card'
import { Label } from '../../../components/ui/label'
import { Input } from '../../../components/ui/input'
import { Button } from '../../../components/ui/button'

import { useState } from 'react'
import { useHydrated } from '../../../shared/hooks/useHydrated'
import type { Ref } from 'react'

export function RegistrationSection({
  sectionRef,
}: {
  sectionRef: Ref<HTMLElement>
}) {
  const hydrated = useHydrated()
  const [submitted, setSubmitted] = useState(false)
  return (
    <section
      id="register"
      ref={sectionRef}
      className="my-7.5 mb-10 grid gap-7 overflow-hidden rounded-section border border-border bg-(image:--background-image-registration) p-7 [&_h2]:text-registration [&>div>p:not(:first-child)]:my-4.5 [&>div>p:not(:first-child)]:max-w-[340px] [&>div>p:not(:first-child)]:text-body [&>div>p:not(:first-child)]:text-subtle md:grid-cols-2 md:items-center md:gap-8.75 md:p-8.75 lg:gap-12.5 lg:p-10"
      aria-labelledby="register-title"
      tabIndex={-1}
    >
      <div>
        <p className="mb-3 text-tiny font-semibold tracking-[2px] text-subtle">
          MAKE YOURSELF AT HOME
        </p>
        <h2 id="register-title">
          A good thing,
          <br />
          <em>shared.</em>
        </h2>
        <p>
          Create your ShopBoard account and be first to hear about new
          essentials and fresh collections.
        </p>
        <span
          className="mt-6.25 block w-fit animate-bloom text-flower leading-none text-flower-ink motion-reduce:animate-none"
          aria-hidden="true"
        >
          ✳
        </span>
      </div>
      <Card
        asChild
        variant="plain"
        className="flex min-w-0 flex-col rounded-form border border-border bg-form p-6 [&_h3]:mb-6 [&_h3]:text-field [&_label:not([for=updates])]:mb-2 [&_label:not([for=updates])]:block [&_label:not([for=updates])]:text-body [&_label]:font-medium [&_input:not([type=checkbox])]:mb-4 [&_input[type=password]]:mb-1.75 [&_small]:text-caption [&_small]:leading-[1.7] [&_small]:text-subtle [&>p]:mt-3 [&>p]:mb-0 [&>p]:text-caption [&>p]:leading-[1.7] [&>p]:text-subtle"
      >
        <form
          id="register-form"
          aria-labelledby="form-title"
          onSubmit={(event) => {
            event.preventDefault()
            if (event.currentTarget.checkValidity()) setSubmitted(true)
          }}
        >
          <h3 id="form-title">Join the ShopBoard community</h3>
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            minLength={2}
            placeholder="Your full name"
          />
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
          />
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            aria-describedby="password-help"
            placeholder="Create a password"
          />
          <small id="password-help">Use at least 8 characters.</small>
          <Label
            htmlFor="updates"
            className="my-5 flex items-start gap-2.5 text-caption [&_input]:m-0 [&_input]:size-4.25 [&_input]:shrink-0 [&_input]:accent-focus"
          >
            <Input id="updates" name="updates" type="checkbox" />
            Send me occasional news and collection updates.
          </Label>
          <Button type="submit" disabled={!hydrated}>
            Create account <span aria-hidden="true">↗</span>
          </Button>
          <p id="register-status" role="status">
            {submitted
              ? 'Your details passed validation. This demo does not create an account or send your information.'
              : 'Demo form — no account will be created.'}
          </p>
        </form>
      </Card>
    </section>
  )
}
