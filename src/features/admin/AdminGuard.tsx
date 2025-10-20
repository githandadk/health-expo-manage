import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<'checking'|'ok'|'blocked'>('checking')

  useEffect(() => {
    let mounted = true

    async function check() {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        console.warn('getUser error', error)
      }
      console.log('Auth user:', user)
      const role = (user?.app_metadata as any)?.role
      if (user && role === 'admin') {
        if (mounted) setStatus('ok')
      } else {
        if (mounted) setStatus('blocked')
      }
    }

    // initial check
    check()

    // handle changes (e.g., after magic link)
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, _session) => {
      check()
    })

    return () => { mounted = false; sub.subscription.unsubscribe() }
  }, [])

  if (status === 'checking') return <div className="p-6">Checking your access…</div>

  if (status === 'blocked') {
    // Optional: show a clearer message before sending to login
    setTimeout(() => { location.href = '/admin/login' }, 300)
    return (
      <div className="p-6">
        <p className="text-red-600 font-medium">Not authorized.</p>
        <p className="text-sm text-gray-600 mt-1">
          Make sure your magic link redirected back to this site and your account has the <code>admin</code> role.
        </p>
      </div>
    )
  }

  return <>{children}</>
}
