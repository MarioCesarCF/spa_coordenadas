import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import EmpresaLista from '../../pages/EmpresaLista'

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
    delete: vi.fn(),
  },
}))

import api from '../../api/axios'

const empresasMock = [
  {
    _id: '1',
    nome: 'Empresa Alpha',
    numero_documento: '12.345.678/0001-90',
    cidade: 'São Paulo',
    numero_processo: 'Proc001',
    decisao: 'deferido',
  },
  {
    _id: '2',
    nome: 'Empresa Beta',
    numero_documento: '98.765.432/0001-10',
    cidade: 'Rio de Janeiro',
    numero_processo: '',
    decisao: 'em_analise',
  },
]

function renderLista() {
  return render(
    <MemoryRouter>
      <EmpresaLista />
    </MemoryRouter>
  )
}

describe('EmpresaLista', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza botões e filtros', async () => {
    api.get.mockResolvedValue({ data: [] })
    renderLista()

    expect(screen.getByText('Empresas')).toBeInTheDocument()
    expect(screen.getByText('Nova Empresa')).toBeInTheDocument()
    expect(screen.getByText('Importar Empresas')).toBeInTheDocument()
    expect(screen.getByLabelText('Município')).toBeInTheDocument()
    expect(screen.getByLabelText('Responsável')).toBeInTheDocument()
    expect(screen.getByLabelText('Nº Processo')).toBeInTheDocument()
    await waitFor(() => {})
  })

  it('mostra "Nenhuma empresa encontrada" quando vazio', async () => {
    api.get.mockResolvedValue({ data: [] })
    renderLista()
    await waitFor(() => {
      expect(screen.getByText('Nenhuma empresa encontrada.')).toBeInTheDocument()
    })
  })

  it('renderiza empresas na tabela', async () => {
    api.get.mockResolvedValue({ data: empresasMock })
    renderLista()
    await waitFor(() => {
      expect(screen.getByText('Empresa Alpha')).toBeInTheDocument()
      expect(screen.getByText('Empresa Beta')).toBeInTheDocument()
      expect(screen.getByText('12.345.678/0001-90')).toBeInTheDocument()
      expect(screen.getByText('Deferido')).toBeInTheDocument()
      expect(screen.getByText('Em análise')).toBeInTheDocument()
    })
  })

  it('exibe "—" quando não há número do processo', async () => {
    api.get.mockResolvedValue({ data: [empresasMock[1]] })
    renderLista()
    await waitFor(() => {
      const cells = screen.getAllByText('—')
      expect(cells.length).toBeGreaterThanOrEqual(1)
    })
  })

  it('navega para nova empresa ao clicar no botão', async () => {
    api.get.mockResolvedValue({ data: [] })
    renderLista()
    await userEvent.click(screen.getByText('Nova Empresa'))
    expect(mockNavigate).toHaveBeenCalledWith('/empresa/nova')
  })

  it('navega para editar ao clicar no ícone de editar', async () => {
    api.get.mockResolvedValue({ data: empresasMock })
    renderLista()
    await waitFor(() => {
      expect(screen.getByText('Empresa Alpha')).toBeInTheDocument()
    })
    const editBtns = screen.getAllByTestId('EditIcon')
    await userEvent.click(editBtns[0])
    expect(mockNavigate).toHaveBeenCalledWith('/empresa/1/editar')
  })

  it('abre diálogo de exclusão ao clicar em deletar', async () => {
    api.get.mockResolvedValue({ data: empresasMock })
    renderLista()
    await waitFor(() => {
      expect(screen.getByText('Empresa Alpha')).toBeInTheDocument()
    })
    const deleteBtns = screen.getAllByTestId('DeleteIcon')
    await userEvent.click(deleteBtns[0])
    expect(screen.getByText('Confirmar exclusão')).toBeInTheDocument()
    expect(screen.getAllByText(/Empresa Alpha/).length).toBeGreaterThanOrEqual(1)
  })

  it('confirma exclusão e recarrega lista', async () => {
    api.get.mockResolvedValue({ data: empresasMock })
    api.delete.mockResolvedValue({})
    renderLista()
    await waitFor(() => {
      expect(screen.getByText('Empresa Alpha')).toBeInTheDocument()
    })
    const deleteBtns = screen.getAllByTestId('DeleteIcon')
    await userEvent.click(deleteBtns[0])
    await userEvent.click(screen.getByText('Excluir'))
    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith('/empresa/1')
    })
  })

  it('cancela exclusão', async () => {
    api.get.mockResolvedValue({ data: empresasMock })
    renderLista()
    await waitFor(() => {
      expect(screen.getByText('Empresa Alpha')).toBeInTheDocument()
    })
    const deleteBtns = screen.getAllByTestId('DeleteIcon')
    await userEvent.click(deleteBtns[0])
    await userEvent.click(screen.getByText('Cancelar'))
    expect(screen.queryByText('Confirmar exclusão')).not.toBeInTheDocument()
  })

  it('aplica filtros e recarrega', async () => {
    api.get.mockResolvedValue({ data: [] })
    renderLista()
    const filterInput = screen.getByLabelText('Município')
    await userEvent.type(filterInput, 'São Paulo')
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/empresa', {
        params: expect.objectContaining({ city: 'São Paulo' }),
      })
    })
  })

  it('mostra botão Limpar filtros quando há filtros ativos', async () => {
    api.get.mockResolvedValue({ data: [] })
    renderLista()
    const filterInput = screen.getByLabelText('Responsável')
    await userEvent.type(filterInput, 'João')
    await waitFor(() => {
      expect(screen.getByText('Limpar filtros')).toBeInTheDocument()
    })
  })

  it('limpa filtros ao clicar em Limpar filtros', async () => {
    api.get.mockResolvedValue({ data: [] })
    renderLista()
    const filterInput = screen.getByLabelText('Responsável')
    await userEvent.type(filterInput, 'João')
    await waitFor(() => {
      expect(screen.getByText('Limpar filtros')).toBeInTheDocument()
    })
    await userEvent.click(screen.getByText('Limpar filtros'))
    expect(filterInput).toHaveValue('')
  })

  it('mostra snackbar de sucesso ao importar', async () => {
    api.get.mockResolvedValue({ data: [] })
    api.post.mockResolvedValueOnce({
      data: { imported: 5, skipped: 1, errors: 0 },
    })
    renderLista()

    const file = new File(['test'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const fileInput = document.querySelector('input[type="file"]')

    if (fileInput) {
      await userEvent.upload(fileInput, file)
      await waitFor(() => {
        expect(screen.getByText('5 importada(s), 1 ignorada(s), 0 erro(s)')).toBeInTheDocument()
      })
    }
  })
})
