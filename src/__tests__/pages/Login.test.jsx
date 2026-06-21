import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import Login from '../../pages/Login'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

import { useAuth } from '../../hooks/useAuth'

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  )
}

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza formulário de login', () => {
    useAuth.mockReturnValue({ login: vi.fn(), isAuthenticated: false })
    renderLogin()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument()
  })

  it('não renderiza se já autenticado (redirect)', () => {
    useAuth.mockReturnValue({ login: vi.fn(), isAuthenticated: true })
    renderLogin()
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
  })

  it('mostra mensagem de erro quando login falha', async () => {
    const mockLogin = vi.fn().mockRejectedValue({
      response: { data: { message: 'Credenciais inválidas' } },
    })
    useAuth.mockReturnValue({ login: mockLogin, isAuthenticated: false })

    renderLogin()
    await userEvent.type(screen.getByLabelText('Email'), 'a@b.com')
    await userEvent.type(screen.getByLabelText('Senha'), 'wrong')
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(screen.getByText('Credenciais inválidas')).toBeInTheDocument()
    })
  })

  it('mostra mensagem padrão quando erro não tem message', async () => {
    const mockLogin = vi.fn().mockRejectedValue({ response: { data: {} } })
    useAuth.mockReturnValue({ login: mockLogin, isAuthenticated: false })

    renderLogin()
    await userEvent.type(screen.getByLabelText('Email'), 'a@b.com')
    await userEvent.type(screen.getByLabelText('Senha'), 'wrong')
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(
        screen.getByText('Erro ao fazer login. Verifique suas credenciais.')
      ).toBeInTheDocument()
    })
  })

  it('navega para / ao logar com sucesso', async () => {
    const mockLogin = vi.fn().mockResolvedValue({ nome: 'João' })
    useAuth.mockReturnValue({ login: mockLogin, isAuthenticated: false })

    renderLogin()
    await userEvent.type(screen.getByLabelText('Email'), 'admin@test.com')
    await userEvent.type(screen.getByLabelText('Senha'), '123456')
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
    })
  })

  it('desabilita botão enquanto carrega', async () => {
    const mockLogin = vi.fn().mockImplementation(() => new Promise(() => {}))
    useAuth.mockReturnValue({ login: mockLogin, isAuthenticated: false })

    renderLogin()
    await userEvent.type(screen.getByLabelText('Email'), 'a@b.com')
    await userEvent.type(screen.getByLabelText('Senha'), '123')
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByText('Entrando...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Entrando...' })).toBeDisabled()
  })
})
