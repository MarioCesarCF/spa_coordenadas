import { useState, useEffect, useCallback } from 'react'
import {
  Box, Paper, Typography, TextField, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert,
  Snackbar, Chip, Stack, IconButton, Tooltip,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import api from '../../api/axios'
import { useAuth } from '../../hooks/useAuth'

const PAPEL_LABELS = {
  superadmin: 'Superadmin',
  admin: 'Admin',
  membro: 'Membro',
}

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [orgs, setOrgs] = useState([])
  const [total, setTotal] = useState(0)
  const [filtros, setFiltros] = useState({ email: '', nome: '', organizacao: '', papel: '' })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState(null)
  const [removendo, setRemovendo] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const { impersonar } = useAuth()
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' })

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 50 }
      if (filtros.email) params.email = filtros.email
      if (filtros.nome) params.nome = filtros.nome
      if (filtros.organizacao) params.organizacao = filtros.organizacao
      if (filtros.papel) params.papel = filtros.papel
      const { data } = await api.get('/admin/usuarios', { params })
      setUsuarios(data.usuarios)
      setTotal(data.total)
    } catch {
      setSnack({ open: true, message: 'Erro ao carregar usuários', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }, [filtros, page])

  useEffect(() => {
    carregar()
  }, [carregar])

  useEffect(() => {
    api.get('/admin/organizacoes')
      .then(({ data }) => setOrgs(data))
      .catch(() => {})
  }, [])

  const handleSalvarEdicao = async () => {
    if (!editando) return
    setSalvando(true)
    try {
      await api.patch(`/admin/usuarios/${editando._id}`, {
        nome: editando.nome,
        email: editando.email,
        papel: editando.papel,
        tipo_perfil: editando.tipo_perfil,
        telefone_contato: editando.telefone_contato,
      })
      setSnack({ open: true, message: 'Usuário atualizado', severity: 'success' })
      setEditando(null)
      carregar()
    } catch (err) {
      setSnack({
        open: true,
        message: err.response?.data?.message || 'Erro ao atualizar usuário',
        severity: 'error',
      })
    } finally {
      setSalvando(false)
    }
  }

  const handleRemover = async () => {
    if (!removendo) return
    try {
      await api.delete(`/admin/usuarios/${removendo._id}`)
      setSnack({ open: true, message: `${removendo.nome} removido com sucesso`, severity: 'success' })
      setRemovendo(null)
      carregar()
    } catch (err) {
      setSnack({
        open: true,
        message: err.response?.data?.message || 'Erro ao remover usuário',
        severity: 'error',
      })
    }
  }

  const handleImpersonar = async (usuario) => {
    try {
      await impersonar(usuario._id)
      window.location.href = '/'
    } catch (err) {
      setSnack({
        open: true,
        message: err.response?.data?.message || 'Erro ao impersonar usuário',
        severity: 'error',
      })
    }
  }

  const totalPaginas = Math.max(Math.ceil(total / 50), 1)

  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Buscar por email"
          size="small"
          value={filtros.email}
          onChange={(e) => { setPage(1); setFiltros({ ...filtros, email: e.target.value }) }}
          sx={{ minWidth: 220 }}
        />
        <TextField
          label="Buscar por nome"
          size="small"
          value={filtros.nome}
          onChange={(e) => { setPage(1); setFiltros({ ...filtros, nome: e.target.value }) }}
          sx={{ minWidth: 200 }}
        />
        <TextField
          label="Organização"
          size="small"
          select
          value={filtros.organizacao}
          onChange={(e) => { setPage(1); setFiltros({ ...filtros, organizacao: e.target.value }) }}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">Todas</MenuItem>
          <MenuItem value="sem_org">Sem organização</MenuItem>
          {orgs.map((org) => (
            <MenuItem key={org._id} value={org._id}>{org.nome}</MenuItem>
          ))}
        </TextField>
        <TextField
          label="Papel"
          size="small"
          select
          value={filtros.papel}
          onChange={(e) => { setPage(1); setFiltros({ ...filtros, papel: e.target.value }) }}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">Todos</MenuItem>
          {Object.entries(PAPEL_LABELS).map(([key, label]) => (
            <MenuItem key={key} value={key}>{label}</MenuItem>
          ))}
        </TextField>
      </Stack>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><strong>Nome</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Papel</strong></TableCell>
              <TableCell><strong>Organização</strong></TableCell>
              <TableCell align="right"><strong>Ações</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">Carregando...</TableCell>
              </TableRow>
            ) : usuarios.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">Nenhum usuário encontrado.</TableCell>
              </TableRow>
            ) : (
              usuarios.map((u) => (
                <TableRow key={u._id} hover>
                  <TableCell>{u.nome}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={PAPEL_LABELS[u.papel] || u.papel}
                      size="small"
                      color={u.papel === 'superadmin' ? 'secondary' : u.papel === 'admin' ? 'primary' : 'default'}
                    />
                  </TableCell>
                  <TableCell>{u.organizacao?.nome || '—'}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Entrar como este usuário">
                      <span>
                        <IconButton
                          size="small"
                          disabled={u.papel === 'superadmin'}
                          onClick={() => handleImpersonar(u)}
                        >
                          <SwapHorizIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <IconButton
                      size="small"
                      disabled={u.papel === 'superadmin'}
                      onClick={() =>
                        setEditando({
                          ...u,
                          telefone_contato: u.telefone_contato || '',
                        })
                      }
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      disabled={u.papel === 'superadmin'}
                      onClick={() => setRemovendo(u)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack direction="row" spacing={2} sx={{ mt: 2, alignItems: 'center', justifyContent: 'center' }}>
        <Button size="small" disabled={page <= 1} onClick={() => setPage(page - 1)}>
          Anterior
        </Button>
        <Typography variant="body2">
          Página {page} de {totalPaginas} ({total} usuários)
        </Typography>
        <Button size="small" disabled={page >= totalPaginas} onClick={() => setPage(page + 1)}>
          Próxima
        </Button>
      </Stack>

      <Dialog open={Boolean(editando)} onClose={() => setEditando(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Usuário</DialogTitle>
        <DialogContent>
          {editando && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Nome"
                size="small"
                value={editando.nome}
                onChange={(e) => setEditando({ ...editando, nome: e.target.value })}
              />
              <TextField
                label="Email"
                size="small"
                type="email"
                value={editando.email}
                onChange={(e) => setEditando({ ...editando, email: e.target.value })}
              />
              <TextField
                label="Papel"
                size="small"
                select
                value={editando.papel}
                onChange={(e) => setEditando({ ...editando, papel: e.target.value })}
              >
                <MenuItem value="membro">Membro</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </TextField>
              <TextField
                label="Telefone de contato"
                size="small"
                value={editando.telefone_contato || ''}
                onChange={(e) => setEditando({ ...editando, telefone_contato: e.target.value })}
              />
              <Alert severity="info">
                A senha só pode ser alterada pelo próprio usuário, via "Esqueci minha senha" na tela de login.
              </Alert>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditando(null)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSalvarEdicao} disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(removendo)} onClose={() => setRemovendo(null)}>
        <DialogTitle>Remover usuário</DialogTitle>
        <DialogContent>
          <Alert severity="warning">
            Tem certeza que deseja remover <strong>{removendo?.nome}</strong> ({removendo?.email})?
            Esta ação não pode ser desfeita.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemovendo(null)}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleRemover}>Remover</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((prev) => ({ ...prev, open: false }))}
          sx={{ width: '100%' }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
