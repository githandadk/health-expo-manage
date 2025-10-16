import React from 'react'
import AdminTable from './AdminTable'
import AdminGuard from './AdminGuard'
import { supabase } from '@/lib/supabase'

export default function AdminPage() {
  const signOut = async () => {
    await supabase.auth.signOut()
    location.href = '/admin/login'
  }
  return (
    <AdminGuard>
      <div className="max-w-6xl mx-auto p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Admin</h1>
          <button className="px-3 py-2 rounded bg-gray-200" onClick={signOut}>Sign out</button>
        </div>
        <AdminTable />
      </div>
    </AdminGuard>
  )
}
