// src/features/admin/AdminGuard.tsx
import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<'checking'|'ok'|'blocked'>('checking')

  useEffect(() => {
    let cancelled = false
    const fail = () => { if (!cancelled) setStatus('blocked') }

    const check = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        console.log('[guard] getUser:', { user, error, URL: import.meta.env.VITE_SUPABASE_URL })
        const role = (user?.app_metadata as any)?.role
        if (!cancelled) setStatus(user && role === 'admin' ? 'ok' : 'blocked')
      } catch (e) {
        console.warn('[guard] getUser threw:', e)
        fail()
      }
    }

    // hard timeout so it never hangs forever
    const t = setTimeout(fail, 4000)
    check().finally(() => clearTimeout(t))

    // also react to auth changes
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      const role = (session?.user?.app_metadata as any)?.role
      console.log('[guard] onAuthStateChange:', { session, role })
      if (!cancelled) setStatus(session && role === 'admin' ? 'ok' : 'blocked')
    })

    return () => { cancelled = true; sub.subscription.unsubscribe() }
  }, [])

  if (status === 'checking') return <div className="p-6">Checking access…</div>
  if (status === 'blocked') {
    // dump & reset any stale/bad tokens
    supabase.auth.signOut().finally(() => { location.href = '/admin/login' })
    return null
  }
  return <>{children}</>
}
