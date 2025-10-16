import { supabase } from '@/lib/supabase'

export async function findByCode(code: string) {
  const { data, error } = await supabase
    .from('tickets')
    .select('id, code, status, checked_in_at, attendee:attendees(id, first_name, last_name, email, phone, language)')
    .eq('code', code)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function checkIn(ticketId: string) {
  const { data, error } = await supabase
    .from('tickets')
    .update({ status: 'checked_in', checked_in_at: new Date().toISOString() })
    .eq('id', ticketId)
    .select()
    .single()
  if (error) throw error
  return data
}
