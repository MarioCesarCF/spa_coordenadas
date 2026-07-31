import { Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { lightTheme } from './contexts/ThemeContext'
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
import CalculoLista from './pages/CalculoLista'
import CalculoForm from './pages/CalculoForm'
import CalculoImportar from './pages/CalculoImportar'
import CalculoResultados from './pages/CalculoResultados'
import { OrganizacaoProvider } from './contexts/OrganizacaoContext'

export default function App() {
  return (
    <>
      <CssBaseline />
      <OrganizacaoProvider>
        <Routes>
          <Route
            path="/login"
            element={
              <ThemeProvider theme={lightTheme}>
                <Login />
              </ThemeProvider>
            }
          />
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
              <Route path="/calculos" element={<CalculoLista />} />
              <Route path="/calculos/novo" element={<CalculoForm />} />
              <Route path="/calculos/:id" element={<CalculoResultados />} />
              <Route path="/calculos/:id/importar" element={<CalculoImportar />} />
              <Route path="/calculos/:id/editar" element={<CalculoForm />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </OrganizacaoProvider>
    </>
  )
}
