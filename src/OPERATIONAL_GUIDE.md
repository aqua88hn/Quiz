# QuizMate - Operational Guide

## Logging & Observability

### Request IDs (Correlation IDs)
Every request gets a unique `X-Request-ID` header:
- If client sends `X-Request-ID` header, it's reused
- Otherwise, a new UUID v4 is generated
- Returned in response headers for tracing

### Log Format
All logs are JSON structured:
```json
{
  "ts": "2025-11-11T10:00:00.000Z",
  "level": "info",
  "event": "request:end",
  "requestId": "uuid-v4",
  "method": "POST",
  "path": "/api/v1/quizzes/1/submit",
  "status": 200,
  "durationMs": 123
}
```

### Log Levels
Set via `LOG_LEVEL` env var: `debug`, `info` (default), `warn`, `error`

### Sensitive Data
Automatic redaction of:
- `password`, `token`, `authorization`, `credit_card`

Customize with `LOG_REDACT_FIELDS=field1,field2,...`

## Error Handling

### Error Response Format
```json
{
  "requestId": "req-123",
  "status": 400,
  "error": "VALIDATION_ERROR",
  "message": "Invalid email format",
  "details": { "field": "email" }
}
```

### HTTP Status Mapping
- 400: Validation or Bad Request errors
- 401: Authentication required
- 403: Forbidden / insufficient permissions
- 404: Resource not found
- 429: Rate limit exceeded
- 500: Internal server errors
- 502: External service unavailable

## Rate Limiting

### Default Limits
- Window: 60 seconds
- Max requests: 100 per IP

### Response Headers
When rate limited:
- `Retry-After: <seconds>` header is included

## Metrics

### Endpoints
- `GET /api/health` - Health status + uptime
- `GET /api/metrics` - Prometheus-style counters

### Metrics Available
```json
{
  "requests_total": 1234,
  "requests_errors_total": 12,
  "avg_request_duration_ms": 134.5,
  "routes": {
    "/api/v1/quizzes": {
      "count": 100,
      "errors": 1,
      "avgMs": 50
    }
  }
}
```

## Sentry Integration

Set `SENTRY_DSN` env var to enable:
```bash
SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
```

All 5xx errors are automatically reported with:
- Request ID in tags
- User info if authenticated
- Full error context

## Audit Logging

Admin CRUD operations are logged:
```json
{
  "ts": "2025-11-11T10:00:00.000Z",
  "level": "info",
  "event": "admin:audit",
  "requestId": "req-123",
  "adminId": "admin-1",
  "action": "CREATE",
  "resourceType": "quiz",
  "resourceId": "quiz-5",
  "outcome": "SUCCESS"
}
```

## Production Deployment

### Environment Variables
```bash
NODE_ENV=production
LOG_LEVEL=info
LOG_REDACT_FIELDS=password,token,authorization
SENTRY_DSN=https://your-sentry-key@...
JWT_SECRET=your-secret-key
ADMIN_PASSWORD=secure-password
```

### Security
- Ensure `NODE_ENV=production` to hide stack traces
- Rotate `JWT_SECRET` and `ADMIN_PASSWORD` regularly
- Monitor `/api/metrics` for anomalies
- Set up alerts for error spikes (requests_errors_total)

### Monitoring
1. **Health Checks**: Poll `/api/health` every 30s
2. **Error Rate**: Alert if `requests_errors_total / requests_total > 5%`
3. **Latency**: Alert if `avg_request_duration_ms > 1000ms`
4. **Rate Limit**: Monitor for spike in 429 responses

## Graceful Shutdown

The server handles SIGINT/SIGTERM:
1. Stops accepting new requests
2. Waits up to 10s for in-flight requests
3. Flushes logs
4. Exits cleanly

## External Service Calls

Use the wrapped HTTP client with retry + backoff:
```typescript
import { httpClient } from '@/lib/httpClient';

const response = await httpClient.get('https://api.example.com/data', {
  retries: 3,
  backoffMs: 100,
});
```