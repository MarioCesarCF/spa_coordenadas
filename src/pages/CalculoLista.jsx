import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Typography, Tooltip, Chip, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions, Snackbar, Alert, CircularProgress,
} from '@mui/material'
import { Add, Delete, CloudUpload, BarChart, Visibility } from '@mui/icons-material'
import api from '../api/axios'

const STATUS_MAP = {
  rascunho: { label: 'Rascunho', color: 'default' },
  importado: { label: 'Importado', color: 'info' },
  processado: { label: 'Processado', color: 'success' },
}

export default function CalculoLista() {
  const [projetos, setProjetos] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, nome: '' })
  const [snack, setSnack] = useState({ open: false, severity: 'success', message: '' })
  const navigate = useNavigate()

  const fetchProjetos = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/calculo/projeto')
      setProjetos(data)
    } catch {
      setSnack({ open: true, severity: 'error', message: 'Erro ao carregar projetos.' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProjetos() }, [fetchProjetos])

  const handleDelete = async () => {
    try {
      await api.delete(`/calculo/projeto/${deleteDialog.id}`)
      setSnack({ open: true, severity: 'success', message: 'Projeto removido.' })
      setDeleteDialog({ open: false, id: null, nome: '' })
      fetchProjetos()
    } catch {
      setSnack({ open: true, severity: 'error', message: 'Erro ao remover projeto.' })
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" fontWeight="600">Projetos de Cálculo Florestal</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/calculos/novo')}>
          Novo Projeto
        </Button>
      </Box>

      {projetos.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary" gutterBottom>
            Nenhum projeto de cálculo ainda.
          </Typography>
          <Button variant="outlined" startIcon={<Add />} onClick={() => navigate('/calculos/novo')}>
            Criar primeiro projeto
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Método</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Data</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projetos.map((p) => (
                <TableRow key={p._id} hover>
                  <TableCell>{p.nome}</TableCell>
                  <TableCell>{p.metodo === 'censo' ? 'Censo' : 'Parcela Fixa'}</TableCell>
                  <TableCell>{p.estado}</TableCell>
                  <TableCell>
                    <Chip
                      label={STATUS_MAP[p.status]?.label || p.status}
                      color={STATUS_MAP[p.status]?.color || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{new Date(p.criado_em).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell align="right">
                    {p.status === 'rascunho' && (
                      <Tooltip title="Importar dados">
                        <IconButton onClick={() => navigate(`/calculos/${p._id}/importar`)}>
                          <CloudUpload />
                        </IconButton>
                      </Tooltip>
                    )}
                    {(p.status === 'importado' || p.status === 'processado') && (
                      <Tooltip title="Ver resultados">
                        <IconButton onClick={() => navigate(`/calculos/${p._id}`)}>
                          <BarChart />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Remover">
                      <IconButton onClick={() => setDeleteDialog({ open: true, id: p._id, nome: p.nome })}>
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null, nome: '' })}>
        <DialogTitle>Remover projeto</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja remover &ldquo;{deleteDialog.nome}&rdquo;? Todos os dados importados serão perdidos.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, id: null, nome: '' })}>Cancelar</Button>
          <Button onClick={handleDelete} color="error">Remover</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}