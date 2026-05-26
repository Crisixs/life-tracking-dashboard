const BASE = '/api'

function getToken() {
  return localStorage.getItem('auth_token')
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }

  return res.json()
}

export const api = {
  login:    (username, password) => request('POST', '/auth/login',    { username, password }),
  register: (username, password) => request('POST', '/auth/register', { username, password }),
  getData:  ()     => request('GET',  '/data'),
  saveData: (data) => request('PUT',  '/data', { data }),
}
