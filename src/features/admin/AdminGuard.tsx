// src/features/admin/AdminGuard.tsx
import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<'checking'|'ok'|'blocked'>('checking')

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const role = (user?.app_metadata as any)?.role
      setStatus(user && role === 'admin' ? 'ok' : 'blocked')
    }
    check()
    const { data: sub } = supabase.auth.onAuthStateChange(() => check())
    return () => sub.subscription.unsubscribe()
  }, [])

  if (status === 'checking') return <div className="p-6">Checking access…</div>
  if (status === 'blocked') { location.href = '/admin/login'; return null }
  return <>{children}</>
}
