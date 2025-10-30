import React, { useMemo, useState } from 'react'
import { createRegistration } from '@/features/registration/api'
import { useI18n } from '@/lib/i18n'

type Lang = 'en' | 'es' | 'ko'

export interface RegistrationFormValues {
  first_name: string
  last_name: string
  email: string
  phone: string
  language: Lang
  opt_info?: {
    hear_about?: string[]
    hear_about_other_text?: string
    contact_interests?: string[]
    want_prayer?: boolean
    prayer_request?: string
  }
  [k: string]: any
}

const HEAR_OPTIONS = [
  { key: 'church_friend', label: { en: 'Church/Friend', es: 'Iglesia/Amigo', ko: '교회/친구' } },
  { key: 'newspaper_ad', label: { en: 'Newspaper Ad', es: 'Anuncio en periódico', ko: '신문 광고' } },
  { key: 'poster_ad', label: { en: 'Poster Ad', es: 'Afiche/Cartel', ko: '포스터 광고' } },
  { key: 'youtube_online', label: { en: 'Youtube/Online', es: 'YouTube/En línea', ko: '유튜브/온라인' } },
  { key: 'other', label: { en: 'Other', es: 'Otro', ko: '기타' } }
]

const CONTACT_OPTIONS = [
  { key: 'healthy_fellowship', label: { en: 'Healthy Fellowship', es: 'Compañerismo saludable', ko: '건강한 교제' } },
  { key: 'healthy_cooking', label: { en: 'Healthy Cooking', es: 'Cocina saludable', ko: '건강 요리' } },
  { key: 'health_seminar', label: { en: 'Health Seminar', es: 'Seminario de salud', ko: '건강 세미나' } },
  { key: 'outdoor_sports_games', label: { en: 'Outdoor sports/games', es: 'Deportes/juegos al aire libre', ko: '야외 스포츠/게임' } },
  { key: 'korean_class', label: { en: 'Korean class', es: 'Clase de coreano', ko: '한국어 수업' } },
  { key: 'bible_studies', label: { en: 'Bible studies', es: 'Estudios bíblicos', ko: '성경 공부' } },
  { key: 'bible_prophecy', label: { en: 'Bible prophecy', es: 'Profecía bíblica', ko: '성경 예언' } },
  { key: 'signs_magazine', label: { en: 'Signs Magazine', es: 'Revista Signs', ko: '사인즈 매거진' } }
]

export default function RegistrationForm({
  onSubmit, // if provided, delegate submission (route in parent)
}: {
  onSubmit?: (values: RegistrationFormValues) => Promise<void> | void
}) {
  const { lang } = useI18n()
  const L = useMemo(() => ({
    first: { en: 'First Name', es: 'Nombre', ko: '이름' }[lang],
    last: { en: 'Last Name', es: 'Apellido', ko: '성' }[lang],
    email: { en: 'Email', es: 'Correo electrónico', ko: '이메일' }[lang],
    phone: { en: 'Phone', es: 'Teléfono', ko: '전화번호' }[lang],
    optional: { en: 'Optional Information', es: 'Información opcional', ko: '선택 정보' }[lang],
    hearAbout: { en: 'How did you hear about the expo?', es: '¿Cómo se enteró de la expo?', ko: '엑스포 소식을 어디서 들으셨나요?' }[lang],
    specify: { en: 'Please specify', es: 'Especifique', ko: '기타 내용을 적어주세요' }[lang],
    contactMe: { en: 'Contact me with more info about these items (Optional)', es: 'Contácteme con más información (Opcional)', ko: '다음 항목에 대한 안내를 받고 싶습니다 (선택)' }[lang],
    wantPrayer: { en: 'I would like prayer (Optional)', es: 'Quisiera oración (Opcional)', ko: '기도를 원합니다 (선택)' }[lang],
    prayerPlaceholder: { en: 'Prayer request (optional)', es: 'Petición de oración (opcional)', ko: '기도 제목 (선택)' }[lang],
    submit: { en: 'Submit Registration', es: 'Enviar registro', ko: '등록 제출' }[lang],
    thanks: { en: "Thanks! You're registered.", es: '¡Gracias! Se ha registrado.', ko: '감사합니다! 등록되었습니다.' }[lang],
    code: { en: 'Code', es: 'Código', ko: '코드' }[lang],
    registerAnother: { en: 'Register another', es: 'Registrar otro', ko: '다른 사람 등록' }[lang],
    requiredMsg: { en: 'Please fill in all required fields.', es: 'Complete todos los campos obligatorios.', ko: '필수 항목을 모두 입력하세요.' }[lang],
  }), [lang])

  const [values, setValues] = useState<RegistrationFormValues>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    language: lang as Lang, // keep in sync with header selector
    opt_info: {
      hear_about: [],
      hear_about_other_text: '',
      contact_interests: [],
      want_prayer: false,
      prayer_request: '',
    }
  })

  // keep language in sync if user changes the header selector
  React.useEffect(() => {
    setValues(v => ({ ...v, language: lang as Lang }))
  }, [lang])

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<null | { code: string }>(null) // used only when no onSubmit is provided

  const setField = (k: keyof RegistrationFormValues, v: any) =>
    setValues(prev => ({ ...prev, [k]: v }))

  const setOpt = (k: keyof NonNullable<RegistrationFormValues['opt_info']>, v: any) =>
    setValues(prev => ({ ...prev, opt_info: { ...(prev.opt_info ?? {}), [k]: v } }))

  const toggleArray = (arr: string[] | undefined, key: string) => {
    const a = arr ?? []
    return a.includes(key) ? a.filter(x => x !== key) : [...a, key]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!values.first_name.trim() || !values.last_name.trim() || !values.email.trim() || !values.phone.trim()) {
      setError(L.requiredMsg)
      return
    }

    // ensure opt_info is shaped correctly
    const opt_info = {
      hear_about: values.opt_info?.hear_about ?? [],
      hear_about_other_text: (values.opt_info?.hear_about ?? []).includes('other')
        ? (values.opt_info?.hear_about_other_text ?? '').trim()
        : '',
      contact_interests: values.opt_info?.contact_interests ?? [],
      want_prayer: !!values.opt_info?.want_prayer,
      prayer_request: values.opt_info?.want_prayer ? (values.opt_info?.prayer_request ?? '').trim() : ''
    }

    const payload: RegistrationFormValues = {
      first_name: values.first_name.trim(),
      last_name: values.last_name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      language: values.language,
      opt_info
    }

    setSubmitting(true)
    try {
      if (onSubmit) {
        // Delegate to parent (RegistrationPage) — it will navigate to /success with name + code
        await onSubmit(payload)
        return
      }

      // Standalone mode (no onSubmit): keep original inline success UX
      const res = await createRegistration(payload)
      const code = res?.ticket?.code
      if (!code) throw new Error('No code returned')
      setSuccess({ code })
    } catch (err: any) {
      setError(err?.message || 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  // Inline success only when no onSubmit prop is provided
  if (!onSubmit && success) {
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">{L.thanks}</h3>
        <div className="font-mono text-xl">
          {L.code}: {success.code}
        </div>
        <a className="text-blue-600 underline" href="/">
          {L.registerAnother}
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="text-sm text-red-600">{error}</div>}

      {/* Required fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">{L.first}</label>
          <input
            className="w-full border rounded p-2"
            value={values.first_name}
            onChange={e => setField('first_name', e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{L.last}</label>
          <input
            className="w-full border rounded p-2"
            value={values.last_name}
            onChange={e => setField('last_name', e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{L.email}</label>
          <input
            type="email"
            className="w-full border rounded p-2"
            value={values.email}
            onChange={e => setField('email', e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{L.phone}</label>
          <input
            className="w-full border rounded p-2"
            value={values.phone}
            onChange={e => setField('phone', e.target.value)}
            required
          />
        </div>
      </div>

      {/* Optional Information */}
      <div className="pt-2 border-t">
        <h2 className="font-medium mb-3">{L.optional}</h2>

        {/* Hear about */}
        <div className="mb-4">
          <div className="text-sm font-medium mb-2">{L.hearAbout}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {HEAR_OPTIONS.map(opt => (
              <label key={opt.key} className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={values.opt_info?.hear_about?.includes(opt.key) || false}
                  onChange={() =>
                    setOpt(
                      'hear_about',
                      toggleArray(values.opt_info?.hear_about, opt.key)
                    )
                  }
                />
                <span>{opt.label[lang]}</span>
              </label>
            ))}
          </div>
          {values.opt_info?.hear_about?.includes('other') && (
            <input
              className="mt-2 w-full border rounded p-2"
              placeholder={L.specify}
              value={values.opt_info?.hear_about_other_text ?? ''}
              onChange={e => setOpt('hear_about_other_text', e.target.value)}
            />
          )}
        </div>

        {/* Contact interests */}
        <div className="mb-4">
          <div className="text-sm font-medium mb-2">{L.contactMe}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {CONTACT_OPTIONS.map(opt => (
              <label key={opt.key} className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={values.opt_info?.contact_interests?.includes(opt.key) || false}
                  onChange={() =>
                    setOpt(
                      'contact_interests',
                      toggleArray(values.opt_info?.contact_interests, opt.key)
                    )
                  }
                />
                <span>{opt.label[lang]}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Prayer */}
        <div>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!values.opt_info?.want_prayer}
              onChange={e => setOpt('want_prayer', e.target.checked)}
            />
            <span>{L.wantPrayer}</span>
          </label>
          {values.opt_info?.want_prayer && (
            <input
              className="mt-2 w-full border rounded p-2"
              placeholder={L.prayerPlaceholder}
              value={values.opt_info?.prayer_request ?? ''}
              onChange={e => setOpt('prayer_request', e.target.value)}
            />
          )}
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 rounded bg-gray-900 text-white disabled:opacity-60"
        >
          {submitting ? 'Submitting…' : L.submit}
        </button>
      </div>
    </form>
  )
}
