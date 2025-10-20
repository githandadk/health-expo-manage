import React, { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser'

type Props = {
  onResult: (code: string) => void
}

export default function QrScanner({ onResult }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    let controls: IScannerControls | undefined
    let disposed = false

    async function start() {
      setError(null)

      if (!('mediaDevices' in navigator) || !navigator.mediaDevices.getUserMedia) {
        setError('Camera is not available in this browser.')
        return
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false
        })
        if (!videoRef.current) return
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      } catch (e: any) {
        setError(
          e?.name === 'NotAllowedError'
            ? 'Camera permission was denied. Please allow access and try again.'
            : 'Could not start camera.'
        )
        return
      }

      try {
        const reader = new BrowserMultiFormatReader()
        setRunning(true)

        // Correct API: callback receives (result, error, controls)
        controls = await reader.decodeFromVideoDevice(
          null,
          videoRef.current!,
          (result, err, c) => {
            if (c && !controls) controls = c // capture controls once
            if (result) {
              // stop scanning as soon as we get a code
              try { controls?.stop() } catch {}
              if (!disposed) setRunning(false)
              onResult(result.getText())
            }
            // ignore "NotFound" errors in the stream; they fire continuously when no code is in view
          }
        )
      } catch (e: any) {
        setError('Failed to start scanner.')
        try { controls?.stop() } catch {}
        setRunning(false)
      }
    }

    start()

    return () => {
      disposed = true
      try { controls?.stop() } catch {}
      // also stop any camera stream tracks if still attached
      const stream = videoRef.current?.srcObject as MediaStream | undefined
      stream?.getTracks().forEach(t => t.stop())
    }
  }, [onResult])

  return (
    <div className="space-y-2">
      <video ref={videoRef} className="w-full aspect-video rounded border bg-black/5" muted playsInline />
      {running && <p className="text-sm text-gray-600">Point the camera at the QR code…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-xs text-gray-500">
        Tip: QR scanning needs HTTPS (or localhost) and camera permission.
      </p>
    </div>
  )
}
