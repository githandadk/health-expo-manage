import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Ticket = { id?: string; code: string; status: string; checked_in_at: string | null }
type OptInfo = { prayer_request?: string; hear_about?: string[]; contact_interests?: string[]; want_prayer?: boolean; hear_about_other_text?: string } & Record<string, any>
type Row = {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  language: string
  created_at: string
  opt_info?: OptInfo | null
  tickets: Ticket[] | null
}

type Checkin = {
  attendee_id: string
  booth_name: string
  note: string | null
  created_at: string
}

const PAGE_LIMIT = 200

function downloadCsv(filename: string, rows: any[], headers: string[]) {
  const esc = (v: any) => {
    if (v === null || v === undefined) return ''
    const s = String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const lines = [
    headers.join(','),
    ...rows.map(r => headers.map(h => esc(r[h])).join(','))
  ]
  // 👇 Add UTF-8 BOM so Excel displays Korean properly
  const BOM = '\uFEFF'
  const csv = BOM + lines.join('\n')
  
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export default function AdminTable() {
  const [rows, setRows] = useState<Row[]>([])
  const [allCheckins, setAllCheckins] = useState<Checkin[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<'created_at'|'last_name'>('created_at')
  const [dir, setDir] = useState<'asc'|'desc'>('desc')
  const [toast, setToast] = useState<string | null>(null)

  const ciByAttendee = useMemo(() => {
    const m = new Map<string, Checkin[]>()
    for (const c of allCheckins) {
      const arr = m.get(c.attendee_id) ?? []
      arr.push(c)
      m.set(c.attendee_id, arr)
    }
    return m
  }, [allCheckins])

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        // Load attendees (with tickets)
        let query = supabase
          .from('attendees')
          .select(`
            id,
            first_name,
            last_name,
            email,
            phone,
            language,
            created_at,
            opt_info,
            tickets:tickets(id, code, status, checked_in_at)
          `)
          .order(sort, { ascending: dir === 'asc' })
          .range(0, PAGE_LIMIT - 1)

        if (q.trim()) {
          const like = `%${q.trim()}%`
          query = query.or(`first_name.ilike.${like},last_name.ilike.${like},email.ilike.${like},phone.ilike.${like}`)
        }

        const { data: rowsData, error } = await query
        if (error) throw error
        setRows(rowsData as Row[])

        // Load all check-ins (joined view)
        const { data: ci, error: ciErr } = await supabase
          .from('v_checkins')
          .select('attendee_id, booth_name, note, created_at')
          .order('created_at', { ascending: true })

        if (ciErr) throw ciErr
        setAllCheckins((ci ?? []) as Checkin[])
      } catch (e: any) {
        console.error(e)
        setToast(e.message || 'Failed to load')
      } finally {
        setLoading(false)
      }
    })()
  }, [q, sort, dir])

  const delAttendee = async (id: string) => {
    if (!confirm('Delete this attendee?')) return
    const { error } = await supabase.from('attendees').delete().eq('id', id)
    if (error) { setToast(error.message); return }
    setRows(prev => prev.filter(r => r.id !== id))
    setToast('Deleted')
  }

  const exportAll = () => {
    const headers = [
      'first_name','last_name','email','phone','language',
      'code','status','checked_in_at','created_at',
      'hear_about','hear_about_other_text','contact_interests',
      'want_prayer','prayer_request',
      'booths'
    ]

    const out = rows.map(r => {
      const tk = r.tickets?.[0] ?? {}
      const oi: any = r.opt_info || {}
      const cis = ciByAttendee.get(r.id) ?? []
      const join = (v: any) => Array.isArray(v) ? v.join('; ') : (v ?? '')
      const boothsStr = cis
        .map(ci => `${ci.booth_name}${ci.note ? ' ('+ci.note+')' : ''} @ ${new Date(ci.created_at).toLocaleString()}`)
        .join('; ')

      return {
        first_name: r.first_name,
        last_name: r.last_name,
        email: r.email,
        phone: r.phone,
        language: r.language,
        code: tk.code ?? '',
        status: tk.status ?? '',
        checked_in_at: tk.checked_in_at ?? '',
        created_at: r.created_at,
        hear_about: join(oi.hear_about),
        hear_about_other_text: oi.hear_about_other_text ?? '',
        contact_interests: join(oi.contact_interests),
        want_prayer: oi.want_prayer ? 'yes' : 'no',
        prayer_request: oi.prayer_request ?? '',
        booths: boothsStr
      }
    })

    downloadCsv('expo-attendees.csv', out, headers)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex items-center gap-2">
          <input
            className="border rounded p-2 w-64"
            placeholder="Search name/email/phone"
            value={q}
            onChange={e=>setQ(e.target.value)}
          />
          <button className="px-3 py-2 rounded bg-gray-900 text-white" onClick={()=>setQ(q)}>Search</button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm">Sort</label>
          <select className="border rounded p-2" value={sort} onChange={e=>setSort(e.target.value as any)}>
            <option value="created_at">Created</option>
            <option value="last_name">Last name</option>
          </select>
          <select className="border rounded p-2" value={dir} onChange={e=>setDir(e.target.value as any)}>
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <a className="px-3 py-2 rounded bg-indigo-600 text-white" href="/checkin">Go to Check-in</a>
          <a className="px-3 py-2 rounded bg-sky-600 text-white" href="/admin/booths">Manage Booths</a>
          <button className="px-3 py-2 rounded bg-green-600 text-white" onClick={exportAll}>Export CSV</button>
        </div>
      </div>

      <div className="overflow-auto border rounded">
        <table className="min-w-[1100px] w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Email</th>
              <th className="text-left p-2">Phone</th>
              <th className="text-left p-2">Lang</th>
              <th className="text-left p-2">Code</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Prayer Request</th>
              <th className="text-left p-2">Booth Check-ins</th>
              <th className="text-left p-2 w-28">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={9} className="p-4">Loading…</td></tr>
            )}

            {!loading && rows.length === 0 && (
              <tr><td colSpan={9} className="p-4 text-gray-500">No results.</td></tr>
            )}

            {!loading && rows.map(r => {
              const tk = r.tickets?.[0]
              const prayer = r.opt_info?.prayer_request ?? ''
              const cis = ciByAttendee.get(r.id) ?? []
              const boothsStr = cis
                .map(ci => `${ci.booth_name}${ci.note ? ' ('+ci.note+')' : ''} @ ${new Date(ci.created_at).toLocaleString()}`)
                .join('; ')
              return (
                <tr key={r.id} className="border-t">
                  <td className="p-2">{r.first_name} {r.last_name}</td>
                  <td className="p-2">{r.email}</td>
                  <td className="p-2">{r.phone}</td>
                  <td className="p-2 uppercase">{r.language}</td>
                  <td className="p-2 font-mono">{tk?.code ?? ''}</td>
                  <td className="p-2">{tk?.status ?? ''}</td>
                  <td className="p-2 max-w-[260px]">
                    <div className="text-sm text-gray-800 overflow-hidden text-ellipsis whitespace-nowrap" title={prayer}>
                      {prayer || '—'}
                    </div>
                  </td>
                  <td className="p-2 max-w-[320px]">
                    <div className="text-sm text-gray-800 line-clamp-2" title={boothsStr}>{boothsStr || '—'}</div>
                  </td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <a className="px-2 py-1 rounded bg-gray-700 text-white text-sm" href={`/admin/label/${tk?.id ?? ''}`} target="_blank" rel="noreferrer">Label</a>
                      <button className="px-2 py-1 rounded bg-red-600 text-white text-sm" onClick={()=>delAttendee(r.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-black text-white px-3 py-2 rounded shadow"
             onClick={()=>setToast(null)}>
          {toast}
        </div>
      )}
    </div>
  )
}
