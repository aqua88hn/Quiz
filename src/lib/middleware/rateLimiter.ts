import type { NextRequest } from "next/server"
import { RateLimitError } from "./types"
import { getClientIp } from "./logger"

interface RateLimitConfig {
  windowMs?: number
  maxRequests?: number
}

interface RateLimitEntry {
  count: number
  windowStart: number
}

const defaultConfig: RateLimitConfig = {
  windowMs: 60000, // 1 minute
  maxRequests: 100,
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>()
  private config: Required<RateLimitConfig>

  constructor(config?: RateLimitConfig) {
    this.config = { ...defaultConfig, ...config }
    // Cleanup old entries every minute
    setInterval(() => this.cleanup(), 60000)
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (now - entry.windowStart > this.config.windowMs * 2) {
        this.store.delete(key)
      }
    }
  }

  check(request: NextRequest): void {
    const ip = getClientIp(request)
    const now = Date.now()
    let entry = this.store.get(ip)

    if (!entry || now - entry.windowStart > this.config.windowMs) {
      entry = { count: 1, windowStart: now }
      this.store.set(ip, entry)
    } else {
      entry.count++
    }

    if (entry.count > this.config.maxRequests) {
      const resetTime = Math.ceil((entry.windowStart + this.config.windowMs - now) / 1000)
      throw new RateLimitError(resetTime)
    }
  }
}

export const defaultRateLimiter = new RateLimiter()

export function createRateLimiter(config?: RateLimitConfig): RateLimiter {
  return new RateLimiter(config)
}
