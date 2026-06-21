import { useState, useEffect, useCallback, useRef } from 'react'
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
  Snackbar,
  Alert,
} from '@mui/material'
import {
  Add,
  Edit,
  Delete,
  Search,
  Clear,
  FileUpload,
} from '@mui/icons-material'
import api from '../api/axios'

export default function EmpresaLista() {
  const [empresas, setEmpresas] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({ cidade: '', responsavel: '', numero_processo: '' })
  const [page, setPage] = useState(0)
  const [rowsPerPage] = useState(20)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, nome: '' })
  const [importSnack, setImportSnack] = useState({ open: false, severity: 'success', message: '' })
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef(null)
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

  const handleImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await api.post('/empresa/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setImportSnack({
        open: true,
        severity: 'success',
        message: `${data.imported} importada(s), ${data.skipped} ignorada(s), ${data.errors} erro(s)`,
      })
      fetchEmpresas()
    } catch (err) {
      setImportSnack({
        open: true,
        severity: 'error',
        message: err.response?.data?.message || 'Erro ao importar empresas',
      })
    } finally {
      setImporting(false)
      e.target.value = ''
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexShrink: 0 }}>
        <Typography variant="h5" fontWeight="600">
          Empresas
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/empresa/nova')}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Nova Empresa
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileUpload />}
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            sx={{ whiteSpace: 'nowrap' }}
          >
            {importing ? 'Importando...' : 'Importar Empresas'}
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".xlsx,.xls,.csv,.xml"
            style={{ display: 'none' }}
          />
        </Box>
      </Box>

      <Box
        display="flex"
        gap={3}
        mb={2}
        flexWrap="wrap"
        alignItems="center"
        justifyContent="center"
      >
        <TextField
          label="Município"
          size="small"
          value={filters.cidade}
          onChange={handleFilterChange('cidade')}
          sx={{ minWidth: 200, mx: 1 }}
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
          sx={{ minWidth: 200, mx: 1 }}
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
          sx={{ minWidth: 200, mx: 1 }}
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
            sx={{ mx: 1 }}
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

      <Snackbar
        open={importSnack.open}
        autoHideDuration={6000}
        onClose={() => setImportSnack((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={importSnack.severity}
          onClose={() => setImportSnack((prev) => ({ ...prev, open: false }))}
          sx={{ width: '100%' }}
        >
          {importSnack.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
