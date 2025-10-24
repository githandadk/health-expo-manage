// src/pages/admin/WhoAmI.tsx
import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function WhoAmI() {
  const [info, setInfo] = useState<any>(null)
  useEffect(() => {
    (async () => {
      const u = await supabase.auth.getUser()
      const s = await supabase.auth.getSession()
      setInfo({ user: u.data.user, session: s.data.session, url: import.meta.env.VITE_SUPABASE_URL })
      console.log('[whoami]', { u, s })
    })()
  }, [])
  return <pre className="p-4 text-xs bg-gray-100 rounded">{JSON.stringify(info, null, 2)}</pre>
}
