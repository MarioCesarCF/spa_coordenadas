import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import PrivateRoute from '../../components/PrivateRoute'

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

import { useAuth } from '../../hooks/useAuth'

function renderWithRouter(initialRoute = '/') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<div data-testid="protected-content">Dashboard</div>} />
        </Route>
        <Route path="/login" element={<div data-testid="login-page">Login</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('PrivateRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('mostra loading enquanto autenticação carrega', () => {
    useAuth.mockReturnValue({ isAuthenticated: false, loading: true })
    renderWithRouter()
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('renderiza conteúdo protegido quando autenticado', () => {
    useAuth.mockReturnValue({ isAuthenticated: true, loading: false })
    renderWithRouter()
    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
  })

  it('redireciona para /login quando não autenticado', () => {
    useAuth.mockReturnValue({ isAuthenticated: false, loading: false })
    renderWithRouter()
    expect(screen.getByTestId('login-page')).toBeInTheDocument()
  })
})
