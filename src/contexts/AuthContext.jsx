import { createContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [impersonando, setImpersonando] = useState(
    () => !!localStorage.getItem('su_accessToken')
  )

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/usuario/login', { email, password })
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post('/usuario/logout')
    } catch {
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      localStorage.removeItem('su_accessToken')
      localStorage.removeItem('su_refreshToken')
      localStorage.removeItem('su_user')
      setUser(null)
      setImpersonando(false)
    }
  }, [])

  const impersonar = useCallback(async (usuarioId) => {
    const { data } = await api.post(`/admin/impersonar/${usuarioId}`)

    localStorage.setItem('su_accessToken', localStorage.getItem('accessToken'))
    localStorage.setItem('su_refreshToken', localStorage.getItem('refreshToken'))
    localStorage.setItem('su_user', localStorage.getItem('user'))

    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
    setImpersonando(true)
    return data
  }, [])

  const encerrarImpersonacao = useCallback(async () => {
    const suAccessToken = localStorage.getItem('su_accessToken')
    if (!suAccessToken) return null

    try {
      await api.post('/usuario/logout', { refreshToken: localStorage.getItem('refreshToken') })
    } catch {
    }

    localStorage.setItem('accessToken', suAccessToken)
    localStorage.setItem('refreshToken', localStorage.getItem('su_refreshToken'))
    localStorage.setItem('user', localStorage.getItem('su_user') || '')
    localStorage.removeItem('su_accessToken')
    localStorage.removeItem('su_refreshToken')
    localStorage.removeItem('su_user')

    const restored = JSON.parse(localStorage.getItem('user') || 'null')
    setUser(restored)
    setImpersonando(false)
    return restored
  }, [])

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated,
        loading,
        impersonar,
        encerrarImpersonacao,
        impersonando,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
