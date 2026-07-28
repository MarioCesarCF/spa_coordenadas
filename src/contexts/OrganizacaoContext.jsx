import { createContext, useState, useEffect, useCallback, useContext } from 'react'
import api from '../api/axios'

export const OrganizacaoContext = createContext(null)

export function OrganizacaoProvider({ children }) {
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
    if (accessToken) {
      carregarOrg()
    } else {
      setOrgLoading(false)
    }
  }, [carregarOrg])

  const criarOrg = useCallback(async (nome, slug) => {
    const { data } = await api.post('/organizacao', { nome, slug })
    setOrg(data)
    return data
  }, [])

  const atualizarOrg = useCallback(async (updates) => {
    const { data } = await api.patch('/organizacao/me', updates)
    setOrg(data)
    return data
  }, [])

  return (
    <OrganizacaoContext.Provider value={{ org, orgLoading, criarOrg, atualizarOrg, carregarOrg }}>
      {children}
    </OrganizacaoContext.Provider>
  )
}

export function useOrg() {
  const ctx = useContext(OrganizacaoContext)
  if (!ctx) throw new Error('useOrg must be used within OrganizacaoProvider')
  return ctx
}
