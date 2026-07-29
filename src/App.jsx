import { Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import PrivateRoute from './components/PrivateRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import EmpresaLista from './pages/EmpresaLista'
import EmpresaForm from './pages/EmpresaForm'
import OrganizacaoPage from './pages/OrganizacaoPage'
import DocumentoLista from './pages/DocumentoLista'
import DocumentoForm from './pages/DocumentoForm'
import Perfil from './pages/Perfil'
import EsqueciSenha from './pages/EsqueciSenha'
import RedefinirSenha from './pages/RedefinirSenha'
import { OrganizacaoProvider } from './contexts/OrganizacaoContext'

const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32',
    },
  },
})

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <OrganizacaoProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/esqueci-senha" element={<EsqueciSenha />} />
          <Route path="/redefinir-senha/:token" element={<RedefinirSenha />} />
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<EmpresaLista />} />
              <Route path="/empresa/nova" element={<EmpresaForm />} />
              <Route path="/empresa/:id/editar" element={<EmpresaForm />} />
              <Route path="/empresa/:empresaId/documentos" element={<DocumentoLista />} />
              <Route path="/documentos" element={<DocumentoLista />} />
              <Route path="/documento/novo" element={<DocumentoForm />} />
              <Route path="/documento/:id/editar" element={<DocumentoForm />} />
              <Route path="/perfil" element={<Perfil />} />
              <Route path="/organizacao" element={<OrganizacaoPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </OrganizacaoProvider>
    </ThemeProvider>
  )
}
