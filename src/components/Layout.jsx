import { Outlet, useNavigate } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Chip,
} from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'
import SettingsIcon from '@mui/icons-material/Settings'
import DescriptionIcon from '@mui/icons-material/Description'
import { useAuth } from '../hooks/useAuth'
import { useOrg } from '../contexts/OrganizacaoContext'

export default function Layout() {
  const { user, logout } = useAuth()
  const { org } = useOrg()
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
          {org && (
            <Chip
              label={org.nome}
              size="small"
              variant="outlined"
              sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', mr: 2 }}
            />
          )}
          <Button
            color="inherit"
            onClick={() => navigate('/documentos')}
            startIcon={<DescriptionIcon />}
            sx={{ mr: 1 }}
          >
            Documentos
          </Button>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.nome}
          </Typography>
          <Button
            color="inherit"
            onClick={() => navigate('/organizacao')}
            startIcon={<SettingsIcon />}
            sx={{ mr: 1 }}
          >
            Organização
          </Button>
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
