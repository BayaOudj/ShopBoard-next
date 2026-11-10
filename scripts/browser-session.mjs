import { spawn } from 'node:child_process'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createServer } from 'node:net'
import { randomInt } from 'node:crypto'
export const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
export async function freePort() {
  // Stay below macOS's ephemeral client-port range and reserve both IP families,
  // matching Next's listener. This avoids readiness polls consuming the new port.
  for (let attempt = 0; attempt < 30; attempt++) {
    const port = randomInt(38000, 48000)
    const server = createServer()
    try {
      await new Promise((resolve, reject) => {
        server.once('error', reject)
        server.listen(port, resolve)
      })
      await new Promise((resolve) => server.close(resolve))
      return port
    } catch (error) {
      if (error.code !== 'EADDRINUSE') throw error
    }
  }
  throw Error('Could not allocate an isolated test port')
}
export async function startBrowser() {
  const port = await freePort()
  const profile = await mkdtemp(join(tmpdir(), 'shopboard-next-browser-'))
  const executable =
    process.env.CHROME_PATH ??
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  const processHandle = spawn(
    executable,
    [
      '--headless=new',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profile}`,
      '--no-first-run',
      '--no-default-browser-check',
      'about:blank',
    ],
    { stdio: 'ignore' },
  )
  let failure
  processHandle.on('error', (error) => {
    failure = error
  })
  const debugUrl = `http://127.0.0.1:${port}`
  async function close() {
    if (processHandle.exitCode === null) {
      const exited = new Promise((resolve) =>
        processHandle.once('exit', resolve),
      )
      processHandle.kill('SIGTERM')
      await Promise.race([exited, pause(3000)])
    }
    await rm(profile, { recursive: true, force: true, maxRetries: 3 }).catch(
      () => {},
    )
  }
  for (let attempt = 0; attempt < 100; attempt++) {
    if (failure) {
      await close()
      throw failure
    }
    try {
      if ((await fetch(`${debugUrl}/json/version`)).ok)
        return { debugUrl, close }
    } catch {
      /* Wait for the isolated browser to start. */
    }
    await pause(100)
  }
  await close()
  throw Error('Isolated Chrome did not start')
}
