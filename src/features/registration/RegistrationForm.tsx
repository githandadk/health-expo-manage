import React, { useMemo, useState } from 'react'
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
  language: z.enum(['en','es','ko']),

  // Optional fields (your new set)
  hear_about: z.array(z.enum(['church_friend','newspaper','poster','online','other'])).optional(),
  hear_about_other_text: z.string().optional(),
  contact_interests: z.array(z.enum([
    'fellowship','cooking','seminar','outdoor','korean','bible_studies','prophecy','signs'
  ])).optional(),
  want_prayer: z.boolean().optional(),
  prayer_request: z.string().optional()
})
type FormVals = z.infer<typeof schema>

export default function RegistrationForm() {
  const { t, lang, setLang } = useI18n()
  const [code, setCode] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm<FormVals>({
    resolver: zodResolver(schema),
    defaultValues: { language: lang, want_prayer: false }
  })

  const hearAbout = watch('hear_about') || []
  const showOther = hearAbout.includes('other')
const wantPrayer = watch('want_prayer') ?? false
  const label = useMemo(() => ({
    first: t.firstName,
    last: t.lastName,
    email: t.email,
    phone: t.phone
  }), [t])

  const onSubmit = async (vals: FormVals) => {
     try {
    const opt_info: any = {
      hear_about: vals.hear_about ?? [],
      contact_interests: vals.contact_interests ?? [],
      want_prayer: !!vals.want_prayer
    }
    if (showOther && vals.hear_about_other_text?.trim()) {
      opt_info.hear_about_other_text = vals.hear_about_other_text.trim()
    }
    if (vals.want_prayer && vals.prayer_request?.trim()) {
      opt_info.prayer_request = vals.prayer_request.trim()
}
    const { ticket } = await createRegistration({
      first_name: vals.first_name,
      last_name: vals.last_name,
      email: vals.email,
      phone: vals.phone,
      language: vals.language,
      opt_info
    })
    setCode(ticket.code)
  } catch (err: any) {
    alert(`Registration failed: ${err.message ?? String(err)}`)
  }
}

  // Success screen
  if (code) {
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <h2 className="text-2xl font-semibold mb-2">{t.successThanks ?? t.success}</h2>
        <p className="text-gray-600 mb-4">{t.confirmationHint ?? t.yourCode}</p>
        <div className="border rounded p-3 mx-auto w-fit">
          <QRCodeCanvas value={code} size={240} includeMargin />
        </div>
        <p className="mt-3 font-mono">{t.yourCode}: {code}</p>
        <button
          className="mt-4 px-4 py-2 rounded bg-gray-900 text-white"
          onClick={() => window.print()}
        >
          {t.printLabel} </button>
<button 
          className="mt-2 px-4 py-2 rounded bg-gray-200 text-gray-900"
  onClick={() => { window.location.href = '/' }}   // or use navigate('/') if you prefer
>
  {t.registerAnother}
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Contact info */}
      <section>
        <h4 className="font-semibold text-lg mb-3">{t.contactInfo}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">{label.first}</label>
            <input className="w-full border rounded p-2" {...register('first_name')} />
            {errors.first_name && <p className="text-sm text-red-600">{errors.first_name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{label.last}</label>
            <input className="w-full border rounded p-2" {...register('last_name')} />
            {errors.last_name && <p className="text-sm text-red-600">{errors.last_name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{label.email}</label>
            <input className="w-full border rounded p-2" {...register('email')} />
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{label.phone}</label>
            <input className="w-full border rounded p-2" {...register('phone')} />
            {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t.languageLabel}</label>
            <select className="w-full border rounded p-2" value={lang}
              onChange={(e)=>setLang(e.target.value as any)} {...register('language')}>
              <option value="en">{t.language_en}</option>
              <option value="es">{t.language_es}</option>
              <option value="ko">{t.language_ko}</option>
            </select>
          </div>
        </div>
      </section>

      <hr className="border-gray-200" />

      {/* Optional questions (ONLY your specified ones) */}
      <section>
        <h4 className="font-semibold text-lg mb-3">{t.optionalSection}</h4>

        {/* How did you hear about the expo? */}
        <div className="space-y-2">
          <p className="text-sm font-medium">{t.hearAbout}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" value="church_friend" {...register('hear_about')} />
              <span>{t.ha_churchFriend}</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" value="newspaper" {...register('hear_about')} />
              <span>{t.ha_newspaper}</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" value="poster" {...register('hear_about')} />
              <span>{t.ha_poster}</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" value="online" {...register('hear_about')} />
              <span>{t.ha_online}</span>
            </label>
            <label className="flex items-center gap-2 md:col-span-2">
              <input type="checkbox" value="other" {...register('hear_about')} />
              <span>{t.ha_other}</span>
            </label>
          </div>
          {showOther && (
            <input
              className="mt-1 w-full border rounded p-2"
              placeholder={t.otherText}
              {...register('hear_about_other_text')}
            />
          )}
        </div>

        {/* Contact me with more info about… */}
        <div className="space-y-2 mt-6">
          <p className="text-sm font-medium">{t.contactMore}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" value="fellowship" {...register('contact_interests')} />
              <span>{t.ci_fellowship}</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" value="cooking" {...register('contact_interests')} />
              <span>{t.ci_cooking}</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" value="seminar" {...register('contact_interests')} />
              <span>{t.ci_seminar}</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" value="outdoor" {...register('contact_interests')} />
              <span>{t.ci_outdoor}</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" value="korean" {...register('contact_interests')} />
              <span>{t.ci_korean}</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" value="bible_studies" {...register('contact_interests')} />
              <span>{t.ci_bibleStudies}</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" value="prophecy" {...register('contact_interests')} />
              <span>{t.ci_prophecy}</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" value="signs" {...register('contact_interests')} />
              <span>{t.ci_signs}</span>
            </label>
          </div>
        </div>

        {/* I would like prayer */}
<div className="mt-6 space-y-2">
  <label className="flex items-center gap-2">
    <input type="checkbox" {...register('want_prayer')} />
    <span>{t.wantPrayer}</span>
  </label>

  {wantPrayer && (
    <textarea
      rows={3}
      className="w-full border rounded p-2"
      placeholder={t.prayerDetails}
      {...register('prayer_request')}
    />
  )}
</div>
      </section>

      <div className="pt-2">
        <button
          disabled={isSubmitting}
          className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60"
        >
          {isSubmitting ? '...' : (t.submitRegistration ?? t.submit)}
        </button>
      </div>
    </form>
  )
}
