import { createContext, useState, useEffect, useCallback, useContext } from 'react'
import api from '../api/axios'
import { useAuth } from '../hooks/useAuth'

export const OrganizacaoContext = createContext(null)

export function OrganizacaoProvider({ children }) {
  const { user } = useAuth()
  const [org, setOrg] = useState(null)
  const [orgLoading, setOrgLoading] = useState(true)

  const carregarOrg = useCallback(async () => {
    try {
      const { data } = await api.get('/organizacao/me')
      setOrg(data)
    } catch {
      setOrg(null)
    } finally {
      setOrgLoading(false)
    }
  }, [])

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken')
    const isPublicPage = ['/login', '/esqueci-senha', '/redefinir-senha'].some(
      (p) => window.location.pathname.startsWith(p)
    )
    if (!accessToken || isPublicPage) {
      setOrg(null)
      setOrgLoading(false)
      return
    }
    if (user?.papel === 'superadmin') {
      setOrg(null)
      setOrgLoading(false)
      return
    }
    carregarOrg()
  }, [user?._id, user?.papel, carregarOrg])

  const atualizarOrg = useCallback(async (updates) => {
    const { data } = await api.patch('/organizacao/me', updates)
    setOrg(data)
    return data
  }, [])

  return (
    <OrganizacaoContext.Provider value={{ org, orgLoading, atualizarOrg, carregarOrg }}>
      {children}
    </OrganizacaoContext.Provider>
  )
}

export function useOrg() {
  const ctx = useContext(OrganizacaoContext)
  if (!ctx) throw new Error('useOrg must be used within OrganizacaoProvider')
  return ctx
}
