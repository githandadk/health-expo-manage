import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { QRCodeCanvas } from 'qrcode.react'
import { useI18n } from '@/lib/i18n'
import { createRegistration } from './api'

const schema = z.object({
  first_name: z.string().min(1, 'Required'),
  last_name: z.string().min(1, 'Required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(7, 'Required'),
  language: z.enum(['en', 'es', 'ko']),
  notes: z.string().optional()
})
type FormVals = z.infer<typeof schema>

export default function RegistrationForm() {
  const { t, lang, setLang } = useI18n()
  const [code, setCode] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormVals>({
    resolver: zodResolver(schema),
    defaultValues: { language: lang }
  })

  const onSubmit = async (vals: FormVals) => {
    const opt_info =
      vals.notes && vals.notes.trim().length > 0 ? { notes: vals.notes.trim() } : undefined

    const { ticket } = await createRegistration({
      first_name: vals.first_name,
      last_name: vals.last_name,
      email: vals.email,
      phone: vals.phone,
      language: vals.language,
      opt_info
    })
    setCode(ticket.code)
  }

  // Success screen
  if (code) {
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <h2 className="text-2xl font-semibold mb-2">{t.success}</h2>
        <p className="mb-4">
          {t.yourCode}: <span className="font-mono">{code}</span>
        </p>
        <div className="border rounded p-3 mx-auto w-fit">
          <QRCodeCanvas value={code} size={240} includeMargin />
        </div>
        <button
          className="mt-4 px-4 py-2 rounded bg-gray-900 text-white"
          onClick={() => window.print()}
        >
          {t.printLabel}
        </button>
      </div>
    )
  }

  // Form
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg mx-auto space-y-4 p-6">
      {/* Language selector */}
      <div className="flex items-center gap-2">
        <label className="font-medium">{t.languageLabel}</label>
        <select
          className="border rounded p-2"
          value={lang}
          onChange={(e) => setLang(e.target.value as any)}
          {...register('language')}
        >
          <option value="en">{t.language_en}</option>
          <option value="es">{t.language_es}</option>
          <option value="ko">{t.language_ko}</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">{t.firstName}</label>
        <input className="w-full border rounded p-2" {...register('first_name')} />
        {errors.first_name && (
          <p className="text-red-600 text-sm">{errors.first_name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">{t.lastName}</label>
        <input className="w-full border rounded p-2" {...register('last_name')} />
        {errors.last_name && (
          <p className="text-red-600 text-sm">{errors.last_name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">{t.email}</label>
        <input className="w-full border rounded p-2" {...register('email')} />
        {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">{t.phone}</label>
        <input className="w-full border rounded p-2" {...register('phone')} />
        {errors.phone && <p className="text-red-600 text-sm">{errors.phone.message}</p>}
      </div>

      {/* Optional notes stored as JSON {notes: "..."} */}
      <div>
        <label className="block text-sm font-medium mb-1">{t.optionalInfo}</label>
        <textarea
          className="w-full border rounded p-2"
          rows={3}
          placeholder="Allergies, access needs, or other notes (optional)"
          {...register('notes')}
        />
      </div>

      <button
        disabled={isSubmitting}
        className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60"
      >
        {isSubmitting ? '...' : t.submit}
      </button>
    </form>
  )
}
