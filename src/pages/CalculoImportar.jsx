import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box, Button, Paper, Typography, Alert, Snackbar, LinearProgress, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, Chip,
} from '@mui/material'
import { ArrowBack, CloudUpload, CheckCircle } from '@mui/icons-material'
import api from '../api/axios'

export default function CalculoImportar() {
  const { id } = useParams()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [projeto, setProjeto] = useState(null)
  const [loading, setLoading] = useState(true)
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [snack, setSnack] = useState({ open: false, severity: 'success', message: '' })

  useEffect(() => {
    api.get(`/calculo/projeto/${id}`)
      .then(({ data }) => setProjeto(data))
      .catch(() => {
        setError('Projeto não encontrado.')
        setTimeout(() => navigate('/calculos'), 2000)
      })
      .finally(() => setLoading(false))
  }, [id, navigate])

  const handleFileChange = (e) => {
    const f = e.target.files[0]
    if (f) {
      if (!f.name.match(/\.(xlsx|xls)$/i)) {
        setSnack({ open: true, severity: 'error', message: 'Formato não suportado. Use .xlsx' })
        return
      }
      setFile(f)
      setError('')
      setResult(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)

      const { data } = await api.post(`/calculo/projeto/${id}/importar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setResult(data)
      setSnack({ open: true, severity: 'success', message: data.message })
    } catch (err) {
      const msg = err.response?.data?.message || 'Erro ao importar arquivo.'
      setError(msg)
    } finally {
      setUploading(false)
    }
  }

  const handleProcessar = async () => {
    setUploading(true)
    try {
      await api.post(`/calculo/projeto/${id}/processar`)
      setSnack({ open: true, severity: 'success', message: 'Cálculos processados!' })
      setTimeout(() => navigate(`/calculos/${id}`), 800)
    } catch (err) {
      const msg = err.response?.data?.message || 'Erro ao processar cálculos.'
      setError(msg)
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <LinearProgress sx={{ width: '100%' }} />
      </Box>
    )
  }

  if (error && !projeto) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/calculos')}>
          Voltar
        </Button>
        <Typography variant="h5" fontWeight="600">
          Importar Dados — {projeto?.nome}
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="500">
          Selecione a planilha de campo
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Formato: .xlsx com colunas de Parcela, NID, CAP e Altura.
          A detecção das colunas é automática.
        </Typography>

        <input
          type="file"
          accept=".xlsx,.xls"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<CloudUpload />}
            onClick={() => fileInputRef.current?.click()}
          >
            {file ? file.name : 'Escolher arquivo'}
          </Button>

          {file && (
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? 'Importando...' : 'Importar'}
            </Button>
          )}
        </Box>

        {result && (
          <Alert severity="success" sx={{ mt: 2 }} icon={<CheckCircle />}>
            {result.total} árvores importadas da aba &quot;{result.sheetName}&quot;
          </Alert>
        )}
      </Paper>

      {result && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom fontWeight="500">
            Dados importados com sucesso
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            As árvores foram importadas. Agora você pode processar os cálculos
            ou voltar e ver os resultados.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="contained" onClick={handleProcessar} disabled={uploading}>
              Processar Cálculos
            </Button>
            <Button variant="outlined" onClick={() => navigate(`/calculos/${id}`)}>
              Ver Resultados
            </Button>
          </Box>
        </Paper>
      )}

      {error && projeto && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}