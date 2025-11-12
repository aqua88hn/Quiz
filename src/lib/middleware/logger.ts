import type { NextRequest } from "next/server"
import type { LogEntry } from "./types"

type LogLevel = "debug" | "info" | "warn" | "error"

const LOG_LEVEL_MAP = { debug: 0, info: 1, warn: 2, error: 3 }

class Logger {
  private logLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || "info"
  private redactFields = (process.env.LOG_REDACT_FIELDS || "password,token,authorization,credit_card").split(",")

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_MAP[level] >= LOG_LEVEL_MAP[this.logLevel]
  }

  private redact(obj: any): any {
    if (!obj) return obj
    if (typeof obj !== "object") return obj

    const redacted = Array.isArray(obj) ? [...obj] : { ...obj }
    for (const key in redacted) {
      if (this.redactFields.some((field) => key.toLowerCase().includes(field.toLowerCase()))) {
        redacted[key] = "[REDACTED]"
      } else if (typeof redacted[key] === "object") {
        redacted[key] = this.redact(redacted[key])
      }
    }
    return redacted
  }

  private formatLog(entry: LogEntry): string {
    return JSON.stringify(entry)
  }

  log(level: LogLevel, event: string, data: Record<string, any> = {}, requestId = "system"): void {
    if (!this.shouldLog(level)) return

    const entry: LogEntry = {
      ts: new Date().toISOString(),
      level,
      event,
      requestId,
      ...this.redact(data),
    }

    const formatted = this.formatLog(entry)
    const consoleMethod = level === "error" ? console.error : level === "warn" ? console.warn : console.log
    consoleMethod(formatted)
  }

  debug(event: string, data?: Record<string, any>, requestId?: string): void {
    this.log("debug", event, data, requestId)
  }

  info(event: string, data?: Record<string, any>, requestId?: string): void {
    this.log("info", event, data, requestId)
  }

  warn(event: string, data?: Record<string, any>, requestId?: string): void {
    this.log("warn", event, data, requestId)
  }

  error(event: string, data?: Record<string, any>, requestId?: string): void {
    this.log("error", event, data, requestId)
  }
}

export const logger = new Logger()

export function getClientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0].trim() || request.headers.get("x-real-ip") || "unknown"
}

export function generateRequestId(existingId?: string): string {
  if (existingId) return existingId
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
