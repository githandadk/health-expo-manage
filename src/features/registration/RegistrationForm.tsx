import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import QRCode from 'qrcode'
import { useI18n } from '@/lib/i18n'
import { createRegistration } from './api'

const schema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(7),
  language: z.enum(['en','es','ko']),
  opt_info: z.any().optional()
})
type FormVals = z.infer<typeof schema>

export default function RegistrationForm() {
  const { t, lang, setLang } = useI18n()
  const [qr, setQr] = useState<string | null>(null)
  const [code, setCode] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormVals>({
    resolver: zodResolver(schema),
    defaultValues: { language: lang }
  })

  const onSubmit = async (vals: FormVals) => {
    const { ticket } = await createRegistration(vals)
    setCode(ticket.code)
    const dataUrl = await QRCode.toDataURL(ticket.code, { margin: 1, width: 240 })
    setQr(dataUrl)
  }

  if (qr && code) {
    return (
      <div className="max-w-md mx-auto p-6">
        <h2 className="text-2xl font-semibold mb-2">{t.success}</h2>
        <p className="mb-3">{t.yourCode}: <span className="font-mono">{code}</span></p>
        <img src={qr} alt="QR" className="border rounded p-2 mx-auto" />
        <button className="mt-4 px-4 py-2 rounded bg-gray-900 text-white" onClick={()=>window.print()}>
          {t.printLabel}
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg mx-auto space-y-4 p-6">
      <div className="flex items-center gap-2">
        <label className="font-medium">{t.languageLabel}</label>
        <select className="border rounded p-2" value={lang} onChange={e=>setLang(e.target.value as any)}>
          <option value="en">{t.language_en}</option>
          <option value="es">{t.language_es}</option>
          <option value="ko">{t.language_ko}</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">{t.firstName}</label>
        <input className="w-full border rounded p-2" {...register('first_name')} />
        {errors.first_name && <p className="text-red-600 text-sm">Required</p>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">{t.lastName}</label>
        <input className="w-full border rounded p-2" {...register('last_name')} />
        {errors.last_name && <p className="text-red-600 text-sm">Required</p>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">{t.email}</label>
        <input className="w-full border rounded p-2" {...register('email')} />
        {errors.email && <p className="text-red-600 text-sm">Valid email required</p>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">{t.phone}</label>
        <input className="w-full border rounded p-2" {...register('phone')} />
        {errors.phone && <p className="text-red-600 text-sm">Required</p>}
      </div>

      {/* Optional fields block — customize as needed */}
      <div>
        <label className="block text-sm font-medium mb-1">{t.optionalInfo}</label>
        <textarea className="w-full border rounded p-2" {...register('opt_info')} />
      </div>

      <button disabled={isSubmitting} className="px-4 py-2 rounded bg-blue-600 text-white">
        {isSubmitting ? '...' : t.submit}
      </button>
    </form>
  )
}
