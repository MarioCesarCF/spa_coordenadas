import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import EmpresaForm from '../../pages/EmpresaForm'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('../../api/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}))

import api from '../../api/axios'

const empresaData = {
  _id: 'abc123',
  nome: 'Empresa Editada',
  numero_documento: '11.111.111/0001-11',
  cidade: 'Belo Horizonte',
  local_intervencao: 'Fazenda Boa Vista',
  modalidade: 'Supressão',
  numero_processo: 'Proc2024',
  ano: 2024,
  mes: 'Janeiro',
  decisao: 'deferido',
  bioma: 'Mata Atlântica',
  area_autorizada: 150.5,
  coordenada_x: 500000,
  longitude: -43.9378,
  coordenada_y: 7800000,
  latitude: -19.9281,
  fuso: '23K',
}

function renderForm(route = '/empresa/nova') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/empresa/nova" element={<EmpresaForm />} />
        <Route path="/empresa/:id/editar" element={<EmpresaForm />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('EmpresaForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('modo criação', () => {
    it('renderiza formulário vazio com título "Nova Empresa"', () => {
      renderForm()
      expect(screen.getByText('Nova Empresa')).toBeInTheDocument()
      expect(screen.getByLabelText('Nome')).toHaveValue('')
      expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument()
    })

    it('renderiza mapa', () => {
      renderForm()
      expect(screen.getByTestId('map-container')).toBeInTheDocument()
    })

    it('submete formulário com sucesso e redireciona', async () => {
      api.post.mockResolvedValue({ data: { _id: 'new-id' } })
      renderForm()

      await userEvent.type(screen.getByLabelText('Nome'), 'Nova Empresa')
      await userEvent.type(screen.getByLabelText('Nº Documento'), '11.111.111/0001-11')
      await userEvent.type(screen.getByLabelText('Cidade'), 'São Paulo')

      await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))

      await waitFor(() => {
        expect(api.post).toHaveBeenCalled()
        expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
      })
    })

    it('mostra erro quando submissão falha', async () => {
      api.post.mockRejectedValue({
        response: { data: { message: 'Dados inválidos' } },
      })
      renderForm()

      await userEvent.type(screen.getByLabelText('Nome'), 'Nova Empresa')
      await userEvent.type(screen.getByLabelText('Nº Documento'), '11.111.111/0001-11')
      await userEvent.type(screen.getByLabelText('Cidade'), 'São Paulo')

      await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))

      await waitFor(() => {
        expect(screen.getByText('Dados inválidos')).toBeInTheDocument()
      })
    })

    it('mostra "Salvando..." enquanto salva', async () => {
      api.post.mockImplementation(() => new Promise(() => {}))
      renderForm()

      await userEvent.type(screen.getByLabelText('Nome'), 'Nova Empresa')
      await userEvent.type(screen.getByLabelText('Nº Documento'), '11.111.111/0001-11')
      await userEvent.type(screen.getByLabelText('Cidade'), 'São Paulo')

      await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))

      expect(await screen.findByText('Salvando...')).toBeInTheDocument()
    })

    it('navega para / ao clicar em Cancelar', async () => {
      renderForm()
      await userEvent.click(screen.getByText('Cancelar'))
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })

    it('navega para / ao clicar em Voltar', async () => {
      renderForm()
      await userEvent.click(screen.getByText('Voltar'))
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  describe('modo edição', () => {
    it('renderiza "Editar Empresa" e carrega dados', async () => {
      api.get.mockResolvedValue({ data: empresaData })
      renderForm('/empresa/abc123/editar')

      await waitFor(() => {
        expect(screen.getByText('Editar Empresa')).toBeInTheDocument()
        expect(screen.getByLabelText('Nome')).toHaveValue('Empresa Editada')
        expect(screen.getByLabelText('Cidade')).toHaveValue('Belo Horizonte')
        expect(screen.getByLabelText('Nº Processo')).toHaveValue('Proc2024')
      })
    })

    it('submete edição com PATCH', async () => {
      api.get.mockResolvedValue({ data: empresaData })
      api.patch.mockResolvedValue({})
      renderForm('/empresa/abc123/editar')

      await waitFor(() => {
        expect(screen.getByLabelText('Nome')).toHaveValue('Empresa Editada')
      })

      await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))

      await waitFor(() => {
        expect(api.patch).toHaveBeenCalledWith('/empresa/abc123', expect.any(Object))
        expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
      })
    })

    it('mostra erro ao carregar empresa', async () => {
      api.get.mockRejectedValue(new Error('Not found'))
      renderForm('/empresa/abc123/editar')

      await waitFor(() => {
        expect(screen.getByText('Erro ao carregar dados da empresa.')).toBeInTheDocument()
      })
    })
  })
})
