import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom' // or your router hook
import { supabase } from '@/lib/supabase'
import QRCode from 'qrcode'

export default function LabelPage() {
  const params = useParams() as { id: string }  // ticket id
  const [rec, setRec] = useState<any | null>(null)
  const [qr, setQr] = useState<string>('')

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select('id, code, attendee:attendees(first_name,last_name)')
        .eq('id', params.id)
        .maybeSingle()
      if (error) { alert(error.message); return }
      setRec(data)
      const dataUrl = await QRCode.toDataURL(data!.code, { width: 220, margin: 0 })
      setQr(dataUrl)
      setTimeout(()=>window.print(), 300) // auto print
    })()
  }, [params.id])

  if (!rec) return <div className="p-6">Loading…</div>

  return (
    <div className="w-[3in] h-[2in] flex items-center justify-between p-2 border rounded print:border-0">
      <div className="pr-2">
        <div className="text-xl font-bold leading-tight">{rec.attendee.first_name} {rec.attendee.last_name}</div>
        <div className="font-mono text-sm mt-1">Code: {rec.code}</div>
      </div>
      <img src={qr} alt="QR" className="w-[1.6in]" />
      <style>{`
        @page { size: 3in 2in; margin: 0.1in; }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:border-0{ border-width: 0 !important; }
        }
      `}</style>
    </div>
  )
}
