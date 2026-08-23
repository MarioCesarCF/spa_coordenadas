import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import AdminPage from '../../../pages/admin/AdminPage'

vi.mock('../../../api/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

import api from '../../../api/axios'
import { useAuth } from '../../../hooks/useAuth'

const orgsMock = [
  {
    _id: 'org1',
    nome: 'Org Alpha',
    slug: 'org-alpha',
    plano: 'free',
    status: 'ativo',
    uso: { empresas: 3, documentos: 0, projetos: 0, usuarios: 2 },
  },
]

const usuariosMock = [
  { _id: 'u1', nome: 'Maria', email: 'maria@test.com', papel: 'admin' },
  { _id: 'u2', nome: 'João', email: 'joao@test.com', papel: 'membro' },
]

const logsMock = [
  {
    _id: 'l1',
    acao: 'login',
    entidade: 'Usuario',
    usuario: { nome: 'Maria', email: 'maria@test.com' },
    organizacao: null,
    criado_em: '2026-08-23T10:00:00Z',
    dados: {},
  },
]

describe('AdminPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuth.mockReturnValue({ impersonar: vi.fn() })
    api.get.mockImplementation((url) => {
      if (url === '/admin/organizacoes') return Promise.resolve({ data: orgsMock })
      if (url === '/admin/usuarios')
        return Promise.resolve({
          data: { total: usuariosMock.length, page: 1, limit: 50, usuarios: usuariosMock },
        })
      if (url === '/admin/audit-logs')
        return Promise.resolve({
          data: { total: logsMock.length, page: 1, limit: 50, logs: logsMock },
        })
      return Promise.resolve({ data: [] })
    })
  })

  it('renderiza título, abas e organizações carregadas', async () => {
    render(<AdminPage />)

    expect(screen.getByText('Administração')).toBeInTheDocument()
    expect(screen.getByRole('tablist')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Organizações' })).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Org Alpha')).toBeInTheDocument()
    })
    expect(screen.getByText('org-alpha')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Nova Organização' })).toBeInTheDocument()
  })

  it('exibe usuários ao abrir a aba Usuários', async () => {
    render(<AdminPage />)
    await waitFor(() => {
      expect(screen.getByText('Org Alpha')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('tab', { name: 'Usuários' }))

    await waitFor(() => {
      expect(screen.getByText('maria@test.com')).toBeInTheDocument()
    })
    expect(screen.getByText('joao@test.com')).toBeInTheDocument()
  })

  it('exibe logs ao abrir a aba Logs de Auditoria', async () => {
    render(<AdminPage />)
    await waitFor(() => {
      expect(screen.getByText('Org Alpha')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('tab', { name: 'Logs de Auditoria' }))

    await waitFor(() => {
      expect(screen.getByText('Maria (maria@test.com)')).toBeInTheDocument()
    })
    expect(screen.getAllByText('Usuario').length).toBeGreaterThan(0)
  })
})
