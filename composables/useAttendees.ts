export interface Attendee {
  id: string
  name: string
  business: string
  sector: string
  website: string | null
  linkedin: string | null
  social: string | null
  photo_url: string | null
  created_at: string
}

export function useAttendees() {
  const supabase = useSupabaseClient()
  const attendees = ref<Attendee[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)

  // Fetch all attendees, ordered by registration time
  async function fetchAttendees() {
    loading.value = true
    error.value = null
    const { data, error: err } = await supabase
      .from('attendees')
      .select('*')
      .order('created_at', { ascending: true })

    if (err) {
      error.value = err.message
    } else {
      attendees.value = data ?? []
    }
    loading.value = false
  }

  // Subscribe to real-time inserts/deletes
  function subscribeRealtime() {
    const channel = supabase
      .channel('attendees-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'attendees' },
        (payload) => {
          attendees.value.push(payload.new as Attendee)
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'attendees' },
        (payload) => {
          attendees.value = attendees.value.filter(a => a.id !== payload.old.id)
        }
      )
      .subscribe()

    return channel
  }

  return { attendees, loading, error, fetchAttendees, subscribeRealtime }
}
