import React, { useEffect, useRef } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'

export default function QrScanner({ onResult }: { onResult: (code: string)=>void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const reader = new BrowserMultiFormatReader()
    let stop = false
    (async () => {
      const video = videoRef.current!
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      video.srcObject = stream
      await video.play()
      while (!stop) {
        try {
          const res = await reader.decodeOnceFromVideoDevice(undefined, video)
          if (res?.getText()) { onResult(res.getText()); stop = true }
        } catch {}
      }
      stream.getTracks().forEach(t => t.stop())
    })()
    return () => { stop = true }
  }, [onResult])
  return <video ref={videoRef} className="w-full rounded border" />
}
