import { getPool } from "./db-connection"

// In-memory fallback for demo (when DB unavailable)
const mockUsers = [
  {
    id: 1,
    username: "admin",
    email: "admin@quizmate.local",
    password_hash: "$2b$10$d9ZH2lnVZb/jtLNIB/dO0.ue7TP4nYNXBOO3F5LOu8rLr9KNH3IIa",
    role: "admin",
    status: "active",
  },
]

export async function getUserByUsername(username: string) {
  try {
    const pool = getPool()
    const result = await pool.query(
      "SELECT * FROM users WHERE username = $1 AND is_deleted = false",
      [username]
    )
    return result.rows[0] || null
  } catch (error) {
    console.error("[DB] Error fetching user by username:", error)
    return mockUsers.find((u) => u.username === username) || null
  }
}

export async function getUserById(userId: number) {
  try {
    const pool = getPool()
    const result = await pool.query(
      "SELECT * FROM users WHERE id = $1 AND is_deleted = false",
      [userId]
    )
    return result.rows[0] || null
  } catch (error) {
    console.error("[DB] Error fetching user by id:", error)
    return mockUsers.find((u) => u.id === userId) || null
  }
}

export async function getUserPermissions(role: string) {
  try {
    const pool = getPool()
    const result = await pool.query(
      `SELECT p.permission_name FROM permissions p
       JOIN role_permissions rp ON p.id = rp.permission_id
       WHERE rp.role = $1`,
      [role]
    )
    return result.rows.map((r: { permission_name: string }) => r.permission_name)
  } catch (error) {
    console.error("[DB] Error fetching permissions:", error)
    return []
  }
}

export async function createAuditLog(
  userId: number | null,
  action: string,
  resourceType: string,
  resourceId: number | null,
  details: any,
) {
  try {
    const pool = getPool()
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, created_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
      [userId, action, resourceType, resourceId, JSON.stringify(details)]
    )
  } catch (error) {
    console.error("[DB] Error creating audit log:", error)
  }
}

export async function getAllUsers(limit = 50, offset = 0) {
  try {
    const pool = getPool()
    const result = await pool.query(
      `SELECT id, username, email, role, status, created_at, last_login 
       FROM users 
       WHERE is_deleted = false 
       ORDER BY created_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    )
    return result.rows
  } catch (error) {
    console.error("[DB] Error fetching all users:", error)
    return mockUsers
  }
}

export async function updateUser(
  userId: number,
  updates: Partial<{ status: string; role: string }>
) {
  try {
    const pool = getPool()
    const result = await pool.query(
      `UPDATE users 
       SET 
         status = COALESCE($2, status), 
         role = COALESCE($3, role), 
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND is_deleted = false
       RETURNING *`,
      [userId, updates.status || null, updates.role || null]
    )
    return result.rows[0] || null
  } catch (error) {
    console.error("[DB] Error updating user:", error)
    return null
  }
}
