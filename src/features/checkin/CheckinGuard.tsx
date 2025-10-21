// src/features/checkin/CheckinGuard.tsx
import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function CheckinGuard({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState<boolean | null>(null)
  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const role = (user?.app_metadata as any)?.role
      setOk(!!user && (role === 'admin' || role === 'checkin'))
    }
    check()
    const { data: sub } = supabase.auth.onAuthStateChange(() => check())
    return () => sub.subscription.unsubscribe()
  }, [])
  if (ok === null) return <div className="p-6">Checking access…</div>
  if (!ok) { location.href = '/admin/login'; return null }
  return <>{children}</>
}
