import React from 'react'
import { I18nProvider, useI18n } from '@/lib/i18n'
import RegistrationForm from '@/features/registration/RegistrationForm'
import { useNavigate } from 'react-router-dom'

function Hero() {
  const { t, lang, setLang } = useI18n()
  return (
    <header className="bg-gradient-to-r from-sky-600 to-indigo-600 text-white">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">{t.heroTitle}</h1>
            <p className="text-white/90 mt-1">{t.heroSubtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm opacity-90">Language</label>
            <select
              value={lang}
              onChange={(e)=>setLang(e.target.value as any)}
              className="text-gray-900 rounded px-2 py-1"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="ko">한국어</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  )
}
const navigate = useNavigate()

export default function RegistrationPage() {
  return (
    <I18nProvider>
      <Hero />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white shadow-sm rounded-2xl border">
          <div className="px-6 py-5 border-b">
            <h2 className="text-xl font-semibold">Registration</h2>
          </div>
          <div className="p-6">
            <RegistrationForm />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          By registering, you agree to abide by Texas Expo policies, agree to be contacted for requested info, and give permission to be photographed as part of Texas Expo promotionals.
        </p>
      </main>
    </I18nProvider>
  )
}
async function onSubmit(values: {
  first_name: string
  last_name: string
  email: string
  phone: string
  language: 'en'|'es'|'ko'
  // ... any optional fields
}) {
  try {
    const res = await createRegistration(values) // returns { ticket: { code } }
    const code = res.ticket.code
    navigate('/success', {
      state: {
        code,
        first_name: values.first_name,
        last_name: values.last_name
      }
    })
  } catch (e:any) {
    alert(`Registration failed: ${e.message}`)
  }
}