"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminLoginPage() {
  const router = useRouter()
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
        body: JSON.stringify({ password: password.trim() }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || "Login failed")
        setLoading(false)
        return
      }

      // Store token in cookie (short-lived for demo)
      document.cookie = `adminToken=${result.data.token}; path=/; max-age=86400`

      // Redirect to admin dashboard
      router.push("/admin")
    } catch (err) {
      setError("An error occurred during login")
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Card */}
        <div className="rounded-2xl border border-slate-700 bg-slate-800 p-12 shadow-2xl leading-relaxed space-y-6">
          {/* Header Section */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-white mb-4">Admin Login</h1>
            <p className="text-slate-300 text-base leading-7">
              Nhập mật khẩu để truy cập bảng điều khiển quản lý
            </p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-300 mb-3">
                Mật Khẩu
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu của bạn"
                className="w-full px-4 py-4 rounded-lg bg-slate-700 text-white border border-slate-600 placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition text-base"
                required
                autoFocus
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 text-white text-lg rounded-lg font-semibold hover:bg-emerald-700 active:bg-emerald-800 transition-colors disabled:bg-emerald-600/50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 border-t border-slate-700"></div>

          {/* Demo Credentials Section */}
          <div className="bg-slate-700/40 rounded-lg p-5 border border-slate-700/50">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
              🔐 Thông Tin Demo
            </p>
            <div className="space-y-2">
              <p className="text-slate-300 text-sm">
                <span className="text-slate-400">Mật khẩu:</span>{" "}
                <code className="bg-slate-800 px-3 py-1 rounded text-emerald-400 font-mono text-base">admin123</code>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-xs mt-8">© 2025 Quiz Admin. Bảo mật là ưu tiên hàng đầu.</p>
      </div>
    </main>
  )
}
