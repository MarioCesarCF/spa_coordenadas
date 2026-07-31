import { useState } from 'react'
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom'
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Alert, Link, InputAdornment, IconButton,
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import api from '../api/axios'

export default function RedefinirSenha() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (novaSenha !== confirmarSenha) {
      setError('As senhas não conferem.')
      return
    }
    if (novaSenha.length < 8 || !/[A-Z]/.test(novaSenha) || !/[0-9]/.test(novaSenha)) {
      setError('A senha deve ter no mínimo 8 caracteres, uma letra maiúscula e um número.')
      return
    }

    setLoading(true)
    try {
      await api.post('/usuario/redefinir-senha', { token, novaSenha })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao redefinir senha.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100dvh',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 440, width: '100%' }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 600 }}>
            Sylven
          </Typography>

          {!success ? (
            <>
              <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
                Digite sua nova senha.
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  label="Nova senha"
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  required
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  sx={{ mb: 2 }}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <TextField
                  label="Confirmar nova senha"
                  type="password"
                  fullWidth
                  required
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  sx={{ mb: 3 }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={loading}
                  sx={{ mb: 2 }}
                >
                  {loading ? 'Redefinindo...' : 'Redefinir senha'}
                </Button>
              </Box>
            </>
          ) : (
            <Alert severity="success" sx={{ mb: 2 }}>
              Senha redefinida com sucesso! Redirecionando para o login...
            </Alert>
          )}

          <Box sx={{ textAlign: 'center' }}>
            <Link component={RouterLink} to="/login" color="primary" underline="hover">
              Voltar para o login
            </Link>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
