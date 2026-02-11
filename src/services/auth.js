const BASE_URL = 'http://localhost:8080'
const TOKEN_KEY = 'auth_token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)

export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token)
  window.dispatchEvent(new Event('auth-changed'))
}

export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY)
  window.dispatchEvent(new Event('auth-changed'))
}

export const isLoggedIn = () => Boolean(getToken())

const parseErrorMessage = async (response) => {
  let message = ''

  try {
    const data = await response.clone().json()
    message = data.message || data.error || ''
  } catch {
    // Ignore JSON parsing errors and fall back to text/status.
  }

  if (!message) {
    try {
      message = (await response.text()).trim()
    } catch {
      message = ''
    }
  }

  if (message) return message

  switch (response.status) {
    case 400:
      return '요청 값이 올바르지 않습니다.'
    case 401:
      return '인증에 실패했습니다.'
    case 409:
      return '이미 사용 중인 정보가 있습니다.'
    default:
      return ''
  }
}

export const register = async (payload) => {
  const response = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include',
  })

  if (!response.ok) {
    let message = await parseErrorMessage(response)
    if (!message && response.status === 409) {
      message = '이미 가입된 이메일 또는 아이디입니다.'
    }
    if (!message && response.status === 403) {
      message = '회원가입 요청이 거부되었습니다. 입력 정보를 확인해 주세요.'
    }
    throw new Error(message || '회원가입에 실패했습니다.')
  }

  return response.json()
}

export const login = async (payload) => {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include',
  })

  if (!response.ok) {
    const message = await parseErrorMessage(response)
    throw new Error(message || '로그인에 실패했습니다.')
  }

  return response.json()
}

export const refresh = async () => {
  const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  })

  if (!response.ok) {
    const message = await parseErrorMessage(response)
    throw new Error(message || '세션 갱신에 실패했습니다.')
  }

  return response.json()
}

export const authFetch = async (input, init = {}) => {
  const headers = new Headers(init.headers || {})
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(input, {
    ...init,
    headers,
    credentials: 'include',
  })

  if (response.status !== 401) return response

  try {
    const refreshed = await refresh()
    if (refreshed?.accessToken) setToken(refreshed.accessToken)

    const retryHeaders = new Headers(init.headers || {})
    retryHeaders.set('Authorization', `Bearer ${getToken()}`)

    return fetch(input, {
      ...init,
      headers: retryHeaders,
      credentials: 'include',
    })
  } catch {
    clearToken()
    sessionStorage.setItem('login-message', '토큰이 만료되었습니다.')
    window.location.href = '/login'
    return response
  }
}
