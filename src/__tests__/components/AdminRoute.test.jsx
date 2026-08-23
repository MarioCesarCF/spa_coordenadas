import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import AdminRoute from '../../components/AdminRoute'

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

import { useAuth } from '../../hooks/useAuth'

function renderWithRouter(initialRoute = '/admin') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/admin" element={<AdminRoute><div data-testid="admin-content">Painel Admin</div></AdminRoute>} />
        <Route path="/login" element={<div data-testid="login-page">Login</div>} />
        <Route path="/" element={<div data-testid="home-page">Início</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('AdminRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('mostra loading enquanto autenticação carrega', () => {
    useAuth.mockReturnValue({ isAuthenticated: false, loading: true, user: null })
    renderWithRouter()
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('renderiza o conteúdo children quando superadmin', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: { _id: '1', papel: 'superadmin' },
    })
    renderWithRouter()
    expect(screen.getByTestId('admin-content')).toBeInTheDocument()
  })

  it('redireciona para / quando papel não é superadmin', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: { _id: '2', papel: 'admin' },
    })
    renderWithRouter()
    expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument()
    expect(screen.getByTestId('home-page')).toBeInTheDocument()
  })

  it('redireciona para / quando user é null', () => {
    useAuth.mockReturnValue({ isAuthenticated: true, loading: false, user: null })
    renderWithRouter()
    expect(screen.getByTestId('home-page')).toBeInTheDocument()
  })

  it('redireciona para /login quando não autenticado', () => {
    useAuth.mockReturnValue({ isAuthenticated: false, loading: false, user: null })
    renderWithRouter()
    expect(screen.getByTestId('login-page')).toBeInTheDocument()
  })
})
