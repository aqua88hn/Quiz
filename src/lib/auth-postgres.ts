import { getUserByUsername, createAuditLog, updateUserLastLogin } from "./db-users"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

export interface AuthPayload {
  userId: number
  username: string
  role: "admin" | "user" | "moderator"
  iat?: number
  exp?: number
}

// Simple password verification (in production use bcrypt)
export async function verifyPassword(plainPassword: string, passwordHash: string): Promise<boolean> {
  // For demo: compare directly (NOT recommended for production)
  // In production, use bcrypt.compare()
  if (passwordHash.startsWith("$2b$")) {
    // Hashed password - would need bcrypt library
    // For now, allow demo password
    return plainPassword === "admin123"
  }
  return plainPassword === passwordHash
}

export async function validateUserLogin(username: string, password: string) {
   const user = await getUserByUsername(username)

  // If user not found, log an audit attempt (resourceId null)
  if (!user) {
    try {
      const a = await createAuditLog(null, "LOGIN_FAILED", "user", null, { username, reason: "not_found" })
      if (!a.ok) console.warn("[AUTH] audit log failed:", a.error ?? a)
    } catch (e) {
      console.warn("[AUTH] audit create failed unexpectedly:", e)
    }
    return null
  }

  if (user.status !== "active") {
    await createAuditLog(user.id, "LOGIN_FAILED", "user", user.id, { username, reason: "disabled_or_inactive" })
    return null
  }

  const isValidPassword = await verifyPassword(password, user.password_hash)

  if (!isValidPassword) {
    const a = await createAuditLog(user.id, "LOGIN_FAILED", "user", user.id, { reason: "invalid_password" })
    if (!a.ok) console.warn("[AUTH] audit log failed:", a.error ?? a)
    return null
  }

  // successful login
  await createAuditLog(user.id, "LOGIN_SUCCESS", "user", user.id, { username })
  await updateUserLastLogin(user.id)
  return user
}

export function generateToken(userId: number, username: string, role: "admin" | "user" | "moderator"): string {
  const payload: AuthPayload = {
    userId,
    username,
    role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours
  }
  return Buffer.from(JSON.stringify(payload)).toString("base64")
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    const decoded = JSON.parse(Buffer.from(token, "base64").toString()) as AuthPayload

    // Check expiration
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    return decoded
  } catch {
    return null
  }
}

export * from "@/lib/auth-postgres"