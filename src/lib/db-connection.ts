import { Pool, PoolConfig } from "pg"

// Singleton pattern để tránh multiple pool instances
let pool: Pool | null = null
let debugEnabled = false

/**
 * Initialize PostgreSQL connection pool
 * Reads configuration from environment variables
 */
function initializePool(): Pool {
  const poolConfig: PoolConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    database: process.env.DB_NAME,
    // Connection pooling configuration
    max: parseInt(process.env.DB_POOL_MAX || "20"), // Max connections in pool
    min: parseInt(process.env.DB_POOL_MIN || "2"), // Min connections to maintain
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT_MILLIS || "30000"), // 30 seconds
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT_MILLIS || "2000"), // 2 seconds
    query_timeout: parseInt(process.env.DB_QUERY_TIMEOUT_MILLIS || "0"), // 0 = no timeout
  }

  const newPool = new Pool(poolConfig)

  // Handle pool errors
  newPool.on("error", (err) => {
    console.error("[DB POOL] Unexpected error on idle client:", err)
  })

  // Log pool connection events in development
  if (process.env.NODE_ENV === "development") {
    newPool.on("connect", (client) => {
      console.log("[DB POOL] New client connected")
      client.query("SET TIME ZONE 'UTC'").catch(() => {})
    })
    newPool.on("remove", () => {
      console.log("[DB POOL] Client removed from pool")
    })
  }

  return newPool
}

/**
 * Enable debug wrapper cho pool queries
 * Logs all queries, parameters, execution time
 */
function enablePoolDebug(poolInstance: Pool): void {
  if (debugEnabled) return // Tránh override nhiều lần

  const originalQuery = poolInstance.query.bind(poolInstance)

  // Override query method with debug logging
  poolInstance.query = async function(text: string, values?: any[]) {
    console.log("[DB DEBUG] Query:", text)
    if (values && values.length > 0) {
      console.log("[DB DEBUG] Values:", values)
    }

    const startTime = Date.now()
    try {
      const result = await originalQuery(text, values)
      const duration = Date.now() - startTime
      console.log(`[DB DEBUG] ✅ Query completed in ${duration}ms - Rows: ${result.rowCount}`)
      return result
    } catch (error) {
      const duration = Date.now() - startTime
      console.error(`[DB DEBUG] ❌ Query failed after ${duration}ms:`, error)
      throw error
    }
  } as any

  debugEnabled = true
  console.log("[DB DEBUG] Debug mode enabled for pool queries")
}

/**
 * Get or create the PostgreSQL connection pool
 * Returns singleton instance
 * Automatically enables debug logging in development environment
 */
export function getPool(): Pool {
  if (!pool) {
    pool = initializePool()
    
    // Enable debug development
    if (process.env.NODE_ENV === "development") {
      try {
        enablePoolDebug(pool)
      } catch (error) {
        console.warn("[DB DEBUG] Failed to enable debug:", error)
      }
    }
  }

  return pool
}

/**
 * Gracefully close the connection pool
 * Call this during application shutdown
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
    debugEnabled = false
    console.log("[DB POOL] Connection pool closed")
  }
}

/**
 * Get current pool statistics (for monitoring)
 */
export function getPoolStats() {
  if (!pool) return null
  return {
    totalConnectionsCount: pool.totalCount,
    idleConnectionsCount: pool.idleCount,
    waitingRequestsCount: pool.waitingCount,
  }
}