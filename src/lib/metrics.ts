export interface Metrics {
  requests_total: number
  requests_errors_total: number
  avg_request_duration_ms: number
  routes: Record<string, RouteMetrics>
}

export interface RouteMetrics {
  count: number
  errors: number
  avgMs: number
  totalMs: number
}

class MetricsCollector {
  private metrics: Metrics = {
    requests_total: 0,
    requests_errors_total: 0,
    avg_request_duration_ms: 0,
    routes: {},
  }

  recordRequest(path: string, durationMs: number, isError: boolean): void {
    this.metrics.requests_total++
    if (isError) {
      this.metrics.requests_errors_total++
    }

    if (!this.metrics.routes[path]) {
      this.metrics.routes[path] = { count: 0, errors: 0, avgMs: 0, totalMs: 0 }
    }

    const route = this.metrics.routes[path]
    route.count++
    if (isError) route.errors++
    route.totalMs += durationMs
    route.avgMs = Math.round(route.totalMs / route.count)

    // Calculate overall average
    let totalMs = 0
    let totalCount = 0
    for (const r of Object.values(this.metrics.routes)) {
      totalMs += r.totalMs
      totalCount += r.count
    }
    this.metrics.avg_request_duration_ms = totalCount > 0 ? Math.round(totalMs / totalCount) : 0
  }

  getMetrics(): Metrics {
    return { ...this.metrics }
  }

  reset(): void {
    this.metrics = {
      requests_total: 0,
      requests_errors_total: 0,
      avg_request_duration_ms: 0,
      routes: {},
    }
  }
}

export const metricsCollector = new MetricsCollector()
