import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material'
import { Save, ArrowBack } from '@mui/icons-material'
import api from '../api/axios'

const initialForm = {
  nome: '',
  numero_documento: '',
  cidade: '',
  local_intervencao: '',
  modalidade: '',
  numero_processo: '',
  ano: '',
  mes: '',
  decisao: '',
  bioma: '',
  area_autorizada: '',
  coordenada_x: '',
  longitude: '',
  coordenada_y: '',
  latitude: '',
  fuso: '',
}

export default function EmpresaForm() {
  const { id } = useParams()
  const isEditing = !!id
  const navigate = useNavigate()

  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isEditing) {
      setLoading(true)
      api
        .get(`/empresa/${id}`)
        .then(({ data }) => {
          setForm({
            nome: data.nome || '',
            numero_documento: data.numero_documento || '',
            cidade: data.cidade || '',
            local_intervencao: data.local_intervencao || '',
            modalidade: data.modalidade || '',
            numero_processo: data.numero_processo || '',
            ano: data.ano?.toString() || '',
            mes: data.mes || '',
            decisao: data.decisao || '',
            bioma: data.bioma || '',
            area_autorizada: data.area_autorizada?.toString() || '',
            coordenada_x: data.coordenada_x?.toString() || '',
            longitude: data.longitude?.toString() || '',
            coordenada_y: data.coordenada_y?.toString() || '',
            latitude: data.latitude?.toString() || '',
            fuso: data.fuso || '',
          })
        })
        .catch((err) => {
          setError('Erro ao carregar dados da empresa.')
          console.error(err)
        })
        .finally(() => setLoading(false))
    }
  }, [id, isEditing])

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    const payload = { ...form }
    const numericFields = ['ano', 'area_autorizada', 'coordenada_x', 'longitude', 'coordenada_y', 'latitude']
    for (const field of numericFields) {
      if (payload[field] === '') {
        payload[field] = undefined
      } else {
        payload[field] = Number(payload[field])
      }
    }

    try {
      if (isEditing) {
        await api.patch(`/empresa/${id}`, payload)
      } else {
        await api.post('/empresa', payload)
      }
      navigate('/', { replace: true })
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Erro ao salvar empresa. Verifique os dados.'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/')}>
          Voltar
        </Button>
        <Typography variant="h5" fontWeight="600">
          {isEditing ? 'Editar Empresa' : 'Nova Empresa'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Typography variant="subtitle1" fontWeight="600" gutterBottom>
            Dados Gerais
          </Typography>
          <Grid container spacing={2} mb={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Nome *"
                fullWidth
                required
                value={form.nome}
                onChange={handleChange('nome')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Nº Documento *"
                fullWidth
                required
                value={form.numero_documento}
                onChange={handleChange('numero_documento')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Cidade *"
                fullWidth
                required
                value={form.cidade}
                onChange={handleChange('cidade')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Local de Intervenção"
                fullWidth
                value={form.local_intervencao}
                onChange={handleChange('local_intervencao')}
              />
            </Grid>
          </Grid>

          <Typography variant="subtitle1" fontWeight="600" gutterBottom>
            Processo
          </Typography>
          <Grid container spacing={2} mb={3}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Nº Processo"
                fullWidth
                value={form.numero_processo}
                onChange={handleChange('numero_processo')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Modalidade"
                fullWidth
                value={form.modalidade}
                onChange={handleChange('modalidade')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Ano"
                fullWidth
                type="number"
                value={form.ano}
                onChange={handleChange('ano')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Mês"
                fullWidth
                value={form.mes}
                onChange={handleChange('mes')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Decisão"
                fullWidth
                value={form.decisao}
                onChange={handleChange('decisao')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Bioma"
                fullWidth
                value={form.bioma}
                onChange={handleChange('bioma')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Área Autorizada (ha)"
                fullWidth
                type="number"
                value={form.area_autorizada}
                onChange={handleChange('area_autorizada')}
              />
            </Grid>
          </Grid>

          <Typography variant="subtitle1" fontWeight="600" gutterBottom>
            Coordenadas
          </Typography>
          <Grid container spacing={2} mb={3}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Coordenada X (UTM)"
                fullWidth
                type="number"
                value={form.coordenada_x}
                onChange={handleChange('coordenada_x')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Longitude (WGS84)"
                fullWidth
                type="number"
                value={form.longitude}
                onChange={handleChange('longitude')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Fuso"
                fullWidth
                value={form.fuso}
                onChange={handleChange('fuso')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Coordenada Y (UTM)"
                fullWidth
                type="number"
                value={form.coordenada_y}
                onChange={handleChange('coordenada_y')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Latitude (WGS84)"
                fullWidth
                type="number"
                value={form.latitude}
                onChange={handleChange('latitude')}
              />
            </Grid>
          </Grid>

          <Box display="flex" gap={2} justifyContent="flex-end">
            <Button variant="outlined" onClick={() => navigate('/')}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Save />}
              disabled={saving}
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}
