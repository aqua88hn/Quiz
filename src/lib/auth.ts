// Using simple token generation and validation

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123"

export interface AuthPayload {
  role: "admin" | "user"
  iat?: number
  exp?: number
}

// Simple token generation (base64 encoded)
export function generateToken(role: "admin" | "user" = "user"): string {
  const payload = {
    role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours
  }
  return Buffer.from(JSON.stringify(payload)).toString("base64")
}

// Simple token validation
export function verifyToken(token: string): AuthPayload | null {
  try {
    const decoded = JSON.parse(Buffer.from(token, "base64").toString())

    // Check expiration
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    return decoded
  } catch {
    return null
  }
}

export function validateAdminPassword(password: string): boolean {
  return password === ADMIN_PASSWORD
}
