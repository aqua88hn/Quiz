export interface HttpClientOptions {
  /** number of retry attempts (default 3) */
  retries?: number
  /** base backoff in ms (exponential base) (default 100) */
  backoffMs?: number
  /** request timeout in ms (default 5000) */
  timeoutMs?: number
  /** max jitter in ms to add randomization to backoff (default 100) */
  jitterMs?: number
  /** status codes that should be retried (default [500,502,503,504]) */
  retryOnStatus?: number[]
  /** external signal to allow cancellation from caller */
  signal?: AbortSignal
}

const defaultOptions: Required<Pick<HttpClientOptions, 'retries' | 'backoffMs' | 'timeoutMs' | 'jitterMs' | 'retryOnStatus'>> = {
  retries: 3,
  backoffMs: 100,
  timeoutMs: 5000,
  jitterMs: 100,
  retryOnStatus: [500, 502, 503, 504],
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
export class HttpError extends Error {
  status: number
  body: any | null
  response?: Response

  constructor(message: string, status: number, body: any | null = null, response?: Response) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.body = body
    this.response = response
  }
}

function shouldRetryStatus(status: number, retryOn: number[]): boolean {
  // Don't retry client errors (4xx)
  if (status >= 400 && status < 500) return false
  return retryOn.includes(status)
}

function createControlledSignal(externalSignal: AbortSignal | undefined, timeoutMs: number) {
  const controller = new AbortController()
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  const onExternalAbort = () => controller.abort()

  if (externalSignal) {
    if (externalSignal.aborted) controller.abort()
    else externalSignal.addEventListener('abort', onExternalAbort)
  }

  timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  const cleanup = () => {
    if (timeoutId) clearTimeout(timeoutId)
    if (externalSignal) externalSignal.removeEventListener('abort', onExternalAbort)
  }

  return { signal: controller.signal, cleanup }
}

async function parseBody(response: Response) {
  const contentType = response.headers.get('content-type') || ''
  try {
    if (contentType.includes('application/json')) {
      return await response.json()
    }
    return await response.text()
  } catch {
    return null
  }
}

/**
 * Generic HTTP request with retry, jitter, timeout and external cancellation support.
 * - init: standard fetch RequestInit (headers, method, body, credentials, etc.)
 * - options: http client options (retries, backoff, timeout, jitter, retryOnStatus, signal)
 */
export async function httpClientRequest(url: string, init?: RequestInit, options?: HttpClientOptions): Promise<Response> {
  const config = { ...defaultOptions, ...(options || {}) } as Required<typeof defaultOptions> & HttpClientOptions

  for (let attempt = 0; attempt <= config.retries; attempt++) {
    const { signal, cleanup } = createControlledSignal(options?.signal, config.timeoutMs)
    try {
      const response = await fetch(url, { ...init, signal })

      if (response.ok) {
        cleanup()
        return response
      }

      // non-ok response
      const body = await parseBody(response)
      const status = response.status

      // If status should be retried and we have remaining attempts, wait and retry
      if (attempt < config.retries && shouldRetryStatus(status, config.retryOnStatus)) {
        cleanup()
        const baseBackoff = config.backoffMs * Math.pow(2, attempt)
        const jitter = Math.floor(Math.random() * config.jitterMs)
        await sleep(baseBackoff + jitter)
        continue
      }

      // Otherwise throw HttpError (do not retry for client errors)
      cleanup()
      throw new HttpError(`HTTP Error: ${status}`, status, body, response)
    } catch (err: any) {
      cleanup()
      // If aborted, rethrow immediately (no retry)
      if (err && err.name === 'AbortError') throw err

      // Network or other error: retry if attempts remain
      if (attempt < config.retries) {
        const baseBackoff = config.backoffMs * Math.pow(2, attempt)
        const jitter = Math.floor(Math.random() * config.jitterMs)
        await sleep(baseBackoff + jitter)
        continue
      }

      // last attempt - rethrow
      throw err
    }
  }

  throw new Error('Max retries exceeded')
}

/** Convenience GET using httpClientRequest (preserves backward-compatible name) */
export async function httpClientGet(url: string, init?: RequestInit, options?: HttpClientOptions): Promise<Response> {
  return httpClientRequest(url, { ...init, method: 'GET' }, options)
}

/** Helper to GET and parse JSON. Throws HttpError for non-ok responses. */
export async function httpClientGetJson<T = any>(url: string, init?: RequestInit, options?: HttpClientOptions): Promise<T> {
  const res = await httpClientGet(url, init, options)
  // If response is not ok, httpClientGet would have thrown. Parse JSON or throw if parse fails
  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    return res.json() as Promise<T>
  }
  // fallback: try json parse then text
  try {
    return (await res.json()) as T
  } catch {
    const text = await res.text()
    throw new Error(`Expected JSON response but got: ${text.slice(0, 200)}`)
  }
}

export const httpClient = { get: httpClientGet, request: httpClientRequest, getJson: httpClientGetJson }

