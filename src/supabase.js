// @ts-nocheck
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ── AUTH ─────────────────────────────────────────────────────────────────────

export async function signUp(email, password, name, primaryRole) {
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { name, primary_role: primaryRole } }
  })
  if (error) throw error
  if (data.user) {
    await supabase.from('profiles').upsert({
      id: data.user.id,
      name,
      primary_role: primaryRole,
      can_work: true,
      can_hire: true,
      active_mode: primaryRole === 'employer' ? 'employer' : 'worker',
      location: 'Kampala',
    })
  }
  return data
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  await supabase.auth.signOut()
}

export async function getProfile(userId) {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
  return data
}

export async function updateProfile(userId, updates) {
  const { data, error } = await supabase.from('profiles').update(updates).eq('id', userId).select().single()
  if (error) throw error
  return data
}

export async function switchMode(userId, mode) {
  const { data, error } = await supabase.from('profiles')
    .update({ active_mode: mode })
    .eq('id', userId)
    .select().single()
  if (error) throw error
  return data
}

// ── JOBS ─────────────────────────────────────────────────────────────────────

export async function fetchJobs(filters = {}) {
  let query = supabase
    .from('jobs')
    .select('*, profiles(name, avatar_url, tasq_score)')
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (filters.category && filters.category !== 'All') query = query.eq('category', filters.category)
  if (filters.type && filters.type !== 'All') query = query.eq('type', filters.type)
  if (filters.search) query = query.ilike('title', `%${filters.search}%`)
  if (filters.location) query = query.ilike('location', `%${filters.location}%`)

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function fetchJobById(id) {
  const { data, error } = await supabase
    .from('jobs').select('*, profiles(name, id, avatar_url, tasq_score)')
    .eq('id', id).single()
  if (error) throw error
  return data
}

export async function postJob(job, userId) {
  const { data, error } = await supabase
    .from('jobs').insert({ ...job, posted_by: userId }).select().single()
  if (error) throw error
  return data
}

export async function fetchMyJobs(userId) {
  const { data } = await supabase
    .from('jobs').select('*, applications(count)')
    .eq('posted_by', userId).order('created_at', { ascending: false })
  return data || []
}

export async function deleteJob(jobId) {
  const { error } = await supabase.from('jobs').delete().eq('id', jobId)
  if (error) throw error
}

export async function closeJob(jobId) {
  const { error } = await supabase.from('jobs').update({ active: false }).eq('id', jobId)
  if (error) throw error
}

// ── WORKERS (browse mode for employers) ───────────────────────────────────────

export async function fetchWorkers(filters = {}) {
  let query = supabase
    .from('profiles')
    .select('*')
    .eq('can_work', true)
    .order('tasq_score', { ascending: false })

  if (filters.category) query = query.contains('skills', [filters.category])
  if (filters.search) query = query.ilike('name', `%${filters.search}%`)
  if (filters.location) query = query.ilike('location', `%${filters.location}%`)

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function fetchWorkerProfile(userId) {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
  return data
}

// ── APPLICATIONS ──────────────────────────────────────────────────────────────

export async function applyToJob(jobId, applicantId, message) {
  const { data, error } = await supabase
    .from('applications')
    .insert({ job_id: jobId, applicant_id: applicantId, message })
    .select().single()
  if (error) throw error
  await supabase.from('jobs')
    .update({ applicant_count: supabase.raw?.('applicant_count + 1') })
    .eq('id', jobId).catch(() => {})
  return data
}

export async function fetchMyApplications(userId) {
  const { data } = await supabase
    .from('applications')
    .select('*, jobs(title, company, location, salary, category)')
    .eq('applicant_id', userId)
    .order('created_at', { ascending: false })
  return data || []
}

export async function fetchJobApplications(jobId) {
  const { data } = await supabase
    .from('applications')
    .select('*, profiles(id, name, location, skills, bio, tasq_score, avatar_url)')
    .eq('job_id', jobId)
    .order('created_at', { ascending: false })
  return data || []
}

export async function updateApplicationStatus(appId, status) {
  const { error } = await supabase.from('applications').update({ status }).eq('id', appId)
  if (error) throw error
}

export async function hasApplied(jobId, userId) {
  const { data } = await supabase.from('applications').select('id')
    .eq('job_id', jobId).eq('applicant_id', userId).single()
  return !!data
}

// ── SAVED JOBS ────────────────────────────────────────────────────────────────

export async function fetchSavedJobs(userId) {
  const { data } = await supabase.from('saved_jobs')
    .select('job_id, jobs(*)').eq('user_id', userId)
  return data?.map(d => ({ ...d.jobs, saved: true })) || []
}

export async function saveJob(userId, jobId) {
  await supabase.from('saved_jobs').upsert({ user_id: userId, job_id: jobId })
}

export async function unsaveJob(userId, jobId) {
  await supabase.from('saved_jobs').delete().match({ user_id: userId, job_id: jobId })
}

export async function fetchSavedJobIds(userId) {
  const { data } = await supabase.from('saved_jobs').select('job_id').eq('user_id', userId)
  return data?.map(d => d.job_id) || []
}

// ── MESSAGES ──────────────────────────────────────────────────────────────────

export async function fetchConversations(userId) {
  const { data } = await supabase.from('messages')
    .select('*, sender:sender_id(name), receiver:receiver_id(name)')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: false })
  return data || []
}

export async function fetchThread(userId, otherId) {
  const { data } = await supabase.from('messages').select('*')
    .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${userId})`)
    .order('created_at', { ascending: true })
  return data || []
}

export async function sendMessage(senderId, receiverId, text, jobId = null) {
  const { data, error } = await supabase.from('messages')
    .insert({ sender_id: senderId, receiver_id: receiverId, text, job_id: jobId })
    .select().single()
  if (error) throw error
  return data
}

export async function markMessagesRead(userId, senderId) {
  await supabase.from('messages').update({ read: true })
    .eq('receiver_id', userId).eq('sender_id', senderId)
}

export async function countUnread(userId) {
  const { count } = await supabase.from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('receiver_id', userId).eq('read', false)
  return count || 0
}

export function subscribeToMessages(userId, callback) {
  return supabase.channel('messages')
    .on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'messages',
      filter: `receiver_id=eq.${userId}`,
    }, callback)
    .subscribe()
}
