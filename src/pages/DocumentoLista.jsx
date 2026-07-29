import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box, TextField, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton,
  Typography, TablePagination, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions,
  Tooltip, InputAdornment, Chip, Snackbar, Alert, CircularProgress,
} from '@mui/material'
import { Add, Delete, Edit, Search, Clear, Download, ArrowBack } from '@mui/icons-material'
import api from '../api/axios'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('pt-BR')
}

function getDiasRestantes(dateStr) {
  if (!dateStr) return null
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const venc = new Date(dateStr)
  venc.setHours(0, 0, 0, 0)
  return Math.ceil((venc - hoje) / (1000 * 60 * 60 * 24))
}

function getUrgencia(dias) {
  if (dias === null) return { cor: 'default', label: '' }
  if (dias <= 0) return { cor: 'error', label: 'Vencido' }
  if (dias <= 1) return { cor: 'error', label: `Vence amanhã` }
  if (dias <= 7) return { cor: 'warning', label: `${dias} dias` }
  if (dias <= 15) return { cor: 'warning', label: `${dias} dias` }
  return { cor: 'success', label: `${dias} dias` }
}

export default function DocumentoLista() {
  const { empresaId } = useParams()
  const navigate = useNavigate()

  const [documentos, setDocumentos] = useState([])
  const [loading, setLoading] = useState(false)
  const [empresaNome, setEmpresaNome] = useState('')
  const [filters, setFilters] = useState({ nome: '', empresa: '', vencimentoAte: '' })
  const [page, setPage] = useState(0)
  const [rowsPerPage] = useState(20)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, nome: '' })
  const [snack, setSnack] = useState({ open: false, severity: 'success', message: '' })

  const fetchDocumentos = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.nome) params.nome = filters.nome
      if (filters.empresa && !empresaId) params.empresa = filters.empresa
      if (filters.vencimentoAte) params.vencimento_ate = filters.vencimentoAte
      if (empresaId) params.empresa = empresaId

      const { data } = await api.get('/documento', { params })
      setDocumentos(data)
    } catch (err) {
      console.error('Erro ao carregar documentos:', err)
    } finally {
      setLoading(false)
    }
  }, [filters, empresaId])

  useEffect(() => {
    const timer = setTimeout(fetchDocumentos, 300)
    return () => clearTimeout(timer)
  }, [fetchDocumentos])

  useEffect(() => {
    if (empresaId) {
      api.get(`/empresa/${empresaId}`)
        .then(({ data }) => setEmpresaNome(data.nome))
        .catch(() => {})
    }
  }, [empresaId])

  const handleFilterChange = (field) => (e) => {
    setFilters((prev) => ({ ...prev, [field]: e.target.value }))
    setPage(0)
  }

  const clearFilters = () => {
    setFilters({ nome: '', empresa: '', vencimentoAte: '' })
    setPage(0)
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/documento/${deleteDialog.id}`)
      setDeleteDialog({ open: false, id: null, nome: '' })
      setSnack({ open: true, severity: 'success', message: 'Documento removido com sucesso.' })
      fetchDocumentos()
    } catch (err) {
      setSnack({ open: true, severity: 'error', message: 'Erro ao remover documento.' })
    }
  }

  const handleDownload = async (docId) => {
    try {
      const { data } = await api.get(`/documento/${docId}`)
      if (data.url) {
        window.open(data.url, '_blank')
      } else {
        window.open(`${api.defaults.baseURL}/documento/${docId}/download`, '_blank')
      }
    } catch (err) {
      setSnack({ open: true, severity: 'error', message: 'Erro ao baixar documento.' })
    }
  }

  const hasFilters = filters.nome || filters.vencimentoAte

  return (
    <Box>
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'stretch', sm: 'center' },
        gap: 1.5,
        mb: 2,
      }}>
        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
          {empresaId && (
            <Button startIcon={<ArrowBack />} onClick={() => navigate('/')}>Empresas</Button>
          )}
          <Typography variant="h5" fontWeight="600">
            {empresaNome ? `Documentos — ${empresaNome}` : 'Documentos'}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />}
          onClick={() => navigate(`/documento/novo${empresaId ? `?empresa=${empresaId}` : ''}`)}
          sx={{ whiteSpace: 'nowrap', flex: { xs: 1, sm: 'none' } }}>
          Novo Documento
        </Button>
      </Box>

      <Box display="flex" gap={2} mb={2} flexWrap="wrap" alignItems="center"
        sx={{
          flexDirection: { xs: 'column', sm: 'row' },
          '& .MuiTextField-root': { width: { xs: '100%', sm: 'auto' } },
        }}>
        <TextField label="Nome do Documento" size="small" value={filters.nome}
          onChange={handleFilterChange('nome')} sx={{ minWidth: { xs: '100%', sm: 200 } }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> } }} />
        <TextField label="Vencendo até" type="date" size="small" value={filters.vencimentoAte}
          onChange={handleFilterChange('vencimentoAte')} sx={{ minWidth: { xs: '100%', sm: 200 } }}
          slotProps={{ inputLabel: { shrink: true } }} />
        {hasFilters && <Button size="small" onClick={clearFilters} startIcon={<Clear />}>Limpar filtros</Button>}
      </Box>

      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><strong>Nome</strong></TableCell>
              {!empresaId && <TableCell><strong>Empresa</strong></TableCell>}
              <TableCell><strong>Tipo</strong></TableCell>
              <TableCell><strong>Tamanho</strong></TableCell>
              <TableCell><strong>Vencimento</strong></TableCell>
              <TableCell align="center"><strong>Ações</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && documentos.length === 0 ? (
              <TableRow><TableCell colSpan={empresaId ? 5 : 6} align="center"><CircularProgress size={24} sx={{ my: 2 }} /></TableCell></TableRow>
            ) : documentos.length === 0 ? (
              <TableRow><TableCell colSpan={empresaId ? 5 : 6} align="center">Nenhum documento encontrado.</TableCell></TableRow>
            ) : (
              documentos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((doc) => {
                const dias = getDiasRestantes(doc.data_vencimento)
                const urg = getUrgencia(dias)
                return (
                  <TableRow key={doc._id} hover>
                    <TableCell>{doc.nome}</TableCell>
                    {!empresaId && <TableCell>{doc.empresa?.nome || '—'}</TableCell>}
                    <TableCell>{doc.tipo_arquivo?.split('/').pop()?.toUpperCase() || '—'}</TableCell>
                    <TableCell>
                      {doc.tamanho ? `${(doc.tamanho / 1024 / 1024).toFixed(2)} MB` : '—'}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        {formatDate(doc.data_vencimento)}
                        {urg.cor !== 'default' && (
                          <Chip label={urg.label} size="small" color={urg.cor} variant="outlined" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Download">
                        <IconButton size="small" onClick={() => handleDownload(doc._id)}>
                          <Download fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => navigate(`/documento/${doc._id}/editar${empresaId ? `?empresa=${empresaId}` : ''}`)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton size="small" color="error"
                          onClick={() => setDeleteDialog({ open: true, id: doc._id, nome: doc.nome })}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
        <TablePagination component="div" count={documentos.length} page={page}
          onPageChange={(_, newPage) => setPage(newPage)} rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[rowsPerPage]} labelRowsPerPage="Linhas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`} />
      </TableContainer>

      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null, nome: '' })}>
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir o documento <strong>{deleteDialog.nome}</strong>?
            Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, id: null, nome: '' })}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Excluir</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={6000}
        onClose={() => setSnack((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.severity}
          onClose={() => setSnack((prev) => ({ ...prev, open: false }))}
          sx={{ width: '100%' }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
