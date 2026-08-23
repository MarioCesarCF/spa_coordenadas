import { useState, useEffect, useCallback } from 'react'
import {
  Box, Paper, Typography, TextField, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, MenuItem,
  Alert, Snackbar, Chip, Stack, Collapse, IconButton,
} from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import api from '../../api/axios'

const ACAO_LABELS = {
  create: 'Criar',
  update: 'Atualizar',
  delete: 'Excluir',
  import: 'Importar',
  login: 'Login',
  logout: 'Logout',
  impersonate: 'Impersonação',
}

const ACAO_COLORS = {
  create: 'success',
  update: 'info',
  delete: 'error',
  import: 'primary',
  login: 'default',
  logout: 'default',
  impersonate: 'secondary',
}

const ENTIDADES = ['Empresa', 'Documento', 'ProjetoCalculo', 'Usuario', 'Organizacao', 'Sessao']

function LinhaLog({ log }) {
  const [aberto, setAberto] = useState(false)
  return (
    <>
      <TableRow hover onClick={() => setAberto(!aberto)} sx={{ cursor: 'pointer' }}>
        <TableCell sx={{ width: 40 }}>
          <IconButton size="small">
            {aberto ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
          </IconButton>
        </TableCell>
        <TableCell>{new Date(log.criado_em).toLocaleString('pt-BR')}</TableCell>
        <TableCell>
          <Chip label={ACAO_LABELS[log.acao] || log.acao} size="small" color={ACAO_COLORS[log.acao] || 'default'} />
        </TableCell>
        <TableCell>{log.entidade}</TableCell>
        <TableCell>
          {log.usuario ? `${log.usuario.nome} (${log.usuario.email})` : '—'}
        </TableCell>
        <TableCell>{log.organizacao?.nome || '—'}</TableCell>
      </TableRow>
      {aberto && (
        <TableRow>
          <TableCell colSpan={6} sx={{ py: 0, borderBottom: 'none' }}>
            <Collapse in={aberto} timeout="auto" unmountOnExit>
              <Box sx={{ py: 1.5 }}>
                <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                  Dados
                </Typography>
                <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'action.hover' }}>
                  <Typography
                    variant="body2"
                    component="pre"
                    sx={{ m: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                  >
                    {JSON.stringify(log.dados ?? {}, null, 2)}
                  </Typography>
                </Paper>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

export default function AdminLogs() {
  const [logs, setLogs] = useState([])
  const [orgs, setOrgs] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [filtros, setFiltros] = useState({
    entidade: '',
    acao: '',
    organizacao: '',
    data_inicio: '',
    data_fim: '',
  })
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'error' })

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 50 }
      if (filtros.entidade) params.entidade = filtros.entidade
      if (filtros.acao) params.acao = filtros.acao
      if (filtros.organizacao) params.organizacao = filtros.organizacao
      if (filtros.data_inicio) params.data_inicio = filtros.data_inicio
      if (filtros.data_fim) params.data_fim = filtros.data_fim
      const { data } = await api.get('/admin/audit-logs', { params })
      setLogs(data.logs)
      setTotal(data.total)
    } catch {
      setSnack({ open: true, message: 'Erro ao carregar logs', severity: 'error' })
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

  const totalPaginas = Math.max(Math.ceil(total / 50), 1)

  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Entidade"
          size="small"
          select
          value={filtros.entidade}
          onChange={(e) => { setPage(1); setFiltros({ ...filtros, entidade: e.target.value }) }}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">Todas</MenuItem>
          {ENTIDADES.map((ent) => (
            <MenuItem key={ent} value={ent}>{ent}</MenuItem>
          ))}
        </TextField>
        <TextField
          label="Ação"
          size="small"
          select
          value={filtros.acao}
          onChange={(e) => { setPage(1); setFiltros({ ...filtros, acao: e.target.value }) }}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">Todas</MenuItem>
          {Object.entries(ACAO_LABELS).map(([key, label]) => (
            <MenuItem key={key} value={key}>{label}</MenuItem>
          ))}
        </TextField>
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
          label="De"
          size="small"
          type="date"
          slotProps={{ inputLabel: { shrink: true } }}
          value={filtros.data_inicio}
          onChange={(e) => { setPage(1); setFiltros({ ...filtros, data_inicio: e.target.value }) }}
          sx={{ minWidth: 150 }}
        />
        <TextField
          label="Até"
          size="small"
          type="date"
          slotProps={{ inputLabel: { shrink: true } }}
          value={filtros.data_fim}
          onChange={(e) => { setPage(1); setFiltros({ ...filtros, data_fim: e.target.value }) }}
          sx={{ minWidth: 150 }}
        />
      </Stack>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 40 }} />
              <TableCell><strong>Data</strong></TableCell>
              <TableCell><strong>Ação</strong></TableCell>
              <TableCell><strong>Entidade</strong></TableCell>
              <TableCell><strong>Usuário</strong></TableCell>
              <TableCell><strong>Organização</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">Carregando...</TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">Nenhum log encontrado.</TableCell>
              </TableRow>
            ) : (
              logs.map((log) => <LinhaLog key={log._id} log={log} />)
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack direction="row" spacing={2} sx={{ mt: 2, alignItems: 'center', justifyContent: 'center' }}>
        <Button size="small" disabled={page <= 1} onClick={() => setPage(page - 1)}>
          Anterior
        </Button>
        <Typography variant="body2">
          Página {page} de {totalPaginas} ({total} registros)
        </Typography>
        <Button size="small" disabled={page >= totalPaginas} onClick={() => setPage(page + 1)}>
          Próxima
        </Button>
      </Stack>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack.severity} onClose={() => setSnack((prev) => ({ ...prev, open: false }))}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
