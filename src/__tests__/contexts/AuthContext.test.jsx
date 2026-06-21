import { render, screen, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { AuthProvider, AuthContext } from '../../contexts/AuthContext'
import { useContext } from 'react'

vi.mock('../../api/axios', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

import api from '../../api/axios'

function TestConsumer() {
  const auth = useContext(AuthContext)
  if (!auth) return <div>No context</div>
  return (
    <div>
      <span data-testid="auth-status">
        {auth.isAuthenticated ? 'authenticated' : 'not-authenticated'}
      </span>
      <span data-testid="loading-status">
        {auth.loading ? 'loading' : 'loaded'}
      </span>
      {auth.user && <span data-testid="user-name">{auth.user.nome}</span>}
      <button
        data-testid="login-btn"
        onClick={async () => {
          try {
            await auth.login('a@b.com', '123')
          } catch {}
        }}
      >
        Login
      </button>
      <button data-testid="logout-btn" onClick={() => auth.logout()}>
        Logout
      </button>
    </div>
  )
}

function renderWithProvider() {
  return render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('inicia deslogado e carrega', async () => {
    renderWithProvider()
    await waitFor(() => {
      expect(screen.getByTestId('loading-status').textContent).toBe('loaded')
    })
    expect(screen.getByTestId('auth-status').textContent).toBe('not-authenticated')
  })

  it('restaura sessão do localStorage', async () => {
    localStorage.setItem('accessToken', 'tok')
    localStorage.setItem('refreshToken', 'ref')
    localStorage.setItem('user', JSON.stringify({ nome: 'João' }))
    renderWithProvider()
    await waitFor(() => {
      expect(screen.getByTestId('user-name').textContent).toBe('João')
    })
    expect(screen.getByTestId('auth-status').textContent).toBe('authenticated')
  })

  it('login bem-sucedido salva tokens e atualiza estado', async () => {
    api.post.mockResolvedValueOnce({
      data: {
        accessToken: 'new-tok',
        refreshToken: 'new-ref',
        user: { nome: 'Maria' },
      },
    })
    renderWithProvider()
    await waitFor(() => expect(screen.getByTestId('loading-status').textContent).toBe('loaded'))

    screen.getByTestId('login-btn').click()
    await waitFor(() => {
      expect(screen.getByTestId('user-name').textContent).toBe('Maria')
    })
    expect(screen.getByTestId('auth-status').textContent).toBe('authenticated')
    expect(localStorage.getItem('accessToken')).toBe('new-tok')
    expect(localStorage.getItem('refreshToken')).toBe('new-ref')
    expect(localStorage.getItem('user')).toBe(JSON.stringify({ nome: 'Maria' }))
  })

  it('login falho não altera estado', async () => {
    api.post.mockRejectedValueOnce(new Error('Invalid credentials'))
    renderWithProvider()
    await waitFor(() => expect(screen.getByTestId('loading-status').textContent).toBe('loaded'))

    screen.getByTestId('login-btn').click()
    await waitFor(() => {
      expect(screen.getByTestId('auth-status').textContent).toBe('not-authenticated')
    })
  })

  it('logout limpa localStorage e estado', async () => {
    localStorage.setItem('accessToken', 'tok')
    localStorage.setItem('refreshToken', 'ref')
    localStorage.setItem('user', JSON.stringify({ nome: 'João' }))
    api.post.mockResolvedValueOnce({})

    renderWithProvider()
    await waitFor(() => expect(screen.getByTestId('loading-status').textContent).toBe('loaded'))
    expect(screen.getByTestId('auth-status').textContent).toBe('authenticated')

    screen.getByTestId('logout-btn').click()
    await waitFor(() => {
      expect(screen.getByTestId('auth-status').textContent).toBe('not-authenticated')
    })
    expect(localStorage.getItem('accessToken')).toBeNull()
    expect(localStorage.getItem('refreshToken')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
  })
})
