"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || "Login failed")
        setLoading(false)
        return
      }

      // Fix: API returns { token, user } -> use result.token
      const token = result?.token
      if (!token) {
        setError("Login failed: missing token")
        setLoading(false)
        return
      }

      // Store token in cookie
      document.cookie = `adminToken=${encodeURIComponent(token)}; path=/; max-age=86400`

      // Redirect to admin dashboard
      router.push("/admin")
    } catch (err) {
      setError("An error occurred during login")
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Login</h1>
          <p className="text-slate-400 mb-8">Enter your credentials to access the admin dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-emerald-500 focus:outline-none"
                placeholder="Enter username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-emerald-500 focus:outline-none"
                placeholder="Enter password"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-900 border border-red-700 text-red-100 rounded-lg text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-6 p-3 bg-slate-700 rounded-lg text-sm text-slate-300">
            <p className="font-medium mb-1">Demo Credentials:</p>
            <p>
              Username: <code className="bg-slate-600 px-2 py-1 rounded">admin</code>
            </p>
            <p>
              Password: <code className="bg-slate-600 px-2 py-1 rounded">admin123</code>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
