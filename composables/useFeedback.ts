export interface FeedbackQuestion {
  id: string
  order_num: number
  question_text: string
  question_type: 'word' | 'rating' | 'text' | 'radio'
  options: string[] | null
  required: boolean
  allow_multiple: boolean
}

export interface FeedbackResponse {
  id: string
  answers: Record<string, string>
  created_at: string
}

export function useFeedback() {
  const supabase = useSupabaseClient()
  const questions = ref<FeedbackQuestion[]>([])
  const responses = ref<FeedbackResponse[]>([])
  const loading = ref(true)

  async function fetchQuestions() {
    loading.value = true
    const { data } = await supabase
      .from('feedback_questions')
      .select('*')
      .order('order_num')
    questions.value = (data ?? []).map(q => ({
      ...q,
      allow_multiple: q.allow_multiple ?? false,
    }))
    loading.value = false
  }

  async function fetchResponses() {
    const { data } = await supabase
      .from('feedback_responses')
      .select('*')
      .order('created_at')
    responses.value = data ?? []
  }

  async function submitResponse(answers: Record<string, string>) {
    const { error } = await supabase
      .from('feedback_responses')
      .insert({ answers })
    return error
  }

  async function updateQuestion(
    id: string,
    question_text: string,
    options?: string[] | null,
    allow_multiple?: boolean
  ) {
    const payload: Record<string, any> = { question_text }
    if (options !== undefined) payload.options = options
    if (allow_multiple !== undefined) payload.allow_multiple = allow_multiple

    const { error } = await supabase
      .from('feedback_questions')
      .update(payload)
      .eq('id', id)
    return error
  }

  // Subscribe to new responses in real time
  function subscribeResponses() {
    const channel = supabase
      .channel('feedback-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'feedback_responses' },
        (payload) => {
          responses.value.push(payload.new as FeedbackResponse)
        }
      )
      .subscribe()
    return channel
  }

  // Extract word cloud data from the word-type question
  function getWordCloudData(): Record<string, number> {
    const wordQuestion = questions.value.find(q => q.question_type === 'word')
    if (!wordQuestion) return {}
    const counts: Record<string, number> = {}
    responses.value.forEach(r => {
      const word = r.answers[wordQuestion.id]?.trim().toLowerCase()
      if (word) counts[word] = (counts[word] || 0) + 1
    })
    return counts
  }

  return {
    questions,
    responses,
    loading,
    fetchQuestions,
    fetchResponses,
    submitResponse,
    updateQuestion,
    subscribeResponses,
    getWordCloudData,
  }
}
