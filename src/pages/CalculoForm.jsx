import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box, TextField, Button, Paper, Typography, MenuItem, Alert, Snackbar,
  CircularProgress, Grid,
} from '@mui/material'
import { ArrowBack, Save } from '@mui/icons-material'
import api from '../api/axios'

export default function CalculoForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [form, setForm] = useState({
    nome: '',
    metodo: 'parcela_fixa',
    erro_admissivel: 10,
    area_parcela: 400,
    area_total: '',
    estado: 'ES',
    bioma: 'Mata Atlântica',
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [snack, setSnack] = useState({ open: false, severity: 'success', message: '' })

  useEffect(() => {
    if (isEdit) {
      setLoading(true)
      api.get(`/calculo/projeto/${id}`)
        .then(({ data }) => {
          setForm({
            nome: data.nome || '',
            metodo: data.metodo || 'parcela_fixa',
            erro_admissivel: data.erro_admissivel || 10,
            area_parcela: data.area_parcela || '',
            area_total: data.area_total || '',
            estado: data.estado || 'ES',
            bioma: data.bioma || 'Mata Atlântica',
          })
        })
        .catch(() => setSnack({ open: true, severity: 'error', message: 'Erro ao carregar projeto.' }))
        .finally(() => setLoading(false))
    }
  }, [id, isEdit])

  const handleChange = (field) => (e) => {
    const val = e.target.value
    setForm((prev) => ({ ...prev, [field]: val }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        area_parcela: form.area_parcela ? Number(form.area_parcela) : undefined,
        area_total: form.area_total ? Number(form.area_total) : undefined,
        erro_admissivel: Number(form.erro_admissivel),
      }

      if (isEdit) {
        await api.patch(`/calculo/projeto/${id}`, payload)
        setSnack({ open: true, severity: 'success', message: 'Projeto atualizado.' })
      } else {
        const { data } = await api.post('/calculo/projeto', payload)
        setSnack({ open: true, severity: 'success', message: 'Projeto criado!' })
        setTimeout(() => navigate(`/calculos/${data._id}/importar`), 800)
        return
      }

      setTimeout(() => navigate('/calculos'), 800)
    } catch (err) {
      const msg = err.response?.data?.message || 'Erro ao salvar projeto.'
      setSnack({ open: true, severity: 'error', message: msg })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/calculos')}>
          Voltar
        </Button>
        <Typography variant="h5" fontWeight="600">
          {isEdit ? 'Editar Projeto' : 'Novo Projeto de Cálculo'}
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Nome do projeto"
                fullWidth
                required
                value={form.nome}
                onChange={handleChange('nome')}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="Método"
                select
                fullWidth
                value={form.metodo}
                onChange={handleChange('metodo')}
              >
                <MenuItem value="parcela_fixa">Parcela Fixa</MenuItem>
                <MenuItem value="censo">Censo (100%)</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="Erro admissível (%)"
                type="number"
                fullWidth
                value={form.erro_admissivel}
                onChange={handleChange('erro_admissivel')}
                inputProps={{ min: 0.1, max: 100, step: 0.1 }}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="Área da parcela (m²)"
                type="number"
                fullWidth
                value={form.area_parcela}
                onChange={handleChange('area_parcela')}
                helperText="Padrão: 400 m²"
                inputProps={{ min: 1 }}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="Área total (ha)"
                type="number"
                fullWidth
                value={form.area_total}
                onChange={handleChange('area_total')}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="Estado"
                fullWidth
                value={form.estado}
                onChange={handleChange('estado')}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="Bioma"
                fullWidth
                value={form.bioma}
                onChange={handleChange('bioma')}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={() => navigate('/calculos')}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" startIcon={<Save />} disabled={saving}>
              {saving ? 'Salvando...' : isEdit ? 'Atualizar' : 'Criar Projeto'}
            </Button>
          </Box>
        </Box>
      </Paper>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}