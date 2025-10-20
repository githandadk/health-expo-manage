// src/features/admin/LabelPage.tsx
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { QRCodeCanvas } from 'qrcode.react'
import { supabase } from '@/lib/supabase' // adjust to your path alias if needed

type TicketRecord = {
  id: string
  code: string
  attendee: { first_name: string; last_name: string }
}

export default function LabelPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [ticket, setTicket] = useState<TicketRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Require admin session (optional: remove if you want labels for checkin too)
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const role = session?.user?.app_metadata?.role
      if (!session || role !== 'admin') navigate('/admin/login', { replace: true })
    })()
  }, [navigate])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    ;(async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select('id, code, attendee:attendees(first_name, last_name)')
        .eq('id', id)
        .maybeSingle()

      if (error) setError(error.message)
      else if (!data) setError('Ticket not found.')
      else {
        setTicket(data as TicketRecord)
        setTimeout(() => window.print(), 300) // auto print
      }
      setLoading(false)
    })()
  }, [id])

  if (loading) return <div className="p-6">Loading…</div>
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>
  if (!ticket) return <div className="p-6">No record.</div>

  const fullName = `${ticket.attendee.first_name} ${ticket.attendee.last_name}`

  return (
    <div className="w-[3in] h-[2in] p-2 flex items-center justify-between border rounded print:border-0">
      {/* Left: text */}
      <div className="pr-2 shrink min-w-0">
        <div className="text-xl font-bold leading-tight truncate">{fullName}</div>
        <div className="font-mono text-sm mt-1 break-all">Code: {ticket.code}</div>
        <div className="no-print mt-3">
          <button className="px-3 py-1 rounded bg-gray-900 text-white" onClick={() => window.print()}>
            Print
          </button>
        </div>
      </div>

      {/* Right: QR (scaled down so it doesn’t overflow) */}
      <div className="shrink-0 w-[1.25in] h-[1.25in] flex items-center justify-center">
        <QRCodeCanvas
          value={ticket.code}
          size={256}                                // high internal resolution
          includeMargin={false}
          style={{ width: '1.25in', height: '1.25in' }} // display size on the label
        />
      </div>

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
