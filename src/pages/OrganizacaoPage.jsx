import { useState, useEffect, useCallback } from 'react'
import {
  Box, Paper, Typography, TextField, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert,
  Snackbar, Divider, Chip, Stack, Card, CardContent,
  ToggleButtonGroup, ToggleButton, LinearProgress,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import UpgradeIcon from '@mui/icons-material/Upgrade'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import api from '../api/axios'
import { useOrg } from '../contexts/OrganizacaoContext'

const PLANOS = [
  { key: 'free', label: 'Free', preco: 'Grátis', cor: 'default', empresas: 5, usuarios: 1, storage: '—', calculos: false },
  { key: 'essential', label: 'Essencial', preco: 'R$ 147/mês', cor: 'primary', empresas: 200, usuarios: 5, storage: '2 GB', calculos: false },
  { key: 'profissional', label: 'Profissional', preco: 'R$ 397/mês', cor: 'primary', empresas: 1000, usuarios: 20, storage: '10 GB', calculos: true },
  { key: 'enterprise', label: 'Enterprise', preco: 'R$ 697/mês', cor: 'success', empresas: 'Ilimitado', usuarios: 'Ilimitado', storage: '50 GB', calculos: true },
]

const PLANO_LABELS = {
  free: 'Free',
  essential: 'Essencial',
  profissional: 'Profissional',
  enterprise: 'Enterprise',
}

const STATUS_LABELS = {
  trial: 'Trial',
  ativo: 'Ativo',
  cancelado: 'Cancelado',
  expirado: 'Expirado',
}

export default function OrganizacaoPage() {
  const { org, orgLoading, atualizarOrg } = useOrg()
  const [membros, setMembros] = useState([])
  const [openConvite, setOpenConvite] = useState(false)
  const [openPlano, setOpenPlano] = useState(false)
  const [planoSelecionado, setPlanoSelecionado] = useState('')
  const [formConvite, setFormConvite] = useState({ nome: '', email: '', password: '', numero_documento: '' })
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' })
  const [editNome, setEditNome] = useState('')
  const [editDominio, setEditDominio] = useState('')
  const [saving, setSaving] = useState(false)

  const carregarMembros = useCallback(async () => {
    try {
      const { data } = await api.get('/organizacao/membros')
      setMembros(data)
    } catch {
      setSnack({ open: true, message: 'Erro ao carregar membros', severity: 'error' })
    }
  }, [])

  useEffect(() => {
    if (org) {
      setEditNome(org.nome)
      setEditDominio(org.dominio_personalizado || '')
      setPlanoSelecionado(org.plano)
      carregarMembros()
    }
  }, [org, carregarMembros])

  const handleSalvarOrg = async () => {
    setSaving(true)
    try {
      await atualizarOrg({ nome: editNome, dominio_personalizado: editDominio })
      setSnack({ open: true, message: 'Organização atualizada com sucesso', severity: 'success' })
    } catch {
      setSnack({ open: true, message: 'Erro ao atualizar organização', severity: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleTrocarPlano = async () => {
    if (!planoSelecionado || planoSelecionado === org.plano) {
      setOpenPlano(false)
      return
    }
    setSaving(true)
    try {
      await atualizarOrg({ plano: planoSelecionado })
      setSnack({
        open: true,
        message: `Plano alterado para ${PLANO_LABELS[planoSelecionado]}. A cobrança será ajustada na próxima fatura.`,
        severity: 'success',
      })
      setOpenPlano(false)
    } catch (err) {
      setSnack({
        open: true,
        message: err.response?.data?.message || 'Erro ao alterar plano',
        severity: 'error',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleConvidar = async () => {
    try {
      await api.post('/organizacao/membros', formConvite)
      setOpenConvite(false)
      setFormConvite({ nome: '', email: '', password: '', numero_documento: '' })
      setSnack({ open: true, message: 'Membro adicionado com sucesso', severity: 'success' })
      carregarMembros()
    } catch (err) {
      const msg = err.response?.data?.message || 'Erro ao adicionar membro'
      setSnack({ open: true, message: msg, severity: 'error' })
    }
  }

  const handleRemover = async (id, nome) => {
    try {
      await api.delete(`/organizacao/membros/${id}`)
      setSnack({ open: true, message: `${nome} removido com sucesso`, severity: 'success' })
      carregarMembros()
    } catch {
      setSnack({ open: true, message: 'Erro ao remover membro', severity: 'error' })
    }
  }

  if (orgLoading) return null

  if (!org) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Bem-vindo!
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Você ainda não tem uma organização. Crie uma para começar a gerenciar sua equipe e dados.
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            Se você já possui uma organização, peça ao administrador para te adicionar.
          </Alert>
        </Paper>
      </Box>
    )
  }

  const planosDisponiveis = PLANOS

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Configurações da Organização
      </Typography>

      <Stack spacing={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6">Plano Atual</Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<UpgradeIcon />}
                onClick={() => setOpenPlano(true)}
              >
                Alterar Plano
              </Button>
            </Box>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
              <Chip
                label={PLANO_LABELS[org.plano] || org.plano}
                color={org.plano === 'free' ? 'default' : 'primary'}
                variant={org.plano === 'free' ? 'outlined' : 'filled'}
              />
              <Chip
                label={STATUS_LABELS[org.status] || org.status}
                color={org.status === 'ativo' ? 'success' : org.status === 'trial' ? 'warning' : 'error'}
              />
              {org.data_expiracao && (
                <Typography variant="body2" color="text.secondary">
                  Expira em: {new Date(org.data_expiracao).toLocaleDateString('pt-BR')}
                </Typography>
              )}
            </Stack>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Limites do plano:
              </Typography>
              <Stack direction="row" spacing={3} flexWrap="wrap">
                <Typography variant="body2">
                  Empresas: <strong>{org.config_limites.max_empresas === 99999 ? 'Ilimitado' : org.config_limites.max_empresas}</strong>
                </Typography>
                <Typography variant="body2">
                  Usuários: <strong>{org.config_limites.max_usuarios === 99999 ? 'Ilimitado' : org.config_limites.max_usuarios}</strong>
                </Typography>
                <Typography variant="body2">
                  Armazenamento: <strong>{org.config_limites.storage_gb}GB</strong>
                </Typography>
                <Typography variant="body2">
                  Cálculos: <strong>{org.config_limites.calculos_habilitados ? '✅' : '❌'}</strong>
                </Typography>
              </Stack>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Dados da Organização</Typography>
            <Stack spacing={2} sx={{ maxWidth: 500 }}>
              <TextField
                label="Nome"
                size="small"
                value={editNome}
                onChange={(e) => setEditNome(e.target.value)}
              />
              <TextField
                label="Domínio personalizado"
                size="small"
                value={editDominio}
                onChange={(e) => setEditDominio(e.target.value)}
                placeholder="sistema.meucliente.com.br"
                helperText={org.config_limites.dominio_personalizado_habilitado ? '' : 'Disponível nos planos Essencial+'}
              />
              <Box>
                <Button variant="contained" onClick={handleSalvarOrg} disabled={saving}>
                  {saving ? 'Salvando...' : 'Salvar'}
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Membros ({membros.length})</Typography>
              <Button variant="contained" startIcon={<PersonAddIcon />}
                onClick={() => setOpenConvite(true)}>
                Convidar
              </Button>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Nome</strong></TableCell>
                    <TableCell><strong>Email</strong></TableCell>
                    <TableCell><strong>Papel</strong></TableCell>
                    <TableCell><strong>Documento</strong></TableCell>
                    <TableCell align="right"><strong>Ações</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {membros.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        Nenhum membro encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    membros.map((m) => (
                      <TableRow key={m._id}>
                        <TableCell>{m.nome}</TableCell>
                        <TableCell>{m.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={m.papel === 'admin' ? 'Admin' : 'Membro'}
                            size="small"
                            color={m.papel === 'admin' ? 'primary' : 'default'}
                          />
                        </TableCell>
                        <TableCell>{m.numero_documento}</TableCell>
                        <TableCell align="right">
                          {m.papel !== 'admin' && (
                            <IconButton size="small" color="error"
                              onClick={() => handleRemover(m._id, m.nome)}>
                              <DeleteIcon />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Stack>

      <Dialog open={openConvite} onClose={() => setOpenConvite(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Convidar Membro</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Nome" fullWidth value={formConvite.nome}
              onChange={(e) => setFormConvite({ ...formConvite, nome: e.target.value })} />
            <TextField label="Email" fullWidth value={formConvite.email}
              onChange={(e) => setFormConvite({ ...formConvite, email: e.target.value })} />
            <TextField label="Senha" type="password" fullWidth value={formConvite.password}
              onChange={(e) => setFormConvite({ ...formConvite, password: e.target.value })} />
            <TextField label="CPF/CNPJ" fullWidth value={formConvite.numero_documento}
              onChange={(e) => setFormConvite({ ...formConvite, numero_documento: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConvite(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleConvidar}>Convidar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openPlano} onClose={() => setOpenPlano(false)} maxWidth="md" fullWidth>
        <DialogTitle>Alterar Plano</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
            Selecione o plano desejado para sua organização. A diferença será cobrada ou creditada proporcionalmente.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ flexWrap: 'wrap', justifyContent: 'center' }}>
            {planosDisponiveis.map((plano) => {
              const isCurrent = org.plano === plano.key
              const isUpgrade = PLANOS.findIndex((p) => p.key === plano.key) > PLANOS.findIndex((p) => p.key === org.plano)
              return (
                <Paper
                  key={plano.key}
                  elevation={planoSelecionado === plano.key ? 4 : 1}
                  sx={{
                    p: 2.5,
                    minWidth: 180,
                    flex: 1,
                    cursor: 'pointer',
                    border: planoSelecionado === plano.key ? '2px solid' : '2px solid transparent',
                    borderColor: planoSelecionado === plano.key ? 'primary.main' : 'transparent',
                    opacity: isCurrent ? 0.85 : 1,
                    position: 'relative',
                    '&:hover': { borderColor: 'primary.light' },
                  }}
                  onClick={() => setPlanoSelecionado(plano.key)}
                >
                  {isCurrent && (
                    <Chip
                      label="Atual"
                      size="small"
                      color="success"
                      sx={{ position: 'absolute', top: -10, right: 8 }}
                    />
                  )}
                  <Typography variant="h6" fontWeight={700}>{plano.label}</Typography>
                  <Typography variant="h5" color="primary" fontWeight={700} sx={{ my: 1 }}>
                    {plano.preco}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Stack spacing={0.5}>
                    <Typography variant="body2">
                      <CheckCircleIcon fontSize="inherit" color="action" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                      Empresas: {plano.empresas}
                    </Typography>
                    <Typography variant="body2">
                      <CheckCircleIcon fontSize="inherit" color="action" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                      Usuários: {plano.usuarios}
                    </Typography>
                    <Typography variant="body2">
                      <CheckCircleIcon fontSize="inherit" color="action" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                      Storage: {plano.storage}
                    </Typography>
                    <Typography variant="body2">
                      <CheckCircleIcon fontSize="inherit" color="action" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                      Cálculos: {plano.calculos ? '✅' : '❌'}
                    </Typography>
                  </Stack>
                </Paper>
              )
            })}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenPlano(false); setPlanoSelecionado(org.plano) }}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleTrocarPlano}
            disabled={planoSelecionado === org.plano || saving}
          >
            {saving ? 'Alterando...' : 'Confirmar alteração'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={4000}
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
