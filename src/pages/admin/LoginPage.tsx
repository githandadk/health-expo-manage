// src/pages/admin/LoginPage.tsx
import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg(null); setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    console.log('[login] signInWithPassword:', { data, error, URL: import.meta.env.VITE_SUPABASE_URL })
    if (error) return setMsg(error.message)
    const u = await supabase.auth.getUser()
    console.log('[login] getUser:', u)
    location.href = '/admin'
  }

  const resetPw = async () => {
    if (!email) return setMsg('Enter your email first.')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/admin/login'
    })
    setMsg(error ? error.message : 'Check your email for a reset link.')
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-2">Staff Login</h1>
      <p className="text-sm text-gray-600 mb-4">Sign in with your staff email and password.</p>
      <form onSubmit={signIn} className="space-y-3">
        <input
          className="w-full border rounded p-2"
          placeholder="you@org.org"
          type="email"
          value={email}
          onChange={e=>setEmail(e.target.value)}
        />
        <input
          className="w-full border rounded p-2"
          placeholder="Password"
          type="password"
          value={password}
          onChange={e=>setPassword(e.target.value)}
        />
        <button className="px-4 py-2 rounded bg-gray-900 text-white w-full" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
        <button type="button" className="text-sm text-blue-700 underline" onClick={resetPw}>
          Forgot password?
        </button>
      </form>
      {msg && <p className="mt-3 text-sm text-red-600">{msg}</p>}
    </div>
  )
}
