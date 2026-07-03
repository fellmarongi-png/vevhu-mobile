# Supabase JS SDK v2.110.0 - API Reference

## Client Init
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(url, anonKey, { auth: { storage: AsyncStorage, persistSession: true } })

## Database Operations
supabase.from('table').select('*')
supabase.from('table').insert({ col: val })
supabase.from('table').update({ col: val }).eq('id', id)
supabase.from('table').upsert({ col: val }, { onConflict: 'col' })
supabase.from('table').delete().eq('id', id)

## Filters
.eq(), .neq(), .gt(), .lt(), .gte(), .lte()
.like(), .ilike(), .is(), .in()
.contains(), .containedBy()
.or('col.eq.val,col2.eq.val2')
.order('col', { ascending: true })
.limit(10), .range(0, 9)

## Auth
supabase.auth.signUp({ email, password })
supabase.auth.signInWithPassword({ email, password })
supabase.auth.signInWithOtp({ phone })
supabase.auth.getSession()
supabase.auth.getUser()
supabase.auth.signOut()
supabase.auth.onAuthStateChange((event, session) => {})

## Admin Auth (service_role key only)
supabase.auth.admin.createUser({ email, password, email_confirm: true, app_metadata: {} })
supabase.auth.admin.updateUserById(id, { app_metadata: { role: 'worker' } })
supabase.auth.admin.deleteUser(id)
supabase.auth.admin.listUsers()

## Edge Functions
supabase.functions.invoke('function-name', { body: { key: val } })

## Realtime
supabase.channel('room').on('postgres_changes', { event: '*', schema: 'public', table: 'submissions' }, (payload) => {}).subscribe()

## Storage
supabase.storage.from('bucket').upload(path, file)
supabase.storage.from('bucket').getPublicUrl(path)

## All operations return { data, error }
