import { useState, useEffect, useCallback } from 'react'
import {
  Box, Paper, Typography, TextField, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert,
  Snackbar, Chip, Stack, Switch, FormControlLabel, Divider, IconButton,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import api from '../../api/axios'

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

const STATUS_COLORS = {
  trial: 'info',
  ativo: 'success',
  cancelado: 'default',
  expirado: 'warning',
}

const formInicial = {
  nome: '',
  slug: '',
  cnpj: '',
  plano: 'free',
  status: 'trial',
  admin_nome: '',
  admin_email: '',
  admin_password: '',
  admin_documento: '',
}

export default function AdminOrganizacoes() {
  const [orgs, setOrgs] = useState([])
  const [filtros, setFiltros] = useState({ nome: '', status: '', plano: '' })
  const [loading, setLoading] = useState(true)
  const [openNova, setOpenNova] = useState(false)
  const [formNova, setFormNova] = useState(formInicial)
  const [criando, setCriando] = useState(false)
  const [orgEditando, setOrgEditando] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' })
  const [credenciaisCriadas, setCredenciaisCriadas] = useState(null)

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (filtros.nome) params.nome = filtros.nome
      if (filtros.status) params.status = filtros.status
      if (filtros.plano) params.plano = filtros.plano
      const { data } = await api.get('/admin/organizacoes', { params })
      setOrgs(data)
    } catch {
      setSnack({ open: true, message: 'Erro ao carregar organizações', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }, [filtros])

  useEffect(() => {
    carregar()
  }, [carregar])

  const handleCriar = async () => {
    setCriando(true)
    try {
      const payload = {
        nome: formNova.nome,
        plano: formNova.plano,
        status: formNova.status,
        admin: {
          nome: formNova.admin_nome,
          email: formNova.admin_email,
          password: formNova.admin_password,
          numero_documento: formNova.admin_documento,
        },
      }
      if (formNova.slug) payload.slug = formNova.slug
      if (formNova.cnpj) payload.cnpj = formNova.cnpj

      const { data } = await api.post('/admin/organizacoes', payload)
      setOpenNova(false)
      setFormNova(formInicial)
      setCredenciaisCriadas({
        org: data.organizacao?.nome,
        email: data.admin?.email,
        password: formNova.admin_password,
      })
      carregar()
    } catch (err) {
      setSnack({
        open: true,
        message: err.response?.data?.message || 'Erro ao criar organização',
        severity: 'error',
      })
    } finally {
      setCriando(false)
    }
  }

  const handleSalvarEdicao = async () => {
    if (!orgEditando) return
    setSalvando(true)
    try {
      const payload = {
        nome: orgEditando.nome,
        plano: orgEditando.plano,
        status: orgEditando.status,
        config_limites: orgEditando.config_limites,
      }
      if (orgEditando.data_expiracao !== undefined) {
        payload.data_expiracao = orgEditando.data_expiracao || null
      }
      await api.patch(`/admin/organizacoes/${orgEditando._id}`, payload)
      setSnack({ open: true, message: 'Organização atualizada', severity: 'success' })
      setOrgEditando(null)
      carregar()
    } catch (err) {
      setSnack({
        open: true,
        message: err.response?.data?.message || 'Erro ao atualizar organização',
        severity: 'error',
      })
    } finally {
      setSalvando(false)
    }
  }

  const formatarData = (data) =>
    data ? new Date(data).toLocaleDateString('pt-BR') : '—'

  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Buscar por nome"
          size="small"
          value={filtros.nome}
          onChange={(e) => setFiltros({ ...filtros, nome: e.target.value })}
          sx={{ minWidth: 220 }}
        />
        <TextField
          label="Status"
          size="small"
          select
          value={filtros.status}
          onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">Todos</MenuItem>
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <MenuItem key={key} value={key}>{label}</MenuItem>
          ))}
        </TextField>
        <TextField
          label="Plano"
          size="small"
          select
          value={filtros.plano}
          onChange={(e) => setFiltros({ ...filtros, plano: e.target.value })}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">Todos</MenuItem>
          {Object.entries(PLANO_LABELS).map(([key, label]) => (
            <MenuItem key={key} value={key}>{label}</MenuItem>
          ))}
        </TextField>
        <Box sx={{ flexGrow: 1 }} />
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenNova(true)}>
          Nova Organização
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><strong>Organização</strong></TableCell>
              <TableCell><strong>Plano</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Empresas</strong></TableCell>
              <TableCell><strong>Usuários</strong></TableCell>
              <TableCell><strong>Expira em</strong></TableCell>
              <TableCell align="right"><strong>Ações</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">Carregando...</TableCell>
              </TableRow>
            ) : orgs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">Nenhuma organização encontrada.</TableCell>
              </TableRow>
            ) : (
              orgs.map((org) => (
                <TableRow key={org._id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{org.nome}</Typography>
                    <Typography variant="caption" color="text.secondary">{org.slug}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={PLANO_LABELS[org.plano] || org.plano} size="small" color="primary" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={STATUS_LABELS[org.status] || org.status}
                      size="small"
                      color={STATUS_COLORS[org.status] || 'default'}
                    />
                  </TableCell>
                  <TableCell>{org.uso?.empresas ?? 0}</TableCell>
                  <TableCell>{org.uso?.usuarios ?? 0}</TableCell>
                  <TableCell>{formatarData(org.data_expiracao)}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => setOrgEditando({ ...org })}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openNova} onClose={() => setOpenNova(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nova Organização</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">Organização</Typography>
            <TextField
              label="Nome da organização"
              size="small"
              required
              value={formNova.nome}
              onChange={(e) => setFormNova({
                ...formNova,
                nome: e.target.value,
                slug: e.target.value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
              })}
            />
            <TextField
              label="Slug"
              size="small"
              helperText="Gerado automaticamente a partir do nome"
              value={formNova.slug}
              onChange={(e) => setFormNova({ ...formNova, slug: e.target.value })}
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="CNPJ (opcional)"
                size="small"
                fullWidth
                value={formNova.cnpj}
                onChange={(e) => setFormNova({ ...formNova, cnpj: e.target.value })}
              />
              <TextField
                label="Plano"
                size="small"
                select
                fullWidth
                value={formNova.plano}
                onChange={(e) => setFormNova({ ...formNova, plano: e.target.value })}
              >
                {Object.entries(PLANO_LABELS).map(([key, label]) => (
                  <MenuItem key={key} value={key}>{label}</MenuItem>
                ))}
              </TextField>
              <TextField
                label="Status"
                size="small"
                select
                fullWidth
                value={formNova.status}
                onChange={(e) => setFormNova({ ...formNova, status: e.target.value })}
              >
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <MenuItem key={key} value={key}>{label}</MenuItem>
                ))}
              </TextField>
            </Stack>

            <Divider />
            <Typography variant="subtitle2" color="text.secondary">
              Login administrativo (cadastra os demais usuários)
            </Typography>
            <TextField
              label="Nome do administrador"
              size="small"
              required
              value={formNova.admin_nome}
              onChange={(e) => setFormNova({ ...formNova, admin_nome: e.target.value })}
            />
            <TextField
              label="Email do administrador"
              size="small"
              type="email"
              required
              value={formNova.admin_email}
              onChange={(e) => setFormNova({ ...formNova, admin_email: e.target.value })}
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="Senha provisória"
                size="small"
                type="text"
                required
                fullWidth
                helperText="Mín. 8 caracteres, 1 maiúscula e 1 número"
                value={formNova.admin_password}
                onChange={(e) => setFormNova({ ...formNova, admin_password: e.target.value })}
              />
              <TextField
                label="CPF do administrador"
                size="small"
                required
                fullWidth
                value={formNova.admin_documento}
                onChange={(e) => setFormNova({ ...formNova, admin_documento: e.target.value })}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNova(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleCriar}
            disabled={
              criando ||
              !formNova.nome ||
              !formNova.admin_nome ||
              !formNova.admin_email ||
              !formNova.admin_password ||
              !formNova.admin_documento
            }
          >
            {criando ? 'Criando...' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(orgEditando)} onClose={() => setOrgEditando(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Organização</DialogTitle>
        <DialogContent>
          {orgEditando && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Nome"
                size="small"
                value={orgEditando.nome}
                onChange={(e) => setOrgEditando({ ...orgEditando, nome: e.target.value })}
              />
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Plano"
                  size="small"
                  select
                  fullWidth
                  value={orgEditando.plano}
                  onChange={(e) => setOrgEditando({ ...orgEditando, plano: e.target.value })}
                >
                  {Object.entries(PLANO_LABELS).map(([key, label]) => (
                    <MenuItem key={key} value={key}>{label}</MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Status"
                  size="small"
                  select
                  fullWidth
                  value={orgEditando.status}
                  onChange={(e) => setOrgEditando({ ...orgEditando, status: e.target.value })}
                >
                  {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <MenuItem key={key} value={key}>{label}</MenuItem>
                  ))}
                </TextField>
              </Stack>
              <Typography variant="subtitle2" color="text.secondary">Limites</Typography>
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Max. empresas"
                  size="small"
                  type="number"
                  fullWidth
                  value={orgEditando.config_limites?.max_empresas ?? 0}
                  onChange={(e) => setOrgEditando({
                    ...orgEditando,
                    config_limites: {
                      ...orgEditando.config_limites,
                      max_empresas: Number(e.target.value),
                    },
                  })}
                />
                <TextField
                  label="Max. usuários"
                  size="small"
                  type="number"
                  fullWidth
                  value={orgEditando.config_limites?.max_usuarios ?? 0}
                  onChange={(e) => setOrgEditando({
                    ...orgEditando,
                    config_limites: {
                      ...orgEditando.config_limites,
                      max_usuarios: Number(e.target.value),
                    },
                  })}
                />
                <TextField
                  label="Storage (GB)"
                  size="small"
                  type="number"
                  fullWidth
                  value={orgEditando.config_limites?.storage_gb ?? 0}
                  onChange={(e) => setOrgEditando({
                    ...orgEditando,
                    config_limites: {
                      ...orgEditando.config_limites,
                      storage_gb: Number(e.target.value),
                    },
                  })}
                />
              </Stack>
              <FormControlLabel
                control={
                  <Switch
                    checked={!!orgEditando.config_limites?.calculos_habilitados}
                    onChange={(e) => setOrgEditando({
                      ...orgEditando,
                      config_limites: {
                        ...orgEditando.config_limites,
                        calculos_habilitados: e.target.checked,
                      },
                    })}
                  />
                }
                label="Cálculos habilitados"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={!!orgEditando.config_limites?.dominio_personalizado_habilitado}
                    onChange={(e) => setOrgEditando({
                      ...orgEditando,
                      config_limites: {
                        ...orgEditando.config_limites,
                        dominio_personalizado_habilitado: e.target.checked,
                      },
                    })}
                  />
                }
                label="Domínio personalizado"
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOrgEditando(null)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSalvarEdicao} disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(credenciaisCriadas)} onClose={() => setCredenciaisCriadas(null)}>
        <DialogTitle>Organização criada</DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mt: 1 }}>
            Organização <strong>{credenciaisCriadas?.org}</strong> criada com sucesso.
          </Alert>
          <Stack spacing={1} sx={{ mt: 2 }}>
            <Typography variant="body2">
              Login administrativo: <strong>{credenciaisCriadas?.email}</strong>
            </Typography>
            <Typography variant="body2">
              Senha provisória: <strong>{credenciaisCriadas?.password}</strong>
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Guarde esses dados e repasse ao cliente. Ele poderá trocar a senha via "Esqueci minha senha".
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => setCredenciaisCriadas(null)}>OK</Button>
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
