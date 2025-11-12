import { logger } from "@/lib/middleware/logger"
import { ValidationError, AuthError, NotFoundError } from "@/lib/middleware/types"
import { metricsCollector } from "@/lib/metrics"
import jest from "jest"

describe("Middleware", () => {
  describe("Error Handler", () => {
    it("should handle ValidationError with 400 status", () => {
      const error = new ValidationError("Invalid input", { field: "email" })
      expect(error.status).toBe(400)
      expect(error.code).toBe("VALIDATION_ERROR")
    })

    it("should handle AuthError with 401 status", () => {
      const error = new AuthError("Invalid credentials")
      expect(error.status).toBe(401)
      expect(error.code).toBe("AUTH_ERROR")
    })

    it("should handle NotFoundError with 404 status", () => {
      const error = new NotFoundError("Quiz not found")
      expect(error.status).toBe(404)
      expect(error.code).toBe("NOT_FOUND_ERROR")
    })
  })

  describe("Logger", () => {
    it("should log messages with requestId", () => {
      const consoleSpy = jest.spyOn(console, "log")
      logger.info("test:event", { key: "value" }, "req-123")
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it("should redact sensitive fields", () => {
      const consoleSpy = jest.spyOn(console, "log")
      logger.info("test:event", { password: "secret", email: "user@test.com" }, "req-123")
      const output = consoleSpy.mock.calls[0][0]
      expect(output).toContain("[REDACTED]")
      consoleSpy.mockRestore()
    })
  })

  describe("Metrics", () => {
    beforeEach(() => {
      metricsCollector.reset()
    })

    it("should track successful requests", () => {
      metricsCollector.recordRequest("/api/test", 100, false)
      metricsCollector.recordRequest("/api/test", 150, false)

      const metrics = metricsCollector.getMetrics()
      expect(metrics.requests_total).toBe(2)
      expect(metrics.requests_errors_total).toBe(0)
      expect(metrics.routes["/api/test"].count).toBe(2)
      expect(metrics.routes["/api/test"].avgMs).toBe(125)
    })

    it("should track errors", () => {
      metricsCollector.recordRequest("/api/test", 50, true)
      metricsCollector.recordRequest("/api/test", 75, false)

      const metrics = metricsCollector.getMetrics()
      expect(metrics.requests_total).toBe(2)
      expect(metrics.requests_errors_total).toBe(1)
      expect(metrics.routes["/api/test"].errors).toBe(1)
    })
  })
})
