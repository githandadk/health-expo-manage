// src/pages/CheckinPage.tsx
import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase' // if referenced
import CheckinGuard from '@/features/checkin/CheckinGuard'
import QrScanner from '@/features/checkin/QrScanner' // your existing scanner component
import { listBooths, addCheckinByCode, searchAttendees } from '@/features/checkin/api'

export default function CheckinPage() {
  return (
    <CheckinGuard>
      <CheckinInner />
    </CheckinGuard>
  )
}

function CheckinInner() {
  const [booths, setBooths] = useState<{ slug: string; name: string }[]>([])
  const [selectedBooth, setSelectedBooth] = useState<string>('')

  const [note, setNote] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  // search panel
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // scanning control
  const [scanning, setScanning] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      try {
        const data = await listBooths()
        setBooths(data)
      } catch (e: any) {
        setToast(e.message)
      }
    })()
  }, [])

  const onScan = async (code: string) => {
    if (!selectedBooth) { setToast('Choose a booth first.'); return }
    try {
      await addCheckinByCode(code.trim(), selectedBooth, note.trim() || undefined)
      setToast(`Checked in to ${booths.find(b => b.slug === selectedBooth)?.name ?? selectedBooth}`)
      setNote('')
      setScanning(false) // stop scanning after success
    } catch (e: any) {
      setToast(`Check-in failed: ${e.message}`)
    }
  }

  const doSearch = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!query.trim()) { setResults([]); return }
    setLoading(true)
    try {
      const rows = await searchAttendees(query.trim())
      setResults(rows)
    } catch (e: any) {
      setToast(`Search failed: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  const onCheckinClick = async (code: string) => {
    if (!selectedBooth) { setToast('Choose a booth first.'); return }
    try {
      await addCheckinByCode(code, selectedBooth, note.trim() || undefined)
      setToast(`Checked in to ${booths.find(b => b.slug === selectedBooth)?.name ?? selectedBooth}`)
      setNote('')
    } catch (e: any) {
      setToast(`Check-in failed: ${e.message}`)
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <header className="flex flex-col md:flex-row md:items-end gap-4">
        <div className="grow">
          <h1 className="text-2xl font-semibold">Event Check-in</h1>
          <p className="text-sm text-gray-600">Scan a QR or look up a registrant, choose a booth, and record the check-in.</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm">Booth</label>
          <select
            className="border rounded p-2"
            value={selectedBooth}
            onChange={e => setSelectedBooth(e.target.value)}
          >
            <option value="">— Select booth —</option>
            {booths.map(b => <option key={b.slug} value={b.slug}>{b.name}</option>)}
          </select>
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scan card */}
        <div className="bg-white border rounded p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Scan QR</h2>
            {!scanning ? (
              <button
                className="px-3 py-1.5 rounded bg-gray-900 text-white disabled:opacity-50"
                disabled={!selectedBooth}
                onClick={() => { setScanError(null); setScanning(true) }}
                title={!selectedBooth ? 'Choose a booth first' : 'Start camera'}
              >
                Start Scan
              </button>
            ) : (
              <button
                className="px-3 py-1.5 rounded bg-gray-200"
                onClick={() => setScanning(false)}
              >
                Stop
              </button>
            )}
          </div>

          {/* Only mount the camera when scanning = true */}
          <div className="mt-3">
            {scanning ? (
              <div className="aspect-video bg-black/5 border rounded overflow-hidden">
                <QrScanner
                  onResult={onScan}
                  onError={(err: any) => setScanError(err?.message ?? 'Camera error')}
                />
              </div>
            ) : (
              <div className="text-sm text-gray-500">Click “Start Scan” to open the camera.</div>
            )}
            {scanError && <div className="mt-2 text-sm text-red-600">{scanError}</div>}
          </div>

          <div className="mt-3">
            <label className="block text-sm mb-1">Booth note (optional)</label>
            <input
              className="w-full border rounded p-2"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="e.g., BP 120/80"
            />
          </div>
        </div>

        {/* Lookup card */}
        <div className="bg-white border rounded p-4">
          <h2 className="font-medium mb-2">Lookup</h2>
          <form onSubmit={doSearch} className="flex gap-2">
            <input
              className="grow border rounded p-2"
              placeholder="Search name, email, or phone"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <button className="px-4 py-2 rounded bg-gray-900 text-white">Search</button>
          </form>

          <div className="mt-3">
            {loading && <div>Searching…</div>}
            {!loading && results.length === 0 && <div className="text-sm text-gray-500">No results.</div>}
            <ul className="divide-y">
              {results.map(r => {
                const code = r.tickets?.[0]?.code
                return (
                  <li key={r.id} className="py-2 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{r.first_name} {r.last_name}</div>
                      <div className="text-sm text-gray-600 truncate">{r.email} • {r.phone}</div>
                      {code && <div className="text-xs font-mono text-gray-500">Code: {code}</div>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="px-3 py-1 rounded bg-blue-600 text-white disabled:opacity-60"
                        disabled={!code || !selectedBooth}
                        onClick={() => code && onCheckinClick(code)}
                        title={!selectedBooth ? 'Choose a booth first' : 'Check in'}
                      >
                        Check in
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </section>

      {toast && (
        <div
          className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-black text-white px-3 py-2 rounded shadow"
          onClick={() => setToast(null)}
        >
          {toast}
        </div>
      )}
    </div>
  )
}
