import { useState, useEffect, useCallback, useRef } from 'react'

export function useRouter() {
  const [path, setPath] = useState(window.location.pathname)
  const [search, setSearch] = useState(window.location.search)
  const toastTimer = useRef(null)
  const [toastMsg, setToastMsg] = useState(null)

  const go = useCallback((to) => {
    const url = new URL(to, window.location.origin)
    window.history.pushState({}, '', url)
    setPath(url.pathname)
    setSearch(url.search)
    window.scrollTo({ top: 0 })
  }, [])

  useEffect(() => {
    const onPop = () => {
      setPath(window.location.pathname)
      setSearch(window.location.search)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const toast = useCallback((msg) => {
    setToastMsg(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastMsg(null), 2600)
  }, [])

  const voteMatch = path.match(/^\/vote\/([^/]+)\/?$/)
  const adminToken = new URLSearchParams(search).get('token')

  return { path, go, toast, toastMsg, voteMatch, adminToken }
}
