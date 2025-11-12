# Logging Setup Guide

## Environment Variables

Create `.env.local`:
```env
LOG_LEVEL=debug
LOG_REDACT_FIELDS=password,token,authorization,credit_card
SENTRY_DSN=
```

## Log Levels

1. **debug** - Detailed info for development (most verbose)
2. **info** - General application flow (default)
3. **warn** - Warning messages
4. **error** - Only errors (least verbose)

## How to Use Logger

### In API Routes
```typescript
import { logger } from '@/lib/middleware/logger'

export async function GET(request: NextRequest) {
  const requestId = request.headers.get('x-request-id')
  
  logger.info('Fetching quizzes', { userId: 'user-123' }, requestId)
  
  try {
    const data = await fetchQuizzes()
    logger.info('Quiz fetched successfully', { count: data.length }, requestId)
    return Response.json(data)
  } catch (error) {
    logger.error('Failed to fetch quizzes', { error: error.message }, requestId)
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

### In Components
```typescript
import { logger } from '@/lib/middleware/logger'

export function QuizCard({ quiz }) {
  logger.debug('Rendering quiz card', { quizId: quiz.id })
  
  return <div>{quiz.title}</div>
}
```

## Log Output Format

```json
{
  "ts": "2025-01-15T10:30:45.123Z",
  "level": "info",
  "event": "quiz_submitted",
  "requestId": "1234567890-abc123",
  "quizId": "python_basics",
  "scorePercent": 100,
  "password": "[REDACTED]"
}
```

## Viewing Logs

### Local Development
```bash
npm run dev

# Logs appear in console - watch for events
```

### Production (Sentry)
Add `SENTRY_DSN` to deploy production errors to Sentry dashboard

## Sensitive Data Protection

These fields are **automatically redacted**:
- password
- token
- authorization
- credit_card
- Any field with these names (case-insensitive)

Add more redacted fields:
```env
LOG_REDACT_FIELDS=password,token,authorization,credit_card,ssn,phone
