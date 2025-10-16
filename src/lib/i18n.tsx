import React, { createContext, useContext, useMemo, useState, useEffect } from 'react'
import en from '../i18n/en.json'
import es from '../i18n/es.json'
import ko from '../i18n/ko.json'

type Lang = 'en' | 'es' | 'ko'
type Dict = typeof en

const dicts: Record<Lang, Dict> = { en, es, ko }

const I18nCtx = createContext<{ t: Dict; lang: Lang; setLang: (l: Lang)=>void }|null>(null)

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pick = (): Lang => (new URLSearchParams(location.search).get('lang') as Lang) || (localStorage.getItem('lang') as Lang) || 'en'
  const [lang, setLangState] = useState<Lang>(pick())

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('lang', l)
    const sp = new URLSearchParams(location.search); sp.set('lang', l)
    history.replaceState(null, '', `${location.pathname}?${sp.toString()}`)
  }

  useEffect(()=>{ setLang(lang) },[]) // normalize URL on first load

  const t = useMemo(()=> dicts[lang], [lang])
  return <I18nCtx.Provider value={{ t, lang, setLang }}>{children}</I18nCtx.Provider>
}

export const useI18n = () => {
  const ctx = useContext(I18nCtx)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
