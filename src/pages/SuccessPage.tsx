// src/pages/SuccessPage.tsx
import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function SuccessPage() {
  const navigate = useNavigate()
  const loc = useLocation() as any
  const state = loc.state || {}

  // Primary source: navigation state (best)
  let { first_name, last_name, code } = state

  // Fallback 1: query params (?code=...&first=...&last=...)
  if (!code) {
    const p = new URLSearchParams(window.location.search)
    code = code || p.get('code') || ''
    first_name = first_name || p.get('first') || ''
    last_name  = last_name  || p.get('last') || ''
  }

  // Fallback 2 (optional): if you really want, you could fetch by code to get the name.
  // Skipping here to keep it simple & fast.

  const fullName = [first_name, last_name].filter(Boolean).join(' ')
  const hasName = Boolean(fullName)

  return (
    <div className="max-w-xl mx-auto p-6 text-center space-y-4">
      <h1 className="text-2xl font-semibold">Registration Complete</h1>

      {hasName ? (
        <p className="text-lg">
          Thank you, <span className="font-medium">{fullName}</span>!
        </p>
      ) : (
        <p className="text-lg">Thank you for registering!</p>
      )}

      {code && (
        <div className="inline-block px-4 py-2 rounded border font-mono text-xl tracking-widest">
          Code: {code}
        </div>
      )}

      <p className="text-gray-600">
        Please save your code. You’ll use it to check in at the expo.
      </p>

      <div className="pt-2">
        <button
          className="px-4 py-2 rounded bg-gray-900 text-white"
          onClick={() => navigate('/')}
        >
          Register another person
        </button>
      </div>
    </div>
  )
}
