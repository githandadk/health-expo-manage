// src/pages/SuccessPage.tsx
import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import QRCode from 'qrcode'

export default function SuccessPage() {
  const navigate = useNavigate()
  const loc = useLocation() as any

  // ----- Get data from state, with query param fallbacks -----
  const s = (loc.state || {}) as {
    code?: string
    first_name?: string
    last_name?: string
    first?: string
    last?: string
  }

  let code = s.code
  let first = s.first_name ?? s.first
  let last  = s.last_name  ?? s.last

  const p = new URLSearchParams(window.location.search)
  if (!code)  code  = p.get('code')  || ''
  if (!first) first = p.get('first') || ''
  if (!last)  last  = p.get('last')  || ''

  const fullName = [first, last].filter(Boolean).join(' ')
  const hasName = fullName.length > 0

  // ----- QR code canvas -----
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)

  React.useEffect(() => {
    if (!code || !canvasRef.current) return
    // Render QR at a tidy size for on-screen preview; print uses a larger size.
    QRCode.toCanvas(canvasRef.current, code, {
      width: 180,
      margin: 1,
      errorCorrectionLevel: 'M'
    }).catch(() => {})
  }, [code])

  const handlePrint = () => {
    if (!code) return

    // Use a slightly larger QR for print
    const tmp = document.createElement('canvas')
    QRCode.toCanvas(tmp, code, {
      width: 280,
      margin: 1,
      errorCorrectionLevel: 'M'
    }).then(() => {
      const dataUrl = tmp.toDataURL('image/png')

      const w = window.open('', '_blank', 'noopener,noreferrer,width=480,height=640')
      if (!w) return

      const safeName = hasName ? fullName : ''
      w.document.write(`
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>Print Label</title>
            <style>
              @media print {
                @page { size: auto; margin: 10mm; }
              }
              body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; }
              .wrap { display: flex; align-items: center; justify-content: center; min-height: 100vh; }
              .card {
                border: 1px solid #e5e7eb; border-radius: 16px; padding: 16px;
                width: 360px; text-align: center;
              }
              .name { font-size: 18px; font-weight: 600; margin-top: 8px; }
              .code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 20px; letter-spacing: 2px; margin-top: 6px; }
              .hint { font-size: 12px; color: #6b7280; margin-top: 8px; }
              .qr { display: block; margin: 8px auto 0 auto; width: 280px; height: 280px; }
              .btn { margin-top: 12px; }
            </style>
          </head>
          <body>
            <div class="wrap">
              <div class="card">
                <img class="qr" src="${dataUrl}" alt="QR Code" />
                ${safeName ? `<div class="name">${escapeHtml(safeName)}</div>` : ''}
                <div class="code">Code: ${escapeHtml(code)}</div>
                <div class="hint">Present this code at check-in</div>
                <div class="btn"><button onclick="window.print()">Print</button></div>
              </div>
            </div>
          </body>
        </html>
      `)
      w.document.close()
      // Don’t auto-print; user can review then click Print.
    })
  }

  if (!code) {
    return (
      <div className="max-w-xl mx-auto p-6">
        <div className="bg-white shadow-sm rounded-2xl border p-6 text-center">
          <h1 className="text-xl font-semibold mb-2">Registration Complete</h1>
          <p className="text-sm text-gray-600">
            We couldn’t find a confirmation code. Please return to the registration page and try again.
          </p>
          <div className="mt-4">
            <button
              className="px-4 py-2 rounded bg-gray-900 text-white"
              onClick={() => navigate('/')}
            >
              Back to registration
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Match your header spacing by wrapping in a centered card */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white shadow-sm rounded-2xl border">
          <div className="px-6 py-5 border-b">
            <h2 className="text-xl font-semibold">Registration Complete</h2>
          </div>

          <div className="p-6">
            <div className="flex flex-col items-center text-center gap-3">
              {hasName ? (
                <p className="text-lg">
                  Thank you, <span className="font-semibold">{fullName}</span>!
                </p>
              ) : (
                <p className="text-lg">Thank you for registering!</p>
              )}

              <div className="text-sm text-gray-600">Show this code at check-in</div>

              <div className="mt-1">
                <canvas ref={canvasRef} className="border rounded-md" />
              </div>

              <div className="inline-flex items-center gap-2">
                <span className="text-gray-600">Your code:</span>
                <span className="px-3 py-1.5 rounded border font-mono text-lg tracking-widest">
                  {code}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <button
                  className="px-4 py-2 rounded bg-gray-900 text-white"
                  onClick={() => navigate('/')}
                >
                  Register another person
                </button>
                <button
                  className="px-4 py-2 rounded bg-sky-600 text-white"
                  onClick={handlePrint}
                >
                  Print label
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-2">
                Keep this page or take a screenshot of your QR code for faster check-in.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

/** Simple HTML-escape for print window content */
function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
