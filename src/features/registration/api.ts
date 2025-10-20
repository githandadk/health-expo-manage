// src/features/registration/api.ts
import { supabase } from '@/lib/supabase'

function shortCode(): string {
  const n = crypto.getRandomValues(new Uint32Array(2))
  const big = (BigInt(n[0])<<32n) + BigInt(n[1])
  return big.toString(36).slice(0,10)
}

export async function createRegistration(input: {
  first_name: string; last_name: string; email: string; phone: string;
  language: 'en'|'es'|'ko'; opt_info?: Record<string, any>
}) {
  const { data: attendee, error: aErr } = await supabase
    .from('attendees')
    .insert([{
      first_name: input.first_name,
      last_name: input.last_name,
      email: input.email,
      phone: input.phone,
      language: input.language,
      opt_info: input.opt_info ?? null
    }])
    .select()
    .single()

  if (aErr) {
    console.error('Insert attendee failed:', aErr)
    throw new Error(aErr.message)
  }

  const code = shortCode()
  const { data: ticket, error: tErr } = await supabase
    .from('tickets')
    .insert([{ attendee_id: attendee.id, code }])
    .select()
    .single()

  if (tErr) {
    console.error('Insert ticket failed:', tErr)
    throw new Error(tErr.message)
  }

  return { attendee, ticket }
}
