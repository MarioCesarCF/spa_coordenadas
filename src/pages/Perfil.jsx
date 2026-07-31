import { useState, useEffect } from 'react'
import {
  Box, Paper, Typography, TextField, Button, Stack,
  Snackbar, Alert, Avatar, Divider, Card, CardContent,
} from '@mui/material'
import { useAuth } from '../hooks/useAuth'
import api from '../api/axios'

export default function Perfil() {
  const { user, login } = useAuth()
  const [form, setForm] = useState({
    nome: '',
    email: '',
    numero_documento: '',
    telefone_contato: '',
    tipo_perfil: '',
  })
  const [loading, setLoading] = useState(false)
  const [snack, setSnack] = useState({ open: false, severity: 'success', message: '' })

  useEffect(() => {
    if (user) {
      setForm({
        nome: user.nome || '',
        email: user.email || '',
        numero_documento: user.numero_documento || '',
        telefone_contato: user.telefone_contato || '',
        tipo_perfil: user.tipo_perfil || '',
      })
    }
  }, [user])

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const { data } = await api.patch('/usuario/me', {
        nome: form.nome,
        numero_documento: form.numero_documento,
        telefone_contato: form.telefone_contato,
      })
      setSnack({ open: true, severity: 'success', message: 'Perfil atualizado com sucesso!' })
    } catch (err) {
      setSnack({
        open: true,
        severity: 'error',
        message: err.response?.data?.message || 'Erro ao atualizar perfil',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Meu Perfil
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={3} sx={{ alignItems: 'center', mb: 2 }}>
            <Avatar
              sx={{
                width: 72,
                height: 72,
                bgcolor: 'primary.main',
                fontSize: 28,
                fontWeight: 700,
              }}
            >
              {user?.nome?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
            <Box>
              <Typography variant="h6">{user?.nome || 'Usuário'}</Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
              {user?.papel && (
                <Typography variant="caption" color="primary">
                  Papel: {user.papel === 'admin' ? 'Administrador' : 'Membro'}
                </Typography>
              )}
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Dados Pessoais
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Stack spacing={2.5}>
            <TextField
              label="Nome completo"
              size="small"
              value={form.nome}
              onChange={handleChange('nome')}
              fullWidth
            />
            <TextField
              label="Email"
              size="small"
              value={form.email}
              fullWidth
              disabled
              helperText="O email não pode ser alterado"
            />
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <TextField
                label="CPF / CNPJ"
                size="small"
                value={form.numero_documento}
                onChange={handleChange('numero_documento')}
                fullWidth
              />
              <TextField
                label="Telefone de contato"
                size="small"
                value={form.telefone_contato}
                onChange={handleChange('telefone_contato')}
                fullWidth
                placeholder="(11) 99999-9999"
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? 'Salvando...' : 'Salvar alterações'}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>

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
