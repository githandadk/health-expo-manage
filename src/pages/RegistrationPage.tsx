import React from 'react'
import { I18nProvider } from '@/lib/i18n'
import RegistrationForm from '@/features/registration/RegistrationForm'

export default function RegistrationPage() {
  return (
    <I18nProvider>
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">Austin Community Health Expo</h1>
        <RegistrationForm />
      </div>
    </I18nProvider>
  )
}
