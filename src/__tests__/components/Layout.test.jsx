import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import Layout from '../../components/Layout'

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

import { useAuth } from '../../hooks/useAuth'

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
  })

  it('renderiza toolbar com nome do usuário', () => {
    useAuth.mockReturnValue({
      user: { nome: 'João Silva' },
      logout: vi.fn(),
    })
    renderWithRouter(<Layout />)
    expect(screen.getByText('SPA Coordenadas')).toBeInTheDocument()
    expect(screen.getByText('João Silva')).toBeInTheDocument()
    expect(screen.getByText('Sair')).toBeInTheDocument()
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

    await userEvent.click(screen.getByText('Sair'))
    expect(mockLogout).toHaveBeenCalledTimes(1)
  })
})
