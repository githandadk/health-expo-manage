// RegistrationForm.tsx
import React, { useState } from 'react'
import { createRegistration } from '@/features/registration/api'

type Lang = 'en'|'es'|'ko'

export interface RegistrationFormValues {
  first_name: string
  last_name: string
  email: string
  phone: string
  language: Lang
  // include your optional fields here if you collect them:
  [k: string]: any
}

export default function RegistrationForm({
  onSubmit,        // <-- NEW prop
}: {
  onSubmit?: (values: RegistrationFormValues) => Promise<void> | void
}) {
  const [values, setValues] = useState<RegistrationFormValues>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    language: 'en',
  })

  // your other state like optional checkboxes, prayer, etc.
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // If you previously had: const [success, setSuccess] = useState(false)
  // we'll keep it but only use it when no onSubmit is provided
  const [success, setSuccess] = useState<null | { code: string }>(null)

  const handleChange = (k: keyof RegistrationFormValues, v: any) =>
    setValues(prev => ({ ...prev, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // basic required validation
    if (!values.first_name || !values.last_name || !values.email || !values.phone) {
      setError('Please fill in all required fields.')
      return
    }

    setSubmitting(true)
    try {
      // If parent provided onSubmit, delegate to it and EXIT (parent will navigate)
      if (onSubmit) {
        await onSubmit(values)
        return
      }

      // Otherwise, keep the form’s original inline success flow:
      const res = await createRegistration(values)
      const code = res?.ticket?.code
      if (!code) throw new Error('No code returned')

      setSuccess({ code })
      // (your old QR/ID inline success UI can render using success?.code)
    } catch (err: any) {
      setError(err?.message || 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  // If you previously rendered an inline success block, guard it so it only shows
  // when NO onSubmit was provided (i.e., standalone form usage)
  if (!onSubmit && success) {
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Thanks! You’re registered.</h3>
        <div className="font-mono text-xl">Code: {success.code}</div>
        {/* your existing QR code block can stay here if you had one */}
        <a className="text-blue-600 underline" href="/">Register another</a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-sm text-red-600">{error}</div>}

      {/* Example required fields — keep your existing inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">First Name</label>
          <input
            className="w-full border rounded p-2"
            value={values.first_name}
            onChange={e => handleChange('first_name', e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Last Name</label>
          <input
            className="w-full border rounded p-2"
            value={values.last_name}
            onChange={e => handleChange('last_name', e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            className="w-full border rounded p-2"
            value={values.email}
            onChange={e => handleChange('email', e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            className="w-full border rounded p-2"
            value={values.phone}
            onChange={e => handleChange('phone', e.target.value)}
            required
          />
        </div>
      </div>

      {/* Keep your language + optional sections here exactly as you had them,
          just make sure they read/write to `values` appropriately. */}

      <div>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 rounded bg-gray-900 text-white disabled:opacity-60"
        >
          {submitting ? 'Submitting…' : 'Submit Registration'}
        </button>
      </div>
    </form>
  )
}
