// src/features/registration/api.ts
import { supabase } from '@/lib/supabase'

export async function createRegistration(input: {
  first_name: string; last_name: string; email: string; phone: string;
  language: 'en'|'es'|'ko'; opt_info?: Record<string, any>
}) {
  const { data, error } = await supabase.rpc('register_attendee', {
    _first_name: input.first_name,
    _last_name:  input.last_name,
    _email:      input.email,
    _phone:      input.phone,
    _language:   input.language,
    _opt_info:   input.opt_info ?? null
  })

  if (error) throw new Error(error.message)

  // RPC returns [{ code }]
  const code = data?.[0]?.code as string
  if (!code) throw new Error('No code returned')
  return { ticket: { code } }
}
