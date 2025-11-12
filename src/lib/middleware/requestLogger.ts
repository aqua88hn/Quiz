import type { NextRequest } from "next/server"
import { logger, getClientIp, generateRequestId } from "./logger"
import type { RequestContext } from "./types"

export function attachRequestContext(request: NextRequest): RequestContext {
  const requestId = generateRequestId(request.headers.get("x-request-id") || undefined)
  const ip = getClientIp(request)
  const userAgent = request.headers.get("user-agent") || "unknown"

  const ctx: RequestContext = {
    requestId,
    ip,
    userAgent,
    startTime: performance.now(),
  }

  return ctx
}

export function logRequestStart(ctx: RequestContext, request: NextRequest): void {
  logger.info(
    "request:start",
    {
      method: request.method,
      path: request.nextUrl.pathname,
      query: Object.fromEntries(request.nextUrl.searchParams),
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    },
    ctx.requestId,
  )
}

export function logRequestEnd(ctx: RequestContext, status: number, responseSize: number): void {
  const durationMs = performance.now() - ctx.startTime
  logger.info(
    "request:end",
    {
      method: ctx.requestId,
      status,
      durationMs: Math.round(durationMs),
      responseSize,
      userId: ctx.userId,
    },
    ctx.requestId,
  )
}

export function logRequestError(ctx: RequestContext, error: Error, status: number): void {
  const durationMs = performance.now() - ctx.startTime
  logger.error(
    "request:error",
    {
      status,
      errorMessage: error.message,
      errorType: error.constructor.name,
      durationMs: Math.round(durationMs),
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    },
    ctx.requestId,
  )
}

export function logAuditAction(
  requestId: string,
  adminId: string,
  action: "CREATE" | "UPDATE" | "DELETE",
  resourceType: string,
  resourceId: string,
  outcome: "SUCCESS" | "FAILED",
): void {
  logger.info(
    "admin:audit",
    {
      adminId,
      action,
      resourceType,
      resourceId,
      outcome,
    },
    requestId,
  )
}
