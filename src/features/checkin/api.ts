import { supabase } from '@/lib/supabase'

export type Booth = { id: string; slug: string; name: string }

export async function listBooths(): Promise<Booth[]> {
  const { data, error } = await supabase
    .from('booths')
    .select('id, slug, name')
    .order('name', { ascending: true })
  if (error) throw new Error(error.message)
  return data as Booth[]
}

export async function addCheckinByCode(code: string, boothSlug: string, note?: string) {
  const { data, error } = await supabase.rpc('add_checkin_by_code', {
    _code: code,
    _booth_slug: boothSlug,
    _note: note ?? null
  })
  if (error) throw new Error(error.message)
  return data?.[0] as { id: string; booth_name: string; created_at: string }
}

export async function searchAttendees(q: string) {
  // search by name/email/phone or by exact code
  const like = `%${q}%`
  // by attendee fields
  const { data, error } = await supabase
    .from('attendees')
    .select(`
      id, first_name, last_name, email, phone, language,
      tickets:tickets(id, code, status)
    `)
    .or(`first_name.ilike.${like},last_name.ilike.${like},email.ilike.${like},phone.ilike.${like}`)
    .limit(20)
  if (error) throw new Error(error.message)
  return data
}

export async function getAttendeeByCode(code: string) {
  const { data, error } = await supabase
    .from('tickets')
    .select('id, code, attendee:attendees(id, first_name, last_name, email, phone, language)')
    .eq('code', code)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data
}
