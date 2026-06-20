import { Outlet, useNavigate } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
} from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'
import { useAuth } from '../hooks/useAuth'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            sx={{ cursor: 'pointer', flexGrow: 1 }}
            onClick={() => navigate('/')}
          >
            SPA Coordenadas
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.nome}
          </Typography>
          <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
            Sair
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ mt: 3, mb: 3, flexGrow: 1 }}>
        <Outlet />
      </Container>
    </Box>
  )
}
