export interface HttpClientOptions {
  retries?: number
  backoffMs?: number
  timeoutMs?: number
}

const defaultOptions: Required<HttpClientOptions> = {
  retries: 3,
  backoffMs: 100,
  timeoutMs: 5000,
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function httpClientGet(url: string, options?: HttpClientOptions): Promise<Response> {
  const config = { ...defaultOptions, ...options }

  for (let attempt = 0; attempt <= config.retries; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs)

      const response = await fetch(url, { signal: controller.signal })
      clearTimeout(timeoutId)

      if (response.ok || attempt === config.retries) {
        return response
      }

      if (attempt < config.retries) {
        const backoff = config.backoffMs * Math.pow(2, attempt)
        await sleep(backoff)
      }
    } catch (error) {
      if (attempt === config.retries) throw error
      const backoff = config.backoffMs * Math.pow(2, attempt)
      await sleep(backoff)
    }
  }

  throw new Error("Max retries exceeded")
}

export const httpClient = { get: httpClientGet }
