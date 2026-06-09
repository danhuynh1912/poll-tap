import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase, isConfigured } from '../lib/supabase'

export function useVote(voteId) {
  const [vote, setVote] = useState(null)
  const [responses, setResponses] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  // Track whether initial load is done so realtime events refresh silently.
  const initialLoadDone = useRef(false)

  const fetchData = useCallback(async () => {
    const { data: v, error } = await supabase
      .from('votes').select('*').eq('id', voteId).single()
    if (error || !v) {
      setNotFound(true)
      setLoading(false)
      return
    }
    setVote(v)
    const { data: r } = await supabase
      .from('responses').select('*').eq('vote_id', voteId)
      .order('created_at', { ascending: true })
    setResponses(r || [])
    if (!initialLoadDone.current) {
      initialLoadDone.current = true
      setLoading(false)
    }
  }, [voteId])

  // Silent background refresh — never triggers the loading spinner.
  const silentRefresh = useCallback(() => {
    // Skip refresh if the tab is hidden to avoid unnecessary API calls on
    // reconnect when the user switches back to this tab.
    if (document.visibilityState === 'hidden') return
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (!isConfigured) { setLoading(false); setNotFound(true); return }

    initialLoadDone.current = false
    setLoading(true)
    setNotFound(false)
    fetchData()

    const ch = supabase
      .channel(`vote-${voteId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'responses',
        filter: `vote_id=eq.${voteId}`,
      }, silentRefresh)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'votes',
        filter: `id=eq.${voteId}`,
      }, silentRefresh)
      .subscribe()

    return () => { supabase.removeChannel(ch) }
  }, [voteId, fetchData, silentRefresh])

  return { vote, responses, loading, notFound, reload: fetchData }
}
