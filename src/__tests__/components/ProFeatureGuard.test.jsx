import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import ProFeatureGuard from '../../components/ProFeatureGuard'

vi.mock('../../contexts/OrganizacaoContext', () => ({
  useOrg: vi.fn(),
}))

import { useOrg } from '../../contexts/OrganizacaoContext'

function renderGuard(org, orgLoading = false) {
  useOrg.mockReturnValue({ org, orgLoading })
  return render(
    <MemoryRouter initialEntries={['/calculos']}>
      <Routes>
        <Route
          path="/calculos"
          element={<ProFeatureGuard><div data-testid="feature">Conteúdo protegido</div></ProFeatureGuard>}
        />
        <Route path="/organizacao" element={<div>Organização</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ProFeatureGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza o conteúdo quando cálculos estão habilitados', () => {
    renderGuard({ config_limites: { calculos_habilitados: true } })
    expect(screen.getByTestId('feature')).toBeInTheDocument()
  })

  it('exibe aviso e não renderiza o conteúdo quando cálculos estão bloqueados', () => {
    renderGuard({ config_limites: { calculos_habilitados: false } })
    expect(screen.queryByTestId('feature')).not.toBeInTheDocument()
    expect(screen.getByText(/Recurso disponível/i)).toBeInTheDocument()
    expect(screen.getByText('Ver planos')).toBeInTheDocument()
  })

  it('exibe aviso quando não há organização vinculada', () => {
    renderGuard(null)
    expect(screen.queryByTestId('feature')).not.toBeInTheDocument()
    expect(screen.getByText('Ver planos')).toBeInTheDocument()
  })
})
