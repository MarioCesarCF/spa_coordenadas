import { useState, useEffect, useCallback } from 'react'
import {
  Box, Paper, Typography, TextField, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert,
  Snackbar, Divider, Chip, Stack, Card, CardContent,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import api from '../api/axios'
import { useOrg } from '../contexts/OrganizacaoContext'

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
  const [formConvite, setFormConvite] = useState({ nome: '', email: '', password: '', numero_documento: '' })
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' })
  const [editNome, setEditNome] = useState('')
  const [editDominio, setEditDominio] = useState('')

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
      carregarMembros()
    }
  }, [org, carregarMembros])

  const handleSalvarOrg = async () => {
    try {
      await atualizarOrg({ nome: editNome, dominio_personalizado: editDominio })
      setSnack({ open: true, message: 'Organização atualizada com sucesso', severity: 'success' })
    } catch {
      setSnack({ open: true, message: 'Erro ao atualizar organização', severity: 'error' })
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

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Configurações da Organização
      </Typography>

      <Stack spacing={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Plano</Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Chip label={PLANO_LABELS[org.plano] || org.plano} color="primary" />
              <Chip label={STATUS_LABELS[org.status] || org.status}
                color={org.status === 'ativo' ? 'success' : org.status === 'trial' ? 'warning' : 'error'} />
              {org.data_expiracao && (
                <Typography variant="body2" color="text.secondary">
                  Expira em: {new Date(org.data_expiracao).toLocaleDateString('pt-BR')}
                </Typography>
              )}
            </Stack>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Limites do plano:
              </Typography>
              <Typography variant="body2">
                Empresas: {org.config_limites.max_empresas === 99999 ? 'Ilimitado' : org.config_limites.max_empresas} |
                Usuários: {org.config_limites.max_usuarios === 99999 ? 'Ilimitado' : org.config_limites.max_usuarios} |
                Armazenamento: {org.config_limites.storage_gb}GB |
                Cálculos: {org.config_limites.calculos_habilitados ? '✅' : '❌'}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Dados da Organização</Typography>
            <Stack spacing={2} sx={{ maxWidth: 500 }}>
              <TextField label="Nome" size="small" value={editNome}
                onChange={(e) => setEditNome(e.target.value)} />
              <TextField label="Domínio personalizado" size="small" value={editDominio}
                onChange={(e) => setEditDominio(e.target.value)}
                placeholder="sistema.meucliente.com.br"
                helperText={org.config_limites.dominio_personalizado_habilitado ? '' : 'Disponível nos planos Essencial+'} />
              <Box>
                <Button variant="contained" onClick={handleSalvarOrg}>Salvar</Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Membros</Typography>
              <Button variant="contained" startIcon={<PersonAddIcon />}
                onClick={() => setOpenConvite(true)}>
                Convidar
              </Button>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Papel</TableCell>
                    <TableCell>Documento</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {membros.map((m) => (
                    <TableRow key={m._id}>
                      <TableCell>{m.nome}</TableCell>
                      <TableCell>{m.email}</TableCell>
                      <TableCell>
                        <Chip label={m.papel} size="small"
                          color={m.papel === 'admin' ? 'primary' : 'default'} />
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
                  ))}
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

      <Snackbar open={snack.open} autoHideDuration={4000}
        onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
