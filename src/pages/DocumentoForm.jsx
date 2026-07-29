import { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  Box, Paper, Typography, TextField, Button, Alert, CircularProgress,
  FormControl, InputLabel, Select, MenuItem,
} from '@mui/material'
import { Save, ArrowBack, CloudUpload } from '@mui/icons-material'
import api from '../api/axios'

export default function DocumentoForm() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const empresaIdParam = searchParams.get('empresa')
  const isEditing = !!id
  const navigate = useNavigate()

  const [empresas, setEmpresas] = useState([])
  const [loadingEmpresas, setLoadingEmpresas] = useState(false)
  const [nome, setNome] = useState('')
  const [empresa, setEmpresa] = useState(empresaIdParam || '')
  const [dataVencimento, setDataVencimento] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [arquivo, setArquivo] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoadingEmpresas(true)
    api.get('/empresa')
      .then(({ data }) => setEmpresas(data))
      .catch(() => {})
      .finally(() => setLoadingEmpresas(false))
  }, [])

  useEffect(() => {
    if (isEditing) {
      api.get(`/documento/${id}`)
        .then(({ data }) => {
          setNome(data.nome || '')
          setEmpresa(data.empresa?._id || '')
          setDataVencimento(data.data_vencimento ? data.data_vencimento.slice(0, 10) : '')
          setObservacoes(data.observacoes || '')
        })
        .catch(() => setError('Erro ao carregar documento.'))
    }
  }, [id, isEditing])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      if (!isEditing && !arquivo) {
        setError('Selecione um arquivo para upload.')
        setSaving(false)
        return
      }

      const formData = new FormData()
      formData.append('empresa', empresa)
      formData.append('nome', nome)
      if (arquivo) formData.append('arquivo', arquivo)
      if (dataVencimento) formData.append('data_vencimento', dataVencimento)
      if (observacoes) formData.append('observacoes', observacoes)

      if (isEditing) {
        await api.patch(`/documento/${id}`, { nome, data_vencimento: dataVencimento || null, observacoes: observacoes || null })
      } else {
        await api.post('/documento', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      }

      navigate(empresaIdParam ? `/empresa/${empresaIdParam}/documentos` : '/documentos', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Erro ao salvar documento.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={3} flexWrap="wrap">
        <Button startIcon={<ArrowBack />} onClick={() => navigate(empresaIdParam ? `/empresa/${empresaIdParam}/documentos` : '/documentos')}>
          Voltar
        </Button>
        <Typography variant="h5" fontWeight="600">
          {isEditing ? 'Editar Documento' : 'Novo Documento'}
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <FormControl fullWidth sx={{ mb: 2 }} required={!isEditing}>
            <InputLabel>Empresa</InputLabel>
            <Select
              value={empresa}
              label="Empresa"
              onChange={(e) => setEmpresa(e.target.value)}
              disabled={isEditing || !!empresaIdParam}
            >
              {loadingEmpresas ? (
                <MenuItem disabled>Carregando...</MenuItem>
              ) : (
                empresas.map((emp) => (
                  <MenuItem key={emp._id} value={emp._id}>{emp.nome} - {emp.numero_documento}</MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          <TextField
            label="Nome do Documento"
            fullWidth required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            sx={{ mb: 2 }}
          />

          {!isEditing && (
            <Box sx={{ mb: 2 }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUpload />}
                fullWidth
                sx={{ py: 3, borderStyle: 'dashed' }}
              >
                {arquivo ? arquivo.name : 'Clique para selecionar o arquivo (PDF, imagem, DOC, etc.)'}
                <input
                  type="file"
                  hidden
                  onChange={(e) => setArquivo(e.target.files?.[0] || null)}
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
                />
              </Button>
              {arquivo && (
                <Typography variant="caption" color="text.secondary">
                  {(arquivo.size / 1024 / 1024).toFixed(2)} MB
                </Typography>
              )}
            </Box>
          )}

          <TextField
            label="Data de Vencimento"
            type="date"
            fullWidth
            value={dataVencimento}
            onChange={(e) => setDataVencimento(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Observações"
            fullWidth
            multiline
            rows={3}
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            sx={{ mb: 3 }}
          />

          <Box display="flex" gap={2} justifyContent="flex-end">
            <Button variant="outlined" onClick={() => navigate('/documentos')}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" startIcon={<Save />} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}
