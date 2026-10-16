import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, CssBaseline, Box, CircularProgress } from '@mui/material'
import { lightTheme } from './contexts/ThemeContext'
import PrivateRoute from './components/PrivateRoute'
import AdminRoute from './components/AdminRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import EsqueciSenha from './pages/EsqueciSenha'
import RedefinirSenha from './pages/RedefinirSenha'
import { OrganizacaoProvider } from './contexts/OrganizacaoContext'
import ProFeatureGuard from './components/ProFeatureGuard'

// Páginas autenticadas carregadas sob demanda: a rota pública (/login) não paga por elas.
const EmpresaLista = lazy(() => import('./pages/EmpresaLista'))
const EmpresaForm = lazy(() => import('./pages/EmpresaForm')) // contém Leaflet
const OrganizacaoPage = lazy(() => import('./pages/OrganizacaoPage'))
const DocumentoLista = lazy(() => import('./pages/DocumentoLista'))
const DocumentoForm = lazy(() => import('./pages/DocumentoForm'))
const Perfil = lazy(() => import('./pages/Perfil'))
const CalculoLista = lazy(() => import('./pages/CalculoLista'))
const CalculoForm = lazy(() => import('./pages/CalculoForm'))
const CalculoImportar = lazy(() => import('./pages/CalculoImportar'))
const CalculoResultados = lazy(() => import('./pages/CalculoResultados'))
const AdminPage = lazy(() => import('./pages/admin/AdminPage'))

function RouteFallback() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <CircularProgress />
    </Box>
  )
}

export default function App() {
  return (
    <>
      <CssBaseline />
      <OrganizacaoProvider>
        <Suspense fallback={<RouteFallback />}>
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
                <Route path="/calculos/novo" element={<ProFeatureGuard><CalculoForm /></ProFeatureGuard>} />
                <Route path="/calculos/:id" element={<CalculoResultados />} />
                <Route path="/calculos/:id/importar" element={<ProFeatureGuard><CalculoImportar /></ProFeatureGuard>} />
                <Route path="/calculos/:id/editar" element={<ProFeatureGuard><CalculoForm /></ProFeatureGuard>} />
                <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </OrganizacaoProvider>
    </>
  )
}
