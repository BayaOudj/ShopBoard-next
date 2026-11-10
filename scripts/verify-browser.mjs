import { startBrowser } from './browser-session.mjs'
const browser = await startBrowser()
// Run against a production preview and a separately launched, isolated Chrome CDP profile.
import { writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
const appUrl = process.env.APP_URL ?? 'http://127.0.0.1:3190/'
const pages = await (await fetch(`${browser.debugUrl}/json/list`)).json()
const page = pages.find((item) => item.type === 'page')
if (!page) throw Error('Open a tab in the isolated test browser first.')
const ws = new WebSocket(page.webSocketDebuggerUrl)
await new Promise((resolve) =>
  ws.addEventListener('open', resolve, { once: true }),
)
let sequence = 0
const waiting = new Map()
const errors = []
const scripts = []
const warnings = []
let catalogRequests = 0
let held = []
let intercept = false
ws.addEventListener('message', (event) => {
  const message = JSON.parse(event.data)
  if (message.id) {
    const pending = waiting.get(message.id)
    waiting.delete(message.id)
    if (pending) {
      if (message.error) pending.reject(Error(JSON.stringify(message.error)))
      else pending.resolve(message.result)
    }
  }
  if (
    message.method === 'Runtime.consoleAPICalled' &&
    message.params.type === 'warning'
  )
    warnings.push(
      message.params.args
        .map((item) => item.value ?? item.description)
        .join(' '),
    )
  if (
    message.method === 'Network.requestWillBeSent' &&
    (message.params.request.headers.RSC === '1' ||
      message.params.request.headers.rsc === '1' ||
      message.params.request.url.includes('_rsc=') ||
      message.params.request.url.endsWith('/api/products.json'))
  )
    catalogRequests += 1
  if (message.method === 'Runtime.exceptionThrown')
    errors.push(JSON.stringify(message.params.exceptionDetails))
  if (
    message.method === 'Runtime.consoleAPICalled' &&
    message.params.type === 'error'
  )
    errors.push(
      message.params.args
        .map((item) => item.value ?? item.description)
        .join(' '),
    )
  if (
    message.method === 'Network.requestWillBeSent' &&
    message.params.type === 'Script'
  )
    scripts.push(message.params.request.url)
  if (message.method === 'Fetch.requestPaused') {
    if (intercept) held.push(message.params.requestId)
    else
      void send('Fetch.continueRequest', {
        requestId: message.params.requestId,
      })
  }
})
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++sequence
    waiting.set(id, { resolve, reject })
    ws.send(JSON.stringify({ id, method, params }))
  })
}
async function evaluate(expression) {
  const result = await send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  })
  if (result.exceptionDetails)
    throw Error(JSON.stringify(result.exceptionDetails))
  return result.result.value
}
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
async function waitFor(expression) {
  for (let n = 0; n < 160; n++) {
    if (await evaluate(`Boolean(${expression})`)) return
    await pause(50)
  }
  throw Error(
    `Timed out: ${expression}; errors=${JSON.stringify(errors)}; ${JSON.stringify(await evaluate(`({ url: location.href, main: document.querySelector('main')?.textContent, grids: [...document.querySelectorAll('#catalog-grid')].map(el => ({visible: !!el.getClientRects().length, count: el.children.length})) })`))}`,
  )
}
function assert(value, label) {
  if (!value) throw Error(label)
  console.log(`PASS ${label}`)
}
async function click(selector) {
  await waitFor(
    `document.querySelector(${JSON.stringify(selector)}) && !document.querySelector(${JSON.stringify(selector)}).matches(':disabled')`,
  )
  const point = await evaluate(
    `(() => { let element = document.querySelector(${JSON.stringify(selector)}); if (element instanceof HTMLInputElement && element.type === 'radio') element = element.labels?.[0] ?? element; if (!element) throw Error('Missing click target'); element.scrollIntoView({ behavior: 'instant', block: 'center' }); const rect = element.getBoundingClientRect(); return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }; })()`,
  )
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...point })
  await send('Input.dispatchMouseEvent', {
    type: 'mousePressed',
    button: 'left',
    clickCount: 1,
    ...point,
  })
  await send('Input.dispatchMouseEvent', {
    type: 'mouseReleased',
    button: 'left',
    clickCount: 1,
    ...point,
  })
  await pause(100)
}
async function fill(selector, value) {
  await evaluate(
    `{const input = document.querySelector(${JSON.stringify(selector)}); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, ${JSON.stringify(value)}); input.dispatchEvent(new Event('input', {bubbles:true})); input.dispatchEvent(new Event('change', {bubbles:true}));}`,
  )
}
async function navigate(path, ready) {
  await send('Page.bringToFront')
  await send('Page.navigate', { url: new URL(path, appUrl).href })
  await waitFor(ready)
  await waitFor(
    `document.activeElement?.id === 'main' || document.activeElement?.id === 'search-products'`,
  )
  if (!process.env.API_STATE)
    await waitFor(
      `document.querySelector('#open-cart') && !document.querySelector('#open-cart').disabled`,
    )
}
await send('Page.enable')
await send('Emulation.setFocusEmulationEnabled', { enabled: true })
await send('Runtime.enable')
await send('Network.enable')
await send('Network.setCacheDisabled', { cacheDisabled: true })
await navigate('/community', `document.querySelector('#register')`)
const saved = await evaluate(`localStorage.getItem('shopboard-cart-v1')`)
try {
  await evaluate(`localStorage.removeItem('shopboard-cart-v1')`)
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false,
  })
  if (process.env.API_STATE) {
    await verifyApiState(process.env.API_STATE)
  } else {
    await click('button[aria-label="Workspace notifications"]')
    await waitFor(`document.querySelector('dialog')?.open`)
    await send('Input.dispatchKeyEvent', {
      type: 'keyDown',
      key: 'Escape',
      code: 'Escape',
      windowsVirtualKeyCode: 27,
      nativeVirtualKeyCode: 53,
    })
    await send('Input.dispatchKeyEvent', {
      type: 'keyUp',
      key: 'Escape',
      code: 'Escape',
      windowsVirtualKeyCode: 27,
      nativeVirtualKeyCode: 53,
    })
    await waitFor(`!document.querySelector('dialog')?.open`)
    assert(true, 'notifications retain native keyboard dismissal')
    await send('Input.dispatchKeyEvent', {
      type: 'keyDown',
      key: '/',
      code: 'Slash',
      text: '/',
    })
    await send('Input.dispatchKeyEvent', {
      type: 'keyUp',
      key: '/',
      code: 'Slash',
    })
    await waitFor(
      `location.pathname === '/products' && document.activeElement?.id === 'search-products'`,
    )
    assert(true, 'global slash shortcut navigates and focuses product search')
    await navigate('/community', `document.querySelector('#register')`)
    await click('#register-form button[type="submit"]')
    assert(
      await evaluate(
        `!document.querySelector('#register-form').checkValidity() && !document.querySelector('#register-status').textContent.includes('passed')`,
      ),
      'community keeps native required-field validation',
    )
    for (const [id, value] of [
      ['name', 'Test Member'],
      ['email', 'member@example.com'],
      ['password', 'sample-password'],
    ]) {
      await click(`#${id}`)
      await send('Input.insertText', { text: value })
    }
    await click('#register-form button[type="submit"]')
    await waitFor(
      `document.querySelector('#register-status')?.textContent.includes('does not create an account')`,
    )
    assert(
      await evaluate(
        `!localStorage.getItem('shopboard-cart-v1').includes('member@example.com')`,
      ),
      'community confirmation does not persist personal information',
    )
    await navigate(
      '/',
      `document.querySelector('#overview-value')?.textContent.includes('931')`,
    )
    await click('nav a[href="/products"]')
    await waitFor(
      `document.querySelectorAll('#catalog-grid article').length === 15`,
    )
    await fill('#search-products', 'no-such-item')
    await waitFor(
      `document.querySelector('main')?.textContent.includes('No products match')`,
    )
    await click('#reset-filters')
    await waitFor(
      `document.querySelectorAll('#catalog-grid article').length === 15`,
    )
    await click('article[data-product-id="1"] h3 button')
    await waitFor(
      `document.querySelector('main h1')?.textContent === 'Leather Tote Bag'`,
    )
    await click('input[aria-label="Black for Leather Tote Bag"]')
    await click('button[aria-label="Add Leather Tote Bag to cart"]')
    await waitFor(`document.querySelector('#cart-count')?.textContent === '1'`)
    await click('nav a[href="/community"]')
    await waitFor(`document.querySelector('#register')`)
    assert(
      await evaluate(
        `document.querySelector('#cart-count').textContent === '1'`,
      ),
      'one cart survives route navigation',
    )
    await evaluate('history.back()')
    await waitFor(
      `document.querySelector('main h1')?.textContent === 'Leather Tote Bag'`,
    )
    await evaluate('history.forward()')
    await waitFor(`document.querySelector('#register')`)
    assert(true, 'browser back and forward restore the routed pages')
    await navigate(
      '/cart',
      `document.querySelector('main')?.textContent.includes('Leather Tote Bag · Black')`,
    )
    assert(
      await evaluate(
        `document.querySelector('#cart-count').textContent === '1'`,
      ),
      'cart survives a full refresh',
    )
    await fill('main input[type="number"]', '2')
    await waitFor(`document.querySelector('#cart-count')?.textContent === '2'`)
    await fill('main input[type="number"]', '0')
    assert(
      await evaluate(
        `document.querySelector('main input[type="number"]').value === '2'`,
      ),
      'cart rejects invalid quantities and retains its subtotal',
    )
    await click('main a[href="/checkout"]')
    await waitFor(`document.querySelector('form[aria-label="Checkout"]')`)
    await click('form button[type="submit"]')
    await waitFor(`document.querySelector('#name-error')`)
    assert(
      await evaluate(
        `document.activeElement.id === 'name' && document.querySelector('#name').getAttribute('aria-describedby') === 'name-error'`,
      ),
      'checkout focuses and describes invalid fields',
    )
    for (const [id, value] of [
      ['name', 'Test Buyer'],
      ['email', 'test@example.com'],
      ['address', '123 Sample Street'],
      ['city', 'Istanbul'],
      ['postalCode', '34000'],
      ['country', 'Türkiye'],
    ])
      await fill(`#${id}`, value)
    for (const width of [375, 768, 1024, 1440]) {
      await send('Emulation.setDeviceMetricsOverride', {
        width,
        height: 900,
        deviceScaleFactor: 1,
        mobile: width < 600,
      })
      await pause(100)
      assert(
        await evaluate(
          `document.documentElement.scrollWidth <= innerWidth + 1`,
        ),
        `checkout has no horizontal overflow at ${width}px`,
      )
    }
    const screenshot = await send('Page.captureScreenshot', { format: 'png' })
    await writeFile(
      join(tmpdir(), 'shopboard-checkout.png'),
      Buffer.from(screenshot.data, 'base64'),
    )
    await click('form button[type="submit"]')
    await waitFor(
      `document.querySelector('main h1')?.textContent === 'Demo checkout complete'`,
    )
    assert(
      await evaluate(
        `!localStorage.getItem('shopboard-cart-v1').includes('Sample Street')`,
      ),
      'demo checkout never stores delivery information',
    )
    await navigate(
      '/products/missing',
      `document.querySelector('main h1')?.textContent === 'Product not found'`,
    )
    await navigate(
      '/missing',
      `document.querySelector('main h1')?.textContent.includes('404')`,
    )
    assert(
      await evaluate(`!!document.querySelector('nav')`),
      '404 keeps the shared layout',
    )
    const routeChecks = [
      [
        '/',
        `document.querySelector('#overview-value')?.textContent.includes('931')`,
      ],
      [
        '/products',
        `document.querySelectorAll('#catalog-grid article').length === 15`,
      ],
      [
        '/products/1',
        `document.querySelector('main h1')?.textContent === 'Leather Tote Bag'`,
      ],
      ['/collections', `document.querySelector('#collection-grid')`],
      ['/insights', `document.querySelector('#catalog-insights')`],
      ['/community', `document.querySelector('#register')`],
      [
        '/cart',
        `document.querySelector('main h1')?.textContent === 'Your shopping cart'`,
      ],
      ['/checkout', `document.querySelector('form[aria-label="Checkout"]')`],
    ]
    for (const [path, ready] of routeChecks) {
      await navigate(path, ready)
      for (const width of [375, 768, 1024, 1440]) {
        await send('Emulation.setDeviceMetricsOverride', {
          width,
          height: 900,
          deviceScaleFactor: 1,
          mobile: width < 600,
        })
        await pause(150)
        assert(
          await evaluate(
            `document.documentElement.scrollWidth <= innerWidth + 1`,
          ),
          `${path} has no overflow at ${width}px`,
        )
      }
    }
    await navigate(
      '/products?collection=slow-mornings',
      `document.querySelectorAll('#catalog-grid article').length === 3`,
    )
    await click('#names-only')
    await waitFor(
      `document.querySelector('#names-only').checked && document.querySelectorAll('#product-names li').length === 3`,
    )
    await evaluate(
      `document.querySelector('#product-sort').value = 'expensive'; document.querySelector('#product-sort').dispatchEvent(new Event('change', {bubbles:true}))`,
    )
    await click('#reset-filters')
    await waitFor(
      `location.pathname === '/products' && !location.search && document.querySelectorAll('#product-names li').length === 15`,
    )
    assert(
      await evaluate(
        `document.querySelector('#names-only').checked && document.querySelector('#product-sort').value === 'expensive'`,
      ),
      'clearing a collection preserves sort and names-only view',
    )
    await click('#names-only')
    await waitFor(
      `document.querySelectorAll('#catalog-grid article').length === 15`,
    )
    assert(true, 'collection deep link and clear use the native URL')
    await click('#names-only')
    await fill('#search-products', 'no-such-item')
    await waitFor(`!document.querySelector('#names-only')`)
    await click('#reset-filters')
    await waitFor(
      `document.querySelector('#names-only')?.checked && document.querySelectorAll('#product-names li').length === 15`,
    )
    assert(true, 'no-match recovery restores names-only controls and view')
    await click('#names-only')
    await click('#under-fifty')
    await waitFor(
      `document.querySelectorAll('#catalog-grid article').length === 8`,
    )
    assert(
      true,
      'strict under-$50 filter preserves all eight qualifying products',
    )
    await click('#reset-filters')
    await send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
    })
    assert(
      await evaluate(
        `getComputedStyle(document.querySelector('[data-theme]'), '::before').animationName === 'none'`,
      ),
      'reduced motion disables ambient animation',
    )
    // Replace the visible text only in this disposable browser to exercise wrapping.
    await evaluate(
      `document.querySelector('article h3 button').textContent = 'A very long product name '.repeat(12)`,
    )
    await send('Emulation.setDeviceMetricsOverride', {
      width: 375,
      height: 900,
      deviceScaleFactor: 1,
      mobile: true,
    })
    assert(
      await evaluate(`document.documentElement.scrollWidth <= innerWidth + 1`),
      'long product names wrap at 375px',
    )
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 1000,
      deviceScaleFactor: 1,
      mobile: false,
    })
    const productShot = await send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: true,
    })
    await writeFile(
      join(tmpdir(), 'shopboard-next-products.png'),
      Buffer.from(productShot.data, 'base64'),
    )
    await send('Fetch.enable', {
      patterns: [
        {
          urlPattern: '*/images/products/1-black.jpg',
          requestStage: 'Request',
        },
      ],
    })
    intercept = true
    await navigate(
      '/products/1',
      `document.querySelector('main h1')?.textContent === 'Leather Tote Bag'`,
    )
    await click('input[aria-label="Black for Leather Tote Bag"]')
    await waitFor(
      `document.querySelector('main img')?.getAttribute('src').includes('1-black') || document.querySelector('main').textContent.includes('Photo unavailable')`,
    )
    while (!held.length) await pause(50)
    await send('Fetch.fulfillRequest', {
      requestId: held.shift(),
      responseCode: 404,
      body: '',
    })
    await waitFor(
      `document.querySelector('main').textContent.includes('Photo unavailable')`,
    )
    intercept = false
    await send('Fetch.disable')
    await click('input[aria-label="Brown for Leather Tote Bag"]')
    await waitFor(
      `document.querySelector('main img')?.getAttribute('src').includes('1-brown')`,
    )
    assert(
      true,
      'missing image falls back accessibly and recovers on another color',
    )
    await verifyDesign(routeChecks)
    assert(
      errors.length === 0,
      `no runtime/React/hydration errors: ${errors.join('; ')}`,
    )
    console.log('Screenshot: ' + join(tmpdir(), 'shopboard-checkout.png'))
  }
  assert(warnings.length === 0, `no Console warnings: ${warnings.join('; ')}`)
} finally {
  intercept = false
  for (const requestId of held)
    await send('Fetch.continueRequest', { requestId }).catch(() => {})
  await send('Fetch.disable').catch(() => {})
  await evaluate(
    saved === null
      ? `localStorage.removeItem('shopboard-cart-v1')`
      : `localStorage.setItem('shopboard-cart-v1',${JSON.stringify(saved)})`,
  ).catch(() => {})
  ws.close()
  await browser.close()
}

async function verifyApiState(state) {
  await evaluate(`localStorage.setItem('shopboard-cart-v1', '{"1::Brown":2}')`)
  const started = Date.now()
  if (state === 'delay') {
    await navigate(
      '/',
      `document.querySelector('#hero') && document.querySelector('main [role="status"]')`,
    )
    assert(
      await evaluate(`!!document.querySelector('nav')`),
      'real 3000ms API delay leaves the shell and hero usable',
    )
    await waitFor(
      `document.querySelector('#overview-value')?.textContent.includes('931')`,
    )
    assert(
      Date.now() - started >= 2800,
      'loading fallback remains until the delayed API responds',
    )
    await waitFor(`document.querySelector('#cart-count')?.textContent === '2'`)
  } else if (state === 'fail') {
    await navigate('/', `document.querySelector('[role="alert"]')`)
    assert(
      await evaluate(
        `!!document.querySelector('#hero') && !!document.querySelector('nav')`,
      ),
      'HTTP 500 isolates the failed section',
    )
    const beforeRetry = catalogRequests
    await click('[role="alert"] button')
    for (
      let attempt = 0;
      attempt < 100 && catalogRequests <= beforeRetry;
      attempt++
    )
      await pause(50)
    assert(
      catalogRequests > beforeRetry,
      'Try again refreshes the failing server catalog',
    )
    await waitFor(`document.querySelector('[role="alert"]')`)
  } else if (state === 'empty') {
    await navigate(
      '/products',
      `document.querySelector('main')?.textContent.includes('No products yet')`,
    )
    assert(
      await evaluate(
        `document.querySelectorAll('#catalog-grid article').length === 0 && !document.querySelector('main').textContent.includes('No products match')`,
      ),
      'empty API has distinct empty-catalog feedback',
    )
  } else throw Error(`Unknown API_STATE: ${state}`)
  assert(
    await evaluate(
      `localStorage.getItem('shopboard-cart-v1') === '{"1::Brown":2}'`,
    ),
    'test base URL preserves the saved cart',
  )
  await click('nav a[href="/community"]')
  await waitFor(`document.querySelector('#register')`)
  assert(true, 'community remains usable in this API state')
  const unexpected = errors
  assert(
    unexpected.length === 0,
    `no unexpected runtime errors in ${state}: ${unexpected.join('; ')}`,
  )
}

function contrastRatio(a, b) {
  function luminance(color) {
    const channels = color
      .match(/[0-9.]+/g)
      .slice(0, 3)
      .map(Number)
      .map((value) => {
        const v = value / 255
        return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
      })
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
  }
  const first = luminance(a),
    second = luminance(b)
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05)
}
async function verifyDesign(routeChecks) {
  const cart = await evaluate("localStorage.getItem('shopboard-cart-v1')")
  await click('button[aria-label="Switch to dark mode"]')
  await waitFor(
    "document.querySelector('[data-theme]')?.dataset.theme === 'dark'",
  )
  assert(
    await evaluate("document.cookie.includes('shopboard-theme=dark')"),
    'dark preference is saved',
  )
  await click('button[aria-label="Workspace notifications"]')
  await waitFor("document.querySelector('dialog')?.open")
  assert(
    await evaluate("Boolean(document.activeElement.closest('dialog'))"),
    'modal receives keyboard focus',
  )
  for (let index = 0; index < 6; index++) {
    await send('Input.dispatchKeyEvent', {
      type: 'keyDown',
      key: 'Tab',
      code: 'Tab',
      windowsVirtualKeyCode: 9,
      nativeVirtualKeyCode: 48,
    })
    await send('Input.dispatchKeyEvent', {
      type: 'keyUp',
      key: 'Tab',
      code: 'Tab',
      windowsVirtualKeyCode: 9,
      nativeVirtualKeyCode: 48,
    })
  }
  assert(
    await evaluate("Boolean(document.activeElement.closest('dialog'))"),
    'modal traps keyboard focus',
  )
  const before = await evaluate('location.href')
  await send('Input.dispatchKeyEvent', {
    type: 'keyDown',
    key: '/',
    code: 'Slash',
    text: '/',
    windowsVirtualKeyCode: 191,
  })
  await send('Input.dispatchKeyEvent', {
    type: 'keyUp',
    key: '/',
    code: 'Slash',
    windowsVirtualKeyCode: 191,
  })
  await pause(100)
  assert(
    (await evaluate('location.href')) === before,
    'modal blocks background search shortcuts',
  )
  await send('Input.dispatchKeyEvent', {
    type: 'keyDown',
    key: 'Escape',
    code: 'Escape',
    windowsVirtualKeyCode: 27,
    nativeVirtualKeyCode: 53,
  })
  await send('Input.dispatchKeyEvent', {
    type: 'keyUp',
    key: 'Escape',
    code: 'Escape',
    windowsVirtualKeyCode: 27,
    nativeVirtualKeyCode: 53,
  })
  await waitFor("!document.querySelector('dialog')?.open")
  assert(
    await evaluate(
      "document.activeElement.getAttribute('aria-label') === 'Workspace notifications'",
    ),
    'closing the modal restores trigger focus',
  )
  const html = await (
    await fetch(new URL('/', appUrl), {
      headers: { Cookie: 'shopboard-theme=dark' },
    })
  ).text()
  assert(
    html.includes('data-theme="dark"'),
    'server HTML respects a saved dark preference',
  )
  for (const [path, ready] of routeChecks) {
    await navigate(path, ready)
    assert(
      await evaluate(
        "document.querySelector('[data-theme]').dataset.theme === 'dark'",
      ),
      'dark mode survives direct navigation to ' + path,
    )
    for (const width of [320, 375, 768, 1024, 1440]) {
      await send('Emulation.setDeviceMetricsOverride', {
        width,
        height: 1000,
        deviceScaleFactor: 1,
        mobile: width < 600,
      })
      await pause(100)
      assert(
        await evaluate(
          'document.documentElement.scrollWidth <= innerWidth + 1',
        ),
        'dark ' + path + ' has no overflow at ' + width + 'px',
      )
      if (
        (width === 375 || width === 1440) &&
        ['/', '/products', '/community', '/checkout'].includes(path)
      ) {
        const shot = await send('Page.captureScreenshot', { format: 'png' })
        await writeFile(
          join(
            tmpdir(),
            'shopboard-dark-' +
              (path === '/' ? 'overview' : path.slice(1)) +
              '-' +
              width +
              '.png',
          ),
          Buffer.from(shot.data, 'base64'),
        )
      }
    }
  }
  await navigate(
    '/',
    "document.querySelector('#overview-value')?.textContent.includes('931')",
  )
  const colors = await evaluate(
    "({ ink: getComputedStyle(document.body).color, background: getComputedStyle(document.body).backgroundColor, subtle: getComputedStyle(document.querySelector('#hero p:last-child')).color })",
  )
  assert(
    contrastRatio(colors.ink, colors.background) >= 7,
    'dark body text has strong contrast',
  )
  assert(
    contrastRatio(colors.subtle, colors.background) >= 4.5,
    'dark secondary text meets normal-text contrast',
  )
  assert(
    (await evaluate("localStorage.getItem('shopboard-cart-v1')")) === cart,
    'theme changes preserve the cart',
  )
  await click('button[aria-label="Switch to light mode"]')
  await waitFor(
    "document.querySelector('[data-theme]').dataset.theme === 'light'",
  )
  await send('Page.reload')
  await waitFor(
    "document.querySelector('[data-theme]')?.dataset.theme === 'light' && !document.querySelector('#open-cart')?.disabled",
  )
  assert(true, 'light preference survives reload without hydration errors')
}
