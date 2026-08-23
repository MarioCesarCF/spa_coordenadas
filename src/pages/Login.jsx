import { useState } from 'react'
import { useNavigate, Navigate, Link as RouterLink } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  Button,
  Alert,
  InputAdornment,
  IconButton,
  Link,
  Checkbox,
  FormControlLabel,
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import Logo from '../components/Logo'
import { useAuth } from '../hooks/useAuth'

const LEMBRAR_EMAIL_KEY = 'sylven_lembrar_email'

export default function Login() {
  const [email, setEmail] = useState(() => localStorage.getItem(LEMBRAR_EMAIL_KEY) || '')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [lembrar, setLembrar] = useState(() => Boolean(localStorage.getItem(LEMBRAR_EMAIL_KEY)))
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      if (lembrar) {
        localStorage.setItem(LEMBRAR_EMAIL_KEY, email)
      } else {
        localStorage.removeItem(LEMBRAR_EMAIL_KEY)
      }
      navigate('/', { replace: true })
    } catch (err) {
      setError(
        err.response?.data?.message || 'Erro ao fazer login. Verifique suas credenciais.'
      )
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
        p: 2,
        backgroundImage: 'url(/tela_login_6.avif)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%', boxShadow: 8 }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1, color: 'primary.main' }}>
            <Logo sx={{ width: 56, height: 56 }} />
          </Box>
          <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 600 }}>
            Sylven
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
            Faça login para continuar
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
              autoFocus
            />
            <TextField
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 1 }}
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
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2,
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={lembrar}
                    onChange={(e) => setLembrar(e.target.checked)}
                  />
                }
                label={<Typography variant="body2">Lembrar-me</Typography>}
              />
              <Link component={RouterLink} to="/esqueci-senha" variant="body2" underline="hover">
                Esqueceu a senha?
              </Link>
            </Box>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
