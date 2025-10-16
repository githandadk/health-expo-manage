import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { QRCodeCanvas } from 'qrcode.react'
import { supabase } from '../../lib/supabase' // adjust if your path differs

type TicketRecord = {
  id: string
  code: string
  attendee: {
    first_name: string
    last_name: string
  }
}

export default function LabelPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [record, setRecord] = useState<TicketRecord | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Require an admin session
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const role = session?.user?.app_metadata?.role
      if (!session || role !== 'admin') {
        // Not authorized → send to admin login
        navigate('/admin/login', { replace: true })
      }
    })()
  }, [navigate])

  // Fetch ticket by ID
  useEffect(() => {
    if (!id) return
    setLoading(true)
    ;(async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select('id, code, attendee:attendees(first_name, last_name)')
        .eq('id', id)
        .maybeSingle()

      if (error) {
        setError(error.message)
      } else if (!data) {
        setError('Ticket not found.')
      } else {
        setRecord(data as TicketRecord)
        // Auto-open print dialog (slight delay ensures layout is ready)
        setTimeout(() => window.print(), 300)
      }
      setLoading(false)
    })()
  }, [id])

  if (loading) return <div className="p-6">Loading…</div>
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>
  if (!record) return <div className="p-6">No record.</div>

  const fullName = `${record.attendee.first_name} ${record.attendee.last_name}`

  return (
    <div className="w-[3in] h-[2in] p-2 flex items-center justify-between border rounded print:border-0">
      {/* Left: text */}
      <div className="pr-2">
        <div className="text-xl font-bold leading-tight">{fullName}</div>
        <div className="font-mono text-sm mt-1">Code: {record.code}</div>
        <div className="no-print mt-3 flex gap-2">
          <button
            className="px-3 py-1 rounded bg-gray-900 text-white"
            onClick={() => window.print()}
          >
            Print
          </button>
          <button
            className="px-3 py-1 rounded bg-gray-200"
            onClick={() => window.close()}
          >
            Close
          </button>
        </div>
      </div>

      {/* Right: QR */}
      <div className="shrink-0">
        <QRCodeCanvas value={record.code} size={220} includeMargin={false} />
      </div>

      {/* Print CSS */}
      <style>{`
        @page { size: 3in 2in; margin: 0.1in; }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:border-0 { border-width: 0 !important; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  )
}
