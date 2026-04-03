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
      id: data.user.id, name,
      primary_role: primaryRole,
      can_work: true, can_hire: true,
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

export async function signOut() { await supabase.auth.signOut() }

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
  const { data, error } = await supabase.from('profiles').update({ active_mode: mode }).eq('id', userId).select().single()
  if (error) throw error
  return data
}

// ── IMAGE UPLOAD ──────────────────────────────────────────────────────────────

export async function uploadImage(file, path) {
  const ext = file.name.split('.').pop()
  const fileName = `${path}/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('tasqnow').upload(fileName, file, { upsert: true })
  if (error) throw error
  const { data } = supabase.storage.from('tasqnow').getPublicUrl(fileName)
  return data.publicUrl
}

// ── WORKER PROFILE ────────────────────────────────────────────────────────────

export async function fetchFullProfile(userId) {
  const [profile, portfolio, workHistory, certifications, recommendations, ratings] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('portfolio').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('work_history').select('*').eq('user_id', userId).order('start_date', { ascending: false }),
    supabase.from('certifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('recommendations').select('*').eq('worker_id', userId).order('created_at', { ascending: false }),
    supabase.from('ratings').select('*').eq('rated_id', userId).order('created_at', { ascending: false }),
  ])
  return {
    ...profile.data,
    portfolio: portfolio.data || [],
    workHistory: workHistory.data || [],
    certifications: certifications.data || [],
    recommendations: recommendations.data || [],
    ratings: ratings.data || [],
  }
}

// ── PORTFOLIO ─────────────────────────────────────────────────────────────────

export async function addPortfolioPhoto(userId, imageUrl, caption, category) {
  const { data, error } = await supabase.from('portfolio')
    .insert({ user_id: userId, image_url: imageUrl, caption, category }).select().single()
  if (error) throw error
  return data
}

export async function deletePortfolioPhoto(photoId) {
  const { error } = await supabase.from('portfolio').delete().eq('id', photoId)
  if (error) throw error
}

// ── WORK HISTORY ──────────────────────────────────────────────────────────────

export async function addWorkHistory(userId, entry) {
  const { data, error } = await supabase.from('work_history')
    .insert({ user_id: userId, ...entry }).select().single()
  if (error) throw error
  return data
}

export async function deleteWorkHistory(id) {
  const { error } = await supabase.from('work_history').delete().eq('id', id)
  if (error) throw error
}

// ── CERTIFICATIONS ────────────────────────────────────────────────────────────

export async function addCertification(userId, cert) {
  const { data, error } = await supabase.from('certifications')
    .insert({ user_id: userId, ...cert }).select().single()
  if (error) throw error
  return data
}

export async function deleteCertification(id) {
  const { error } = await supabase.from('certifications').delete().eq('id', id)
  if (error) throw error
}

// ── RECOMMENDATIONS ───────────────────────────────────────────────────────────

export async function addRecommendation(workerId, recommenderId, recommenderName, recommenderRole, text, rating) {
  const { data, error } = await supabase.from('recommendations')
    .insert({ worker_id: workerId, recommender_id: recommenderId, recommender_name: recommenderName, recommender_role: recommenderRole, text, rating })
    .select().single()
  if (error) throw error
  return data
}

// ── TASQSCORE CALCULATOR ──────────────────────────────────────────────────────

export async function recalculateTasqScore(userId) {
  const profile = await fetchFullProfile(userId)
  let score = 0

  // ID verified
  if (profile.is_id_verified) score += 20

  // Phone verified
  if (profile.phone) score += 10

  // Profile completeness
  if (profile.avatar_url) score += 5
  if (profile.bio && profile.bio.length > 20) score += 5
  if (profile.skills && profile.skills.length > 0) score += 5
  if (profile.location) score += 5

  // Portfolio photos
  if (profile.portfolio.length >= 1) score += 5
  if (profile.portfolio.length >= 3) score += 5

  // Certifications
  if (profile.certifications.length > 0) score += 10

  // Work history
  if (profile.workHistory.length > 0) score += 5

  // Ratings
  if (profile.ratings.length > 0) {
    const avg = profile.ratings.reduce((s, r) => s + r.score, 0) / profile.ratings.length
    score += Math.round(avg * 4) // max 20 points
    score += Math.min(profile.ratings.length * 2, 10) // up to 10 for volume
  }

  // Recommendations
  if (profile.recommendations.length > 0) score += 5

  score = Math.min(score, 100)

  await supabase.from('profiles').update({ tasq_score: score, total_jobs: profile.ratings.length }).eq('id', userId)
  return score
}

// ── JOBS ──────────────────────────────────────────────────────────────────────

export async function fetchJobs(filters = {}) {
  let query = supabase.from('jobs')
    .select('*, profiles(name, avatar_url, tasq_score)')
    .eq('active', true).order('created_at', { ascending: false })

  if (filters.category && filters.category !== 'All') query = query.eq('category', filters.category)
  if (filters.type && filters.type !== 'All') query = query.eq('type', filters.type)
  if (filters.search) query = query.ilike('title', `%${filters.search}%`)
  if (filters.location) query = query.ilike('location', `%${filters.location}%`)

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function postJob(job, userId) {
  const { data, error } = await supabase.from('jobs').insert({ ...job, posted_by: userId }).select().single()
  if (error) throw error
  return data
}

export async function fetchMyJobs(userId) {
  const { data } = await supabase.from('jobs').select('*, applications(count)')
    .eq('posted_by', userId).order('created_at', { ascending: false })
  return data || []
}

// ── WORKERS ───────────────────────────────────────────────────────────────────

export async function fetchWorkers(filters = {}) {
  let query = supabase.from('profiles').select('*').eq('can_work', true).order('tasq_score', { ascending: false })
  if (filters.search) query = query.ilike('name', `%${filters.search}%`)
  if (filters.location) query = query.ilike('location', `%${filters.location}%`)
  const { data, error } = await query
  if (error) throw error
  return data || []
}

// ── APPLICATIONS ──────────────────────────────────────────────────────────────

export async function applyToJob(jobId, applicantId, message) {
  const { data, error } = await supabase.from('applications')
    .insert({ job_id: jobId, applicant_id: applicantId, message }).select().single()
  if (error) throw error
  return data
}

export async function fetchMyApplications(userId) {
  const { data } = await supabase.from('applications')
    .select('*, jobs(title, company, location, salary, category)')
    .eq('applicant_id', userId).order('created_at', { ascending: false })
  return data || []
}

export async function hasApplied(jobId, userId) {
  const { data } = await supabase.from('applications').select('id')
    .eq('job_id', jobId).eq('applicant_id', userId).single()
  return !!data
}

export async function fetchMyJobs2(userId) {
  const { data } = await supabase.from('jobs').select('*, applications(count)')
    .eq('posted_by', userId).order('created_at', { ascending: false })
  return data || []
}

// ── SAVED JOBS ────────────────────────────────────────────────────────────────

export async function fetchSavedJobs(userId) {
  const { data } = await supabase.from('saved_jobs').select('job_id, jobs(*)').eq('user_id', userId)
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
    .insert({ sender_id: senderId, receiver_id: receiverId, text, job_id: jobId }).select().single()
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
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${userId}` }, callback)
    .subscribe()
}
