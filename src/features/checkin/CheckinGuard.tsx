import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function CheckinGuard({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<'checking'|'ok'|'blocked'>('checking')

  useEffect(() => {
    let cancelled = false
    let retried = false

    const decide = (user: any) => {
      const role = (user?.app_metadata as any)?.role
      const ok = !!user && (role === 'admin' || role === 'checkin')
      if (!cancelled) setStatus(ok ? 'ok' : 'blocked')
    }

    const check = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      console.log('[checkin-guard] getUser:', { user, error, URL: import.meta.env.VITE_SUPABASE_URL })
      decide(user)
    }

    // initial check
    check()

    // react to auth changes
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      console.log('[checkin-guard] onAuthStateChange', { session })
      decide(session?.user ?? null)
    })

    // one small retry so we never “hang” if hydration is slow
    const t = setTimeout(async () => {
      if (!retried && status === 'checking') { retried = true; await check() }
    }, 1200)

    return () => { cancelled = true; clearTimeout(t); sub.subscription.unsubscribe() }
  }, [])

  if (status === 'checking') return <div className="p-6">Checking access…</div>
  if (status === 'blocked') { location.href = '/admin/login'; return null }
  return <>{children}</>
}
