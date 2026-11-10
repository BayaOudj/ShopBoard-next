import { Card } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'

import type { Product } from '../../products/model/products.types'
import { COLLECTIONS } from '../../products/model/products.collections'
import { catalogStats } from '../model/dashboard.logic'
import { money } from '../../../shared/lib/money'

export function DashboardOverview({
  products,
  loaded,
}: {
  products: Product[]
  loaded: boolean
}) {
  const stats = catalogStats(products)
  const metrics = [
    [
      'Products',
      String(stats.count).padStart(2, '0'),
      'Thoughtfully selected essentials',
      '▦',
    ],
    [
      'Collections',
      String(COLLECTIONS.length).padStart(2, '0'),
      'Edits for the way you live',
      '▱',
    ],
    [
      'Average price',
      stats.average === null ? '—' : money(stats.average),
      'Across the complete catalog',
      '↗',
    ],
    [
      'Under $50',
      String(stats.underFifty).padStart(2, '0'),
      'Small upgrades, lovely prices',
      '✧',
    ],
  ]
  const max = Math.max(0, ...stats.categories.map((category) => category.value))
  const stops = stats.categories.map((category, index) => {
    const before = stats.categories
      .slice(0, index)
      .reduce((sum, item) => sum + item.count, 0)
    const start = stats.count ? (before / stats.count) * 360 : 0
    const end = stats.count
      ? ((before + category.count) / stats.count) * 360
      : 0
    return `${category.color} ${start}deg ${end}deg`
  })
  return (
    <section hidden={!loaded} className="pb-4" aria-label="Catalog overview">
      <div
        id="overview-metrics"
        className="grid grid-cols-2 gap-3 md:grid-cols-4"
      >
        {metrics.map(([label, value, note, icon]) => (
          <Card
            key={label}
            asChild
            className="relative animate-metric-enter overflow-hidden p-4.5 before:pointer-events-none before:absolute before:-inset-1/2 before:animate-liquid-light before:bg-(image:--background-image-metric-glow) [&>*]:relative [&>[aria-hidden]]:absolute nth-2:before:bg-(image:--background-image-metric-pink) nth-2:before:[animation-delay:-3s] nth-3:before:bg-(image:--background-image-metric-cyan) nth-3:before:[animation-delay:-6s] nth-4:before:bg-(image:--background-image-metric-mint) nth-4:before:[animation-delay:-8s] [&_h2]:pr-6.25 [&_h2]:text-label [&_h2]:font-medium [&_h2]:tracking-normal [&_h2]:text-metric-ink sm:p-5.5 motion-reduce:animate-none motion-reduce:before:animate-none"
          >
            <article>
              <h2>{label}</h2>
              <span
                className="absolute top-3.25 right-3.5 grid size-7 place-items-center rounded-icon bg-icon-surface text-metric-icon text-icon-ink sm:top-4.5 sm:right-5"
                aria-hidden="true"
              >
                {icon}
              </span>
              <p className="mt-6 mb-2.5 text-stat leading-none font-medium tracking-[-1.5px]">
                {value}
              </p>
              <p className="mt-2 mb-0 text-tiny leading-[1.7] text-subtle">
                {note}
              </p>
            </article>
          </Card>
        ))}
      </div>
      <div className="mt-5 grid gap-4.5 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <Card
          asChild
          variant="value"
          className="relative animate-panel-enter overflow-hidden bg-(image:--background-image-value-panel) p-6.25 xl:p-7.5 motion-reduce:animate-none"
        >
          <article aria-labelledby="value-title">
            <div className="flex items-start justify-between gap-3 [&_h2]:text-chart-title [&_p:first-child]:text-micro">
              <div>
                <p className="mb-3 text-tiny font-semibold tracking-[2px] text-subtle">
                  THE BIG PICTURE
                </p>
                <h2 id="value-title">A well-balanced collection.</h2>
              </div>
              <Badge className="hidden sm:inline-flex">Catalog value</Badge>
            </div>
            <p
              id="overview-value"
              className="mt-7.5 mb-2 text-value leading-none font-medium tracking-[-2px]"
            >
              {money(stats.total)}
            </p>
            <p className="mt-2 mb-0 text-label leading-[1.7] text-subtle">
              Combined price of one of each product · USD
            </p>
            <div id="value-chart" className="mt-7.5 mb-5 grid gap-4">
              {stats.categories.map((category) => (
                <div
                  key={category.name}
                  className="grid grid-cols-[90px_minmax(0,1fr)_43px] items-center gap-3 text-caption [&_strong]:text-right [&_strong]:font-medium sm:grid-cols-[100px_minmax(0,1fr)_45px]"
                >
                  <span>{category.name}</span>
                  <span className="h-3 overflow-hidden rounded-full bg-track">
                    <span
                      className="block h-full origin-left animate-fill-in rounded-[inherit] motion-reduce:animate-none"
                      style={{
                        width: `${max ? (category.value / max) * 100 : 0}%`,
                        background: `linear-gradient(90deg,var(--color-chart-highlight),${category.color})`,
                      }}
                    />
                  </span>
                  <strong>{money(category.value)}</strong>
                </div>
              ))}
            </div>
            <details className="border-t border-border pt-3.25 text-caption text-chart-ink [&_summary]:w-fit [&_summary]:cursor-pointer [&_summary]:py-1.25 [&_table]:w-full [&_table]:border-collapse [&_table]:text-left [&_table]:text-label [&_caption]:pt-3 [&_caption]:pb-4.5 [&_caption]:text-left [&_caption]:text-caption [&_caption]:text-subtle [&_th]:border-b [&_th]:border-table-line [&_th]:px-2.5 [&_th]:py-3.25 [&_th]:align-middle [&_th]:font-medium [&_td]:border-b [&_td]:border-table-line [&_td]:px-2.5 [&_td]:py-3.25 [&_td]:align-middle [&_td]:font-normal [&_thead_th]:text-caption [&_thead_th]:text-subtle">
              <summary>View chart data</summary>
              <table>
                <caption>Catalog price totals by category</caption>
                <thead>
                  <tr>
                    <th scope="col">Category</th>
                    <th scope="col">Products</th>
                    <th scope="col">Total price</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.categories.map((category) => (
                    <tr key={category.name}>
                      <th scope="row">{category.name}</th>
                      <td>{category.count}</td>
                      <td>{money(category.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          </article>
        </Card>
        <Card
          asChild
          variant="mix"
          className="relative animate-panel-enter overflow-hidden bg-(image:--background-image-mix-panel) p-6.25 xl:p-7.5 motion-reduce:animate-none"
        >
          <article aria-labelledby="mix-title">
            <div className="flex items-start justify-between gap-3 [&_h2]:text-chart-title [&_p:first-child]:text-micro">
              <div>
                <p className="mb-3 text-tiny font-semibold tracking-[2px] text-subtle">
                  A LITTLE OF EVERYTHING
                </p>
                <h2 id="mix-title">The product mix</h2>
              </div>
              <span aria-hidden="true">↗</span>
            </div>
            <div
              id="mix-chart"
              className="mx-auto my-6 size-42 animate-donut-in rounded-full p-4 shadow-donut [&>span]:flex [&>span]:size-full [&>span]:flex-col [&>span]:items-center [&>span]:justify-center [&>span]:rounded-full [&>span]:bg-donut-hole [&>span]:shadow-donut-inset [&_strong]:text-number [&_strong]:leading-[1.1] [&_strong]:font-medium [&_strong]:tracking-[-1px] [&_span_span]:mt-1 [&_span_span]:text-label [&_span_span]:text-subtle motion-reduce:animate-none"
              style={{
                background: stats.count
                  ? `conic-gradient(${stops.join(',')})`
                  : 'var(--color-chart-empty)',
              }}
              role="img"
              aria-label={`Product mix: ${stats.categories.map((category) => `${category.name}, ${category.count}`).join('; ')}`}
            >
              <span>
                <strong>{stats.count}</strong>
                <span>products</span>
              </span>
            </div>
            <ul className="m-0 grid list-none gap-2 p-0 [&_li]:flex [&_li]:items-center [&_li]:gap-2 [&_li]:text-label [&_strong]:ml-auto [&_strong]:font-medium">
              {stats.categories.map((category) => (
                <li key={category.name}>
                  <span
                    className="size-1.75 rounded-full"
                    style={{ background: category.color }}
                    aria-hidden="true"
                  />
                  <span>{category.name}</span>
                  <strong>{category.count}</strong>
                </li>
              ))}
            </ul>
            <p className="mt-2 mb-0 text-label leading-[1.7] text-subtle">
              Based on the current catalog, across all collections.
            </p>
          </article>
        </Card>
      </div>
    </section>
  )
}
