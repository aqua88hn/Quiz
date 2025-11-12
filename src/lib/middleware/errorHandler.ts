import type { NextResponse } from "next/server"
import { NextResponse as NR } from "next/server"
import {
  HTTPError,
  ValidationError,
  AuthError,
  ForbiddenError,
  NotFoundError,
  RateLimitError,
  ExternalServiceError,
  type ErrorResponse,
} from "./types"
import { logger } from "./logger"

export function handleError(error: Error, requestId: string): NextResponse {
  let status = 500
  let code = "INTERNAL_SERVER_ERROR"
  let message = "Internal Server Error"
  let details: Record<string, any> | undefined

  if (error instanceof ValidationError) {
    status = 400
    code = "VALIDATION_ERROR"
    message = error.message
    details = error.details
  } else if (error instanceof AuthError) {
    status = 401
    code = "AUTH_ERROR"
    message = error.message
  } else if (error instanceof ForbiddenError) {
    status = 403
    code = "FORBIDDEN_ERROR"
    message = error.message
  } else if (error instanceof NotFoundError) {
    status = 404
    code = "NOT_FOUND_ERROR"
    message = error.message
  } else if (error instanceof RateLimitError) {
    status = 429
    code = "RATE_LIMIT_ERROR"
    message = error.message
  } else if (error instanceof ExternalServiceError) {
    status = 502
    code = "EXTERNAL_SERVICE_ERROR"
    message = error.message
  } else if (error instanceof HTTPError) {
    status = error.status
    code = error.code
    message = error.message
    details = error.details
  }

  // Log the error
  logger.error(
    "error:handled",
    {
      status,
      code,
      message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    },
    requestId,
  )

  // Build response
  const response: ErrorResponse = {
    requestId,
    status,
    error: code,
    message,
  }

  if (details) {
    response.details = details
  }

  if (process.env.NODE_ENV === "development" && error.stack) {
    response.trace = error.stack
  }

  const res = NR.json(response, { status })
  res.headers.set("X-Request-ID", requestId)

  if (error instanceof RateLimitError && error.details?.retryAfter) {
    res.headers.set("Retry-After", String(error.details.retryAfter))
  }

  return res
}
