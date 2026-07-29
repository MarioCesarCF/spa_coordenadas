import { Outlet, useNavigate } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'
import SettingsIcon from '@mui/icons-material/Settings'
import DescriptionIcon from '@mui/icons-material/Description'
import PersonIcon from '@mui/icons-material/Person'
import BusinessIcon from '@mui/icons-material/Business'
import MenuIcon from '@mui/icons-material/Menu'
import HomeIcon from '@mui/icons-material/Home'
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useOrg } from '../contexts/OrganizacaoContext'

export default function Layout() {
  const { user, logout } = useAuth()
  const { org } = useOrg()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [anchorEl, setAnchorEl] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const navItems = [
    { label: 'Empresas', icon: <HomeIcon />, path: '/' },
    { label: 'Documentos', icon: <DescriptionIcon />, path: '/documentos' },
    { label: 'Organização', icon: <BusinessIcon />, path: '/organizacao' },
  ]

  const drawer = (
    <Box sx={{ width: 250 }} onClick={() => setDrawerOpen(false)}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight={700}>Sylven</Typography>
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton onClick={() => navigate(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={() => { setDrawerOpen(false); navigate('/perfil') }}>
            <ListItemIcon><PersonIcon /></ListItemIcon>
            <ListItemText primary="Meu Perfil" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Sair" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          {isMobile && (
            <IconButton color="inherit" edge="start" onClick={() => setDrawerOpen(true)} sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>
          )}

          <Typography
            variant="h6"
            sx={{ cursor: 'pointer', flexGrow: 1, fontWeight: 700, letterSpacing: 1 }}
            onClick={() => navigate('/')}
          >
            {isMobile ? 'Sylv' : 'Sylven'}
          </Typography>

          {org && !isMobile && (
            <Chip
              label={org.nome}
              size="small"
              variant="outlined"
              sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', mr: 2 }}
            />
          )}

          {!isMobile && navItems.map((item) => (
            <Button
              key={item.label}
              color="inherit"
              onClick={() => navigate(item.path)}
              startIcon={item.icon}
              sx={{ mr: 1 }}
            >
              {item.label}
            </Button>
          ))}

          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: 'secondary.main',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 700,
            }}
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            {user?.nome?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem disabled sx={{ opacity: 1 }}>
              <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
                {user?.email}
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => { setAnchorEl(null); navigate('/perfil') }}>
              <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
              Meu Perfil
            </MenuItem>
            <MenuItem onClick={() => { setAnchorEl(null); navigate('/organizacao') }}>
              <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
              Configurações
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
              Sair
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        {drawer}
      </Drawer>

      <Container maxWidth="xl" sx={{ mt: { xs: 2, md: 3 }, mb: { xs: 2, md: 3 }, flexGrow: 1, px: { xs: 1.5, md: 3 } }}>
        <Outlet />
      </Container>
    </Box>
  )
}
