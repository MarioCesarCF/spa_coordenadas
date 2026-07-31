import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Alert, Link,
} from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import api from '../api/axios'

export default function EsqueciSenha() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/usuario/esqueci-senha', { email })
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao solicitar redefinição.')
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
        bgcolor: '#f5f5f5',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 440, width: '100%' }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 600 }}>
            Sylven
          </Typography>

          {!sent ? (
            <>
              <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
                Esqueceu sua senha? Digite seu email e enviaremos um link para redefini-la.
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{ mb: 3 }}
                  autoFocus
                />
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={loading}
                  sx={{ mb: 2 }}
                >
                  {loading ? 'Enviando...' : 'Enviar link de redefinição'}
                </Button>
              </Box>
            </>
          ) : (
            <Alert severity="success" sx={{ mb: 2 }}>
              Se o email existir, enviaremos um link de redefinição de senha. Verifique sua caixa de entrada.
            </Alert>
          )}

          <Box sx={{ textAlign: 'center' }}>
            <Link component={RouterLink} to="/login" color="primary" underline="hover"
              sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
              <ArrowBack fontSize="small" /> Voltar para o login
            </Link>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
