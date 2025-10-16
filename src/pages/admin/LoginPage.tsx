import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin + '/admin' } })
    if (error) alert(error.message)
    else setSent(true)
  }
  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-2">Admin Sign In</h1>
      {sent ? <p>Check your email for a magic link.</p> : (
        <form onSubmit={onSubmit} className="space-y-3">
          <input className="w-full border rounded p-2" placeholder="you@domain.com" value={email} onChange={e=>setEmail(e.target.value)} />
          <button className="px-4 py-2 rounded bg-gray-900 text-white">Send Magic Link</button>
        </form>
      )}
    </div>
  )
}
