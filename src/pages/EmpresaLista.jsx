import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
  InputAdornment,
  Grid,
} from '@mui/material'
import {
  Add,
  Edit,
  Delete,
  Search,
  Clear,
  Visibility,
  ArrowBack,
} from '@mui/icons-material'
import api from '../api/axios'

export default function EmpresaLista() {
  const [empresas, setEmpresas] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({ cidade: '', responsavel: '', numero_processo: '' })
  const [page, setPage] = useState(0)
  const [rowsPerPage] = useState(20)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, nome: '' })
  const [detailEmpresa, setDetailEmpresa] = useState(null)
  const navigate = useNavigate()

  const fetchEmpresas = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.cidade) params.city = filters.cidade
      if (filters.responsavel) params.name = filters.responsavel
      if (filters.numero_processo) params.numero_processo = filters.numero_processo

      const { data } = await api.get('/empresa', { params })
      setEmpresas(data)
    } catch (err) {
      console.error('Erro ao carregar empresas:', err)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    const timer = setTimeout(fetchEmpresas, 300)
    return () => clearTimeout(timer)
  }, [fetchEmpresas])

  const handleFilterChange = (field) => (e) => {
    setFilters((prev) => ({ ...prev, [field]: e.target.value }))
    setPage(0)
  }

  const clearFilters = () => {
    setFilters({ cidade: '', responsavel: '', numero_processo: '' })
    setPage(0)
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/empresa/${deleteDialog.id}`)
      setDeleteDialog({ open: false, id: null, nome: '' })
      fetchEmpresas()
    } catch (err) {
      console.error('Erro ao deletar empresa:', err)
    }
  }

  const formatDecisao = (decisao) => {
    if (!decisao) return '—'
    const map = {
      deferido: 'Deferido',
      indeferido: 'Indeferido',
      em_analise: 'Em análise',
      'em análise': 'Em análise',
    }
    return map[decisao.toLowerCase()] || decisao
  }

  const hasFilters = filters.cidade || filters.responsavel || filters.numero_processo

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="600">
          Empresas
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/empresa/nova')}
        >
          Nova Empresa
        </Button>
      </Box>

      <Box
        display="flex"
        gap={2}
        mb={2}
        flexWrap="wrap"
        alignItems="center"
      >
        <TextField
          label="Município"
          size="small"
          value={filters.cidade}
          onChange={handleFilterChange('cidade')}
          sx={{ minWidth: 200 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>
              ),
            },
          }}
        />
        <TextField
          label="Responsável"
          size="small"
          value={filters.responsavel}
          onChange={handleFilterChange('responsavel')}
          sx={{ minWidth: 200 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>
              ),
            },
          }}
        />
        <TextField
          label="Nº Processo"
          size="small"
          value={filters.numero_processo}
          onChange={handleFilterChange('numero_processo')}
          sx={{ minWidth: 200 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>
              ),
            },
          }}
        />
        {hasFilters && (
          <Button
            size="small"
            onClick={clearFilters}
            startIcon={<Clear />}
          >
            Limpar filtros
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><strong>Nome</strong></TableCell>
              <TableCell><strong>Documento</strong></TableCell>
              <TableCell><strong>Cidade</strong></TableCell>
              <TableCell><strong>Nº Processo</strong></TableCell>
              <TableCell><strong>Decisão</strong></TableCell>
              <TableCell align="center"><strong>Ações</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && empresas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : empresas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Nenhuma empresa encontrada.
                </TableCell>
              </TableRow>
            ) : (
              empresas
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((emp) => (
                  <TableRow key={emp._id} hover>
                    <TableCell>{emp.nome}</TableCell>
                    <TableCell>{emp.numero_documento}</TableCell>
                    <TableCell>{emp.cidade}</TableCell>
                    <TableCell>{emp.numero_processo || '—'}</TableCell>
                    <TableCell>{formatDecisao(emp.decisao)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Visualizar">
                        <IconButton
                          size="small"
                          onClick={() => setDetailEmpresa(emp)}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/empresa/${emp._id}/editar`)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() =>
                            setDeleteDialog({ open: true, id: emp._id, nome: emp.nome })
                          }
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={empresas.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[rowsPerPage]}
          labelRowsPerPage="Linhas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </TableContainer>

      <Dialog
        open={!!detailEmpresa}
        onClose={() => setDetailEmpresa(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{detailEmpresa?.nome}</Typography>
            <IconButton onClick={() => setDetailEmpresa(null)} size="small">
              <Clear />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {detailEmpresa && (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">Nome</Typography>
                <Typography>{detailEmpresa.nome}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">Nº Documento</Typography>
                <Typography>{detailEmpresa.numero_documento}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">Cidade</Typography>
                <Typography>{detailEmpresa.cidade}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">Local de Intervenção</Typography>
                <Typography>{detailEmpresa.local_intervencao || '—'}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">Nº Processo</Typography>
                <Typography>{detailEmpresa.numero_processo || '—'}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">Modalidade</Typography>
                <Typography>{detailEmpresa.modalidade || '—'}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="caption" color="text.secondary">Ano</Typography>
                <Typography>{detailEmpresa.ano || '—'}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="caption" color="text.secondary">Mês</Typography>
                <Typography>{detailEmpresa.mes || '—'}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="caption" color="text.secondary">Decisão</Typography>
                <Typography>{formatDecisao(detailEmpresa.decisao)}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">Bioma</Typography>
                <Typography>{detailEmpresa.bioma || '—'}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">Área Autorizada (ha)</Typography>
                <Typography>{detailEmpresa.area_autorizada ?? '—'}</Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" sx={{ mt: 1, mb: 0.5 }} color="text.secondary">
                  Coordenadas
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="caption" color="text.secondary">Coordenada X (UTM)</Typography>
                <Typography>{detailEmpresa.coordenada_x ?? '—'}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="caption" color="text.secondary">Longitude (WGS84)</Typography>
                <Typography>{detailEmpresa.longitude ?? '—'}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="caption" color="text.secondary">Fuso</Typography>
                <Typography>{detailEmpresa.fuso || '—'}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="caption" color="text.secondary">Coordenada Y (UTM)</Typography>
                <Typography>{detailEmpresa.coordenada_y ?? '—'}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="caption" color="text.secondary">Latitude (WGS84)</Typography>
                <Typography>{detailEmpresa.latitude ?? '—'}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailEmpresa(null)} startIcon={<ArrowBack />}>
            Voltar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null, nome: '' })}>
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir a empresa <strong>{deleteDialog.nome}</strong>?
            Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, id: null, nome: '' })}>
            Cancelar
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
