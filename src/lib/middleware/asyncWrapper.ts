import type { NextRequest, NextResponse } from "next/server"
import { type RequestContext, HTTPError } from "./types"
import { attachRequestContext, logRequestStart, logRequestEnd, logRequestError } from "./requestLogger"
import { handleError } from "./errorHandler"

export type RouteHandler = (request: NextRequest, context: RequestContext) => Promise<NextResponse>

export function asyncWrapper(handler: RouteHandler) {
  return async (request: NextRequest) => {
    const ctx = attachRequestContext(request)
    logRequestStart(ctx, request)

    try {
      const response = await handler(request, ctx)
      const contentLength = response.headers.get("content-length") || "0"
      logRequestEnd(ctx, response.status, Number.parseInt(contentLength))
      response.headers.set("X-Request-ID", ctx.requestId)
      return response
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      const status = error instanceof HTTPError ? error.status : 500
      logRequestError(ctx, err, status)
      return handleError(err, ctx.requestId)
    }
  }
}
