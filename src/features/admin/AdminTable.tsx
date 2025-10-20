import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { downloadCsv } from '@/lib/csv'
import QrScanner from '@/features/checkin/QrScanner'
import { findByCode, checkIn } from '@/features/checkin/api'

type Row = {
  id: string; first_name: string; last_name: string; email: string; phone: string; language: string; created_at: string;
  opt_info?: {
    prayer_request?: string
    [key: string]: any
  } | null
  tickets: { code: string; status: string; checked_in_at: string | null }[] | null
}

export default function AdminTable() {
  const [rows, setRows] = useState<Row[]>([])
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<'created_at'|'last_name'|'language'>('created_at')
  const [dir, setDir] = useState<'asc'|'desc'>('desc')
  const [scanMode, setScanMode] = useState(false)
  const [detail, setDetail] = useState<any | null>(null)

  async function load() {
    let query = supabase
      .from('attendees')
      .select('id, first_name, last_name, email, phone, language, created_at, opt_info, tickets:tickets(id, code, status, checked_in_at)')
      .order(sort, { ascending: dir === 'asc' })
      .range(0, 199) // first 200; adjust / paginate as needed

    if (q) {
      query = query.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`)
    }
    const { data, error } = await query
    if (error) { alert(error.message); return }
    setRows(data as any)
  }

  useEffect(()=>{ load() },[q, sort, dir])

  const exportAll = () => {
  const rowsFlat = rows.map((r) => {
    const tk = r.tickets?.[0] ?? {}
    const oi: any = r.opt_info || {}

    const join = (v: any) => Array.isArray(v) ? v.join('; ') : (v ?? '')
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

      // Optional info (from your current form spec)
      hear_about: join(oi.hear_about),
      hear_about_other_text: oi.hear_about_other_text ?? '',
      contact_interests: join(oi.contact_interests),
      want_prayer: oi.want_prayer ? 'yes' : 'no',
      prayer_request: oi.prayer_request ?? ''
    }
  })

  downloadCsv(
    'expo-attendees.csv',
    rowsFlat,
    [
      'first_name','last_name','email','phone','language',
      'code','status','checked_in_at','created_at',
      'hear_about','hear_about_other_text','contact_interests',
      'want_prayer','prayer_request'
    ]
  )
}

  const delAttendee = async (id: string) => {
    if (!confirm('Delete this attendee (and ticket)?')) return
    const { error } = await supabase.from('attendees').delete().eq('id', id)
    if (error) { alert(error.message) } else load()
  }

  const onScan = async (code: string) => {
    setScanMode(false)
    const rec = await findByCode(code)
    setDetail(rec)
  }

  const markCheckedIn = async () => {
    if (!detail?.id) return
    const res = await checkIn(detail.id)
    setDetail({ ...detail, status: 'checked_in', checked_in_at: res.checked_in_at })
    load()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input className="border rounded p-2 flex-1" placeholder="Search name/email/phone" value={q} onChange={e=>setQ(e.target.value)} />
        <select className="border rounded p-2" value={sort} onChange={e=>setSort(e.target.value as any)}>
          <option value="created_at">Created</option>
          <option value="last_name">Last name</option>
          <option value="language">Language</option>
        </select>
        <select className="border rounded p-2" value={dir} onChange={e=>setDir(e.target.value as any)}>
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>
        <button className="px-3 py-2 rounded bg-gray-900 text-white" onClick={exportAll}>Export CSV</button>
        <button className="px-3 py-2 rounded bg-blue-600 text-white" onClick={()=>setScanMode(true)}>Scan QR</button>
      </div>

      {scanMode && (
        <div className="p-3 border rounded">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">QR Scanner</h3>
            <button className="px-2 py-1 rounded bg-gray-200" onClick={()=>setScanMode(false)}>Close</button>
          </div>
          <QrScanner onResult={onScan} />
        </div>
      )}

      {detail && (
        <div className="p-3 border rounded">
          <div className="flex justify-between mb-2">
            <h3 className="font-semibold">Record</h3>
            <button className="px-2 py-1 rounded bg-gray-200" onClick={()=>setDetail(null)}>Close</button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><b>Name</b>: {detail.attendee.first_name} {detail.attendee.last_name}</div>
            <div><b>Email</b>: {detail.attendee.email}</div>
            <div><b>Phone</b>: {detail.attendee.phone}</div>
            <div><b>Language</b>: {detail.attendee.language}</div>
            <div><b>Code</b>: <span className="font-mono">{detail.code}</span></div>
            <div><b>Status</b>: {detail.status}</div>
            <div><b>Checked in</b>: {detail.checked_in_at ?? '-'}</div>
          </div>
          <div className="mt-3 flex gap-2">
            <a className="px-3 py-2 rounded bg-gray-700 text-white" href={`/admin/label/${detail.id}`} target="_blank" rel="noreferrer">Print Label</a>
            {detail.status !== 'checked_in' && (
              <button className="px-3 py-2 rounded bg-green-600 text-white" onClick={markCheckedIn}>Mark Checked-In</button>
            )}
          </div>
        </div>
      )}

      <div className="overflow-auto border rounded">
        <table className="min-w-[800px] w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Email</th>
              <th className="text-left p-2">Phone</th>
              <th className="text-left p-2">Lang</th>
              <th className="text-left p-2">Code</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2 w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => {
              const tk = r.tickets?.[0]
              return (
                <tr key={r.id} className="border-t">
                  <td className="p-2">{r.first_name} {r.last_name}</td>
                  <td className="p-2">{r.email}</td>
                  <td className="p-2">{r.phone}</td>
                  <td className="p-2 uppercase">{r.language}</td>
                  <td className="p-2 font-mono">{tk?.code ?? ''}</td>
                  <td className="p-2">{tk?.status ?? ''}</td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <a className="px-2 py-1 rounded bg-gray-700 text-white text-sm" href={`/admin/label/${tk?.id ?? ''}`} target="_blank">Label</a>
                      <button className="px-2 py-1 rounded bg-red-600 text-white text-sm" onClick={()=>delAttendee(r.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
