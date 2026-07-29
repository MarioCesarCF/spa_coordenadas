import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import Layout from '../../components/Layout'

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../../contexts/OrganizacaoContext', () => ({
  useOrg: vi.fn(),
}))

import { useAuth } from '../../hooks/useAuth'
import { useOrg } from '../../contexts/OrganizacaoContext'

function renderWithRouter(ui) {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route element={ui}>
          <Route path="/" element={<div data-testid="page-content">Content</div>} />
        </Route>
        <Route path="/login" element={<div data-testid="login-page">Login</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useOrg.mockReturnValue({ org: null, orgLoading: false })
  })

  it('renderiza toolbar com nome do sistema', () => {
    useAuth.mockReturnValue({
      user: { nome: 'João Silva' },
      logout: vi.fn(),
    })
    renderWithRouter(<Layout />)
    expect(screen.getByText('Sylven')).toBeInTheDocument()
    expect(screen.getByText('Empresas')).toBeInTheDocument()
    expect(screen.getByText('Documentos')).toBeInTheDocument()
    expect(screen.getByText('Organização')).toBeInTheDocument()
  })

  it('renderiza conteúdo da página filha', () => {
    useAuth.mockReturnValue({
      user: { nome: 'Admin' },
      logout: vi.fn(),
    })
    renderWithRouter(<Layout />)
    expect(screen.getByTestId('page-content')).toBeInTheDocument()
  })

  it('chama logout e navega para /login ao clicar em Sair', async () => {
    const mockLogout = vi.fn()
    useAuth.mockReturnValue({
      user: { nome: 'Admin' },
      logout: mockLogout,
    })
    renderWithRouter(<Layout />)

    const avatar = screen.getByText('A')
    await userEvent.click(avatar)
    const sair = screen.getByText('Sair')
    await userEvent.click(sair)
    expect(mockLogout).toHaveBeenCalledTimes(1)
  })
})
