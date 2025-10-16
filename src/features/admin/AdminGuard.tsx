import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState<boolean | null>(null)
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { location.href = '/admin/login'; return }
      const role = (session.user.app_metadata as any)?.role
      if (role !== 'admin') { alert('Not authorized'); await supabase.auth.signOut(); location.href = '/admin/login'; return }
      setOk(true)
    })()
  }, [])
  if (ok === null) return <div className="p-6">Loading…</div>
  return <>{children}</>
}
