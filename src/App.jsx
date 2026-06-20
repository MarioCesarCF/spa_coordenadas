import { Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import PrivateRoute from './components/PrivateRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import EmpresaLista from './pages/EmpresaLista'
import EmpresaForm from './pages/EmpresaForm'

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
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<EmpresaLista />} />
            <Route path="/empresa/nova" element={<EmpresaForm />} />
            <Route path="/empresa/:id/editar" element={<EmpresaForm />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  )
}
