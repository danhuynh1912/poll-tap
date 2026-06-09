import { uuid } from './utils'

export function getDeviceUser() {
  let id = localStorage.getItem('polltap_anonymous_user_id')
  if (!id) {
    id = uuid()
    localStorage.setItem('polltap_anonymous_user_id', id)
  }
  const name = localStorage.getItem('polltap_user_name') || ''
  return { id, name }
}

export function setDeviceName(name) {
  localStorage.setItem('polltap_user_name', name)
}

export function getAdminToken(voteId) {
  try {
    const store = JSON.parse(localStorage.getItem('polltap_admin_tokens') || '{}')
    return store[voteId] || null
  } catch {
    return null
  }
}

export function saveAdminToken(voteId, token) {
  try {
    const store = JSON.parse(localStorage.getItem('polltap_admin_tokens') || '{}')
    store[voteId] = token
    localStorage.setItem('polltap_admin_tokens', JSON.stringify(store))
  } catch {}
}
