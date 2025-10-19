import React, { useMemo, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
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

  // Optionals:
  attendee_count: z.coerce.number().min(1).max(20).optional(),
  age_bracket: z.enum(['u18','18_34','35_49','50_64','65p']).optional(),
  access_needs: z.string().optional(),
  screenings: z.array(z.string()).optional(),
  screening_other: z.string().optional(),
  preferred_time: z.enum(['morning','midday','afternoon','unsure']).optional(),
  church_affil: z.string().optional(),
  newsletter_opt: z.boolean().optional(),
  photo_consent: z.boolean().optional(),
  volunteer_interest: z.boolean().optional(),
  dependents_note: z.string().optional(),
  notes: z.string().optional()
})
type FormVals = z.infer<typeof schema>

const screeningKeys = [
  'bp','bs','bmi','vision','hearing','dental','other'
] as const

export default function RegistrationForm() {
  const { t, lang, setLang } = useI18n()
  const [code, setCode] = useState<string | null>(null)

  const {
    register, handleSubmit, control,
    formState: { errors, isSubmitting }, watch
  } = useForm<FormVals>({
    resolver: zodResolver(schema),
    defaultValues: { language: lang, newsletter_opt: true }
  })

  const screenings = watch('screenings') || []
  const wantsOther = screenings.includes('other')

  const label = useMemo(() => ({
    first: t.firstName,
    last: t.lastName,
    email: t.email,
    phone: t.phone
  }), [t])

  const onSubmit = async (vals: FormVals) => {
    const opt_info = {
      attendee_count: vals.attendee_count,
      age_bracket: vals.age_bracket,
      access_needs: vals.access_needs,
      screenings: vals.screenings,
      screening_other: vals.screening_other,
      preferred_time: vals.preferred_time,
      church_affil: vals.church_affil,
      newsletter_opt: !!vals.newsletter_opt,
      photo_consent: !!vals.photo_consent,
      volunteer_interest: !!vals.volunteer_interest,
      dependents_note: vals.dependents_note,
      notes: vals.notes
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
  }

  // Success view
  if (code) {
    return (
      <div className="max-w-lg mx-auto text-center">
        <h3 className="text-2xl font-semibold mb-2">{t.successThanks}</h3>
        <p className="text-gray-600 mb-4">{t.confirmationHint}</p>
        <div className="border rounded p-3 inline-block">
          <QRCodeCanvas value={code} size={220} includeMargin />
        </div>
        <p className="mt-3 font-mono">{t.yourCode}: {code}</p>
        <button className="mt-4 px-4 py-2 rounded bg-gray-900 text-white" onClick={()=>window.print()}>
          {t.printLabel}
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

      {/* Optional questions */}
      <section>
        <h4 className="font-semibold text-lg mb-3">{t.optionalSection}</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Household */}
          <div className="md:col-span-1">
            <label className="block text-sm font-medium mb-1">{t.attendeeCount}</label>
            <input type="number" min={1} max={20} className="w-full border rounded p-2"
              {...register('attendee_count', { valueAsNumber: true })} />
          </div>

          {/* Age */}
          <div className="md:col-span-1">
            <label className="block text-sm font-medium mb-1">{t.ageBracket}</label>
            <select className="w-full border rounded p-2" {...register('age_bracket')}>
              <option value="">{/* empty */}</option>
              <option value="u18">{t.age_u18}</option>
              <option value="18_34">{t.age_18_34}</option>
              <option value="35_49">{t.age_35_49}</option>
              <option value="50_64">{t.age_50_64}</option>
              <option value="65p">{t.age_65p}</option>
            </select>
          </div>

          {/* Accessibility */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">{t.accessNeeds}</label>
            <input className="w-full border rounded p-2" placeholder="(e.g., wheelchair access, interpreter, etc.)"
              {...register('access_needs')} />
          </div>

          {/* Screening interests */}
          <div className="md:col-span-2">
            <p className="block text-sm font-medium mb-2">{t.screeningInterest}</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" value="bp" {...register('screenings')} />
                <span>{t.screening_bp}</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" value="bs" {...register('screenings')} />
                <span>{t.screening_bs}</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" value="bmi" {...register('screenings')} />
                <span>{t.screening_bmi}</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" value="vision" {...register('screenings')} />
                <span>{t.screening_vision}</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" value="hearing" {...register('screenings')} />
                <span>{t.screening_hearing}</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" value="dental" {...register('screenings')} />
                <span>{t.screening_dental}</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" value="other" {...register('screenings')} />
                <span>{t.screening_other}</span>
              </label>
            </div>

            {wantsOther && (
              <input className="mt-2 w-full border rounded p-2" placeholder={t.otherText}
                {...register('screening_other')} />
            )}
          </div>

          {/* Preferred time */}
          <div className="md:col-span-1">
            <label className="block text-sm font-medium mb-1">{t.preferredTime}</label>
            <select className="w-full border rounded p-2" {...register('preferred_time')}>
              <option value="">{/* empty */}</option>
              <option value="morning">{t.pref_morning}</option>
              <option value="midday">{t.pref_midday}</option>
              <option value="afternoon">{t.pref_afternoon}</option>
              <option value="unsure">{t.pref_unsure}</option>
            </select>
          </div>

          {/* Church/community affiliation */}
          <div className="md:col-span-1">
            <label className="block text-sm font-medium mb-1">{t.churchAffil}</label>
            <input className="w-full border rounded p-2" {...register('church_affil')} />
          </div>

          {/* Opt-ins */}
          <div className="md:col-span-2 grid grid-cols-1 gap-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register('newsletter_opt')} />
              <span>{t.newsletterOpt}</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register('photo_consent')} />
              <span>{t.photoConsent}</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register('volunteer_interest')} />
              <span>{t.volunteerInterest}</span>
            </label>
          </div>

          {/* Dependents/notes */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">{t.dependentsNote}</label>
            <textarea rows={2} className="w-full border rounded p-2" {...register('dependents_note')} />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">{t.notes}</label>
            <textarea rows={3} className="w-full border rounded p-2" {...register('notes')} />
          </div>
        </div>
      </section>

      <div className="pt-2">
        <button
          disabled={isSubmitting}
          className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60"
        >
          {isSubmitting ? '...' : t.submitRegistration}
        </button>
      </div>
    </form>
  )
}
