import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { freePort, pause } from './browser-session.mjs'
const project = new URL('..', import.meta.url)
function run(command, args, env = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: project,
      env: { ...process.env, ...env },
      stdio: 'inherit',
    })
    child.on('error', reject)
    child.on('exit', (code) =>
      code === 0 ? resolve() : reject(Error(`${command} exited ${code}`)),
    )
  })
}
const testEnv = { SHOPBOARD_TEST_MODE: '1', SHOPBOARD_CATALOG_MODE: 'normal' }
await run('npm', ['run', 'build'], testEnv)
for (const mode of ['delay', 'fail', 'empty']) {
  const port = await freePort()
  const server = spawn(
    process.execPath,
    ['node_modules/next/dist/bin/next', 'start', '-p', String(port)],
    {
      cwd: project,
      env: { ...process.env, ...testEnv, SHOPBOARD_CATALOG_MODE: mode },
      stdio: 'inherit',
    },
  )
  try {
    let ready = false
    for (let attempt = 0; attempt < 100; attempt++) {
      if (server.exitCode !== null)
        throw Error(
          `Test server exited ${server.exitCode} before becoming ready`,
        )
      try {
        if ((await fetch(`http://127.0.0.1:${port}/community`)).ok) {
          ready = true
          break
        }
      } catch {
        /* Wait for server readiness. */
      }
      await pause(100)
    }
    if (!ready) throw Error('Test server did not start')
    const response = await fetch(`http://127.0.0.1:${port}/api/products.json`)
    if (mode === 'fail' && response.status !== 500)
      throw Error('Failure mode did not return HTTP 500')
    if (mode === 'empty' && JSON.stringify(await response.json()) !== '[]')
      throw Error('Empty mode did not return an empty array')
    await run(process.execPath, ['scripts/verify-browser.mjs'], {
      APP_URL: `http://127.0.0.1:${port}/`,
      API_STATE: mode,
    })
  } finally {
    if (server.exitCode === null && server.signalCode === null) {
      const exited = once(server, 'exit')
      server.kill('SIGTERM')
      await exited
    }
  }
}
