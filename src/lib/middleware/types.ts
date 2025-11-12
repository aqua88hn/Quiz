export interface RequestContext {
  requestId: string
  userId?: string
  adminId?: string
  ip: string
  userAgent: string
  startTime: number
}

export class HTTPError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: Record<string, any>,
  ) {
    super(message)
    this.name = "HTTPError"
  }
}

export class ValidationError extends HTTPError {
  constructor(message: string, details?: any) {
    super(400, "VALIDATION_ERROR", message, details)
    this.name = "ValidationError"
  }
}

export class AuthError extends HTTPError {
  constructor(message = "Unauthorized") {
    super(401, "AUTH_ERROR", message)
    this.name = "AuthError"
  }
}

export class ForbiddenError extends HTTPError {
  constructor(message = "Forbidden") {
    super(403, "FORBIDDEN_ERROR", message)
    this.name = "ForbiddenError"
  }
}

export class NotFoundError extends HTTPError {
  constructor(message = "Not Found") {
    super(404, "NOT_FOUND_ERROR", message)
    this.name = "NotFoundError"
  }
}

export class RateLimitError extends HTTPError {
  constructor(retryAfter: number) {
    super(429, "RATE_LIMIT_ERROR", "Too Many Requests", { retryAfter })
    this.name = "RateLimitError"
  }
}

export class ExternalServiceError extends HTTPError {
  constructor(message = "Bad Gateway") {
    super(502, "EXTERNAL_SERVICE_ERROR", message)
    this.name = "ExternalServiceError"
  }
}

export interface ErrorResponse {
  requestId: string
  status: number
  error: string
  message: string
  details?: Record<string, any>
  trace?: string
}

export interface LogEntry {
  ts: string
  level: "debug" | "info" | "warn" | "error"
  event: string
  requestId: string
  [key: string]: any
}
