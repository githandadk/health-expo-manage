import React, { useEffect, useState } from 'react'
import AdminGuard from '@/features/admin/AdminGuard'
import { supabase } from '@/lib/supabase'

type Booth = { id: string; slug: string; name: string }

export default function BoothsPage() {
  return (
    <AdminGuard>
      <BoothsInner />
    </AdminGuard>
  )
}

function BoothsInner() {
  const [rows, setRows] = useState<Booth[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [msg, setMsg] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('booths')
      .select('id, slug, name')
      .order('name', { ascending: true })
    setLoading(false)
    if (error) return setMsg(error.message)
    setRows(data as Booth[])
  }

  useEffect(() => { load() }, [])

  const toSlug = (s: string) =>
    s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const createBooth = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg(null)
    const finalSlug = slug ? toSlug(slug) : toSlug(name)
    if (!name.trim() || !finalSlug) { setMsg('Name or slug is missing'); return }
    const { error } = await supabase.from('booths').insert([{ name: name.trim(), slug: finalSlug }])
    if (error) { setMsg(error.message); return }
    setName(''); setSlug('')
    await load()
  }

  const renameBooth = async (id: string, newName: string) => {
    const { error } = await supabase.from('booths').update({ name: newName.trim() }).eq('id', id)
    if (error) { setMsg(error.message); return }
    setRows(prev => prev.map(b => b.id === id ? { ...b, name: newName.trim() } : b))
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Manage Booths</h1>
        <a className="px-3 py-2 rounded bg-gray-900 text-white" href="/admin">Back to Admin</a>
      </header>

      <form onSubmit={createBooth} className="bg-white border rounded p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="md:col-span-3">
            <label className="block text-sm font-medium mb-1">Booth name</label>
            <input className="w-full border rounded p-2" value={name} onChange={e=>setName(e.target.value)} placeholder="Blood Pressure" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Slug (optional)</label>
            <input className="w-full border rounded p-2" value={slug} onChange={e=>setSlug(e.target.value)} placeholder="blood-pressure" />
          </div>
        </div>
        <button className="px-4 py-2 rounded bg-sky-600 text-white">Create</button>
        {msg && <p className="text-sm text-red-600 mt-2">{msg}</p>}
      </form>

      <div className="bg-white border rounded">
        <div className="px-4 py-3 border-b font-medium">Existing booths</div>
        {loading ? (
          <div className="p-4">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="p-4 text-gray-600">No booths yet.</div>
        ) : (
          <ul className="divide-y">
            {rows.map(b => <BoothRow key={b.id} booth={b} onRename={renameBooth} />)}
          </ul>
        )}
      </div>
    </div>
  )
}

function BoothRow({ booth, onRename }: { booth: Booth; onRename: (id: string, name: string) => void }) {
  const [edit, setEdit] = useState(false)
  const [val, setVal] = useState(booth.name)
  return (
    <li className="p-3 flex items-center gap-3">
      <div className="grow min-w-0">
        <div className="text-xs text-gray-500">/{booth.slug}</div>
        {!edit ? (
          <div className="text-lg font-medium">{booth.name}</div>
        ) : (
          <input className="border rounded p-2 w-full" value={val} onChange={e=>setVal(e.target.value)} />
        )}
      </div>
      {!edit ? (
        <button className="px-3 py-2 rounded bg-gray-900 text-white" onClick={()=>setEdit(true)}>Rename</button>
      ) : (
        <div className="flex items-center gap-2">
          <button className="px-3 py-2 rounded bg-green-600 text-white"
                  onClick={()=>{ onRename(booth.id, val); setEdit(false) }}>
            Save
          </button>
          <button className="px-3 py-2 rounded bg-gray-300" onClick={()=>{ setVal(booth.name); setEdit(false) }}>
            Cancel
          </button>
        </div>
      )}
    </li>
  )
}
