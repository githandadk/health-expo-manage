// src/pages/admin/LoginPage.tsx (replace signIn handler)
const signIn = async (e: React.FormEvent) => {
  e.preventDefault()
  setMsg(null); setLoading(true)
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  setLoading(false)

  console.log('[login] signInWithPassword:', { data, error, URL: import.meta.env.VITE_SUPABASE_URL })
  if (error) return setMsg(error.message)

  // extra: verify we indeed have a user
  const u = await supabase.auth.getUser()
  console.log('[login] getUser:', u)

  location.href = '/admin'
}
