import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box, Button, Paper, Typography, Tabs, Tab, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, CircularProgress, Alert, Grid,
  Card, CardContent,
} from '@mui/material'
import { ArrowBack, CloudUpload, Refresh } from '@mui/icons-material'
import api from '../api/axios'
import { useOrg } from '../contexts/OrganizacaoContext'

function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null
}

export default function CalculoResultados() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { org } = useOrg()
  const [tab, setTab] = useState(0)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const calculosHabilitados = !org || !!org.config_limites?.calculos_habilitados

  const fetchResultados = async () => {
    setLoading(true)
    try {
      const { data: res } = await api.get(`/calculo/projeto/${id}/resultados`)
      setData(res)
    } catch (err) {
      const msg = err.response?.data?.message || 'Erro ao carregar resultados.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchResultados() }, [id])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Alert severity="error" action={<Button onClick={fetchResultados}>Tentar novamente</Button>}>
          {error}
        </Alert>
      </Box>
    )
  }

  if (!data || !data.projeto) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Alert severity="warning">Projeto não encontrado.</Alert>
      </Box>
    )
  }

  const { projeto, dendrometria, parcelas, suficiencia, fitossociologia, distribuicaoDiametrica } = data
  const temProcesso = projeto.status === 'processado'

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/calculos')}>
          Voltar
        </Button>
        <Typography variant="h5" sx={{ fontWeight: 600, flex: 1 }}>
          {projeto.nome}
        </Typography>
        <Chip
          label={projeto.status === 'processado' ? 'Processado' : 'Importado'}
          color={projeto.status === 'processado' ? 'success' : 'info'}
          size="small"
        />
        {calculosHabilitados && projeto.status === 'importado' && (
          <>
            <Button variant="contained" startIcon={<Refresh />} onClick={async () => {
              try {
                await api.post(`/calculo/projeto/${id}/processar`)
                fetchResultados()
              } catch {}
            }}>
              Processar
            </Button>
          </>
        )}
        {calculosHabilitados && projeto.status === 'rascunho' && (
          <Button variant="outlined" startIcon={<CloudUpload />} onClick={() => navigate(`/calculos/${id}/importar`)}>
            Importar dados
          </Button>
        )}
      </Box>

      {!calculosHabilitados ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Cálculos florestais não estão incluídos no seu plano atual. Faça upgrade para processar projetos.
        </Alert>
      ) : (
        !temProcesso && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Projeto importado mas ainda não processado. Clique em &ldquo;Processar&rdquo; para executar os cálculos.
          </Alert>
        )
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tab} onChange={(e, v) => setTab(v)}>
          <Tab label="Resumo" />
          <Tab label="Estatística" disabled={!temProcesso} />
          <Tab label="Fitossociologia" disabled={!temProcesso} />
          <Tab label="Distribuição Diamétrica" disabled={!temProcesso} />
        </Tabs>
      </Box>

      {/* RESUMO */}
      <TabPanel value={tab} index={0}>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card><CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">{dendrometria.totalArvores}</Typography>
              <Typography variant="body2" color="text.secondary">Total de Árvores</Typography>
            </CardContent></Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card><CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">{dendrometria.dapMedio}</Typography>
              <Typography variant="body2" color="text.secondary">DAP Médio (cm)</Typography>
            </CardContent></Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card><CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">{dendrometria.alturaMedia}</Typography>
              <Typography variant="body2" color="text.secondary">Altura Média (m)</Typography>
            </CardContent></Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card><CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">{dendrometria.volumeTotal?.toFixed(4)}</Typography>
              <Typography variant="body2" color="text.secondary">Volume Total (m³)</Typography>
            </CardContent></Card>
          </Grid>
        </Grid>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 500 }} gutterBottom>Resumo das Parcelas</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Parcela</TableCell>
                  <TableCell align="right">Nº Árvores</TableCell>
                  <TableCell align="right">Área Basal (m²)</TableCell>
                  <TableCell align="right">Volume (m³)</TableCell>
                  <TableCell align="right">Volume/ha (m³/ha)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {parcelas?.parcelas?.map((p) => (
                  <TableRow key={p.parcela}>
                    <TableCell>{p.parcela}</TableCell>
                    <TableCell align="right">{p.arvores.length}</TableCell>
                    <TableCell align="right">{p.totalAB?.toFixed(4)}</TableCell>
                    <TableCell align="right">{p.totalVol?.toFixed(4)}</TableCell>
                    <TableCell align="right">{(p.totalVol * parcelas.F)?.toFixed(4)}</TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ fontWeight: 'bold' }}>
                  <TableCell><strong>Total</strong></TableCell>
                  <TableCell align="right"><strong>{dendrometria.totalArvores}</strong></TableCell>
                  <TableCell align="right"><strong>{parcelas?.parcelas?.reduce((s, p) => s + p.totalAB, 0)?.toFixed(4)}</strong></TableCell>
                  <TableCell align="right"><strong>{parcelas?.totalGeral?.toFixed(4)}</strong></TableCell>
                  <TableCell align="right"><strong>{parcelas?.totalGeralHa?.toFixed(4)}</strong></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {parcelas && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Informações do Projeto</Typography>
            <Typography variant="body2">
              Método: {projeto.metodo === 'censo' ? 'Censo' : 'Parcela Fixa'} |
              Área da parcela: {projeto.area_parcela || 400} m² |
              Fator de expansão (F): {parcelas.F?.toFixed(4)} |
              Área amostrada: {parcelas.areaAmostradaHa?.toFixed(4)} ha |
              Erro admissível: {projeto.erro_admissivel || 10}%
            </Typography>
          </Paper>
        )}
      </TabPanel>

      {/* ESTATÍSTICA */}
      <TabPanel value={tab} index={1}>
        {parcelas?.estatisticas ? (
          <>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 500 }} gutterBottom>Estatística Amostral</Typography>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow><TableCell>Número de parcelas (n)</TableCell><TableCell>{parcelas.estatisticas.n}</TableCell></TableRow>
                    <TableRow><TableCell>Média (Vha)</TableCell><TableCell>{parcelas.estatisticas.media?.toFixed(4)} m³/ha</TableCell></TableRow>
                    <TableRow><TableCell>Variância (S²)</TableCell><TableCell>{parcelas.estatisticas.variancia?.toFixed(4)}</TableCell></TableRow>
                    <TableRow><TableCell>Desvio padrão (S)</TableCell><TableCell>{parcelas.estatisticas.desvioPadrao?.toFixed(4)}</TableCell></TableRow>
                    <TableRow><TableCell>Erro padrão da média</TableCell><TableCell>{parcelas.estatisticas.erroPadrao?.toFixed(4)}</TableCell></TableRow>
                    <TableRow><TableCell>Intervalo de Confiança (95%)</TableCell><TableCell>± {parcelas.estatisticas.IC?.toFixed(4)} m³/ha</TableCell></TableRow>
                    <TableRow><TableCell>Erro Amostral</TableCell><TableCell>{parcelas.estatisticas.erroAmostral?.toFixed(2)}%</TableCell></TableRow>
                    <TableRow><TableCell>Coeficiente de Variação (CV)</TableCell><TableCell>{parcelas.estatisticas.cv?.toFixed(2)}%</TableCell></TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {suficiencia && (
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }} gutterBottom>Suficiência Amostral</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow><TableCell>Número ótimo de parcelas (n ideal)</TableCell><TableCell>{suficiencia.nOtimo}</TableCell></TableRow>
                      <TableRow><TableCell>Parcelas adicionais necessárias</TableCell><TableCell>{suficiencia.parcelasAdicionais}</TableCell></TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
                {suficiencia.parcelasAdicionais > 0 ? (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    A amostragem atual é insuficiente. São necessárias mais {suficiencia.parcelasAdicionais} parcela(s).
                  </Alert>
                ) : (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    A amostragem é suficiente para o erro admissível de {projeto.erro_admissivel || 10}%.
                  </Alert>
                )}
              </Paper>
            )}
          </>
        ) : (
          <Alert severity="info">Processe o projeto para ver a estatística amostral.</Alert>
        )}
      </TabPanel>

      {/* FITOSSOCIOLOGIA */}
      <TabPanel value={tab} index={2}>
        {fitossociologia?.length > 0 ? (
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }} gutterBottom>
              Parâmetros Fitossociológicos
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Espécie</TableCell>
                    <TableCell align="right">N</TableCell>
                    <TableCell align="right">DA</TableCell>
                    <TableCell align="right">DR (%)</TableCell>
                    <TableCell align="right">FA (%)</TableCell>
                    <TableCell align="right">FR (%)</TableCell>
                    <TableCell align="right">DoA</TableCell>
                    <TableCell align="right">DoR (%)</TableCell>
                    <TableCell align="right">IVI</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fitossociologia.map((sp, i) => (
                    <TableRow key={i} hover>
                      <TableCell>
                        <Typography variant="body2">
                          <em>{sp.nome_cientifico || sp.nome_comum || 'Desconhecida'}</em>
                          {sp.nome_comum && sp.nome_cientifico && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              {sp.nome_comum}
                            </Typography>
                          )}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{sp.nid}</TableCell>
                      <TableCell align="right">{sp.DA}</TableCell>
                      <TableCell align="right">{sp.DR}</TableCell>
                      <TableCell align="right">{sp.FA}</TableCell>
                      <TableCell align="right">{sp.FR}</TableCell>
                      <TableCell align="right">{sp.DoA}</TableCell>
                      <TableCell align="right">{sp.DoR}</TableCell>
                      <TableCell align="right"><strong>{sp.IVI}</strong></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        ) : (
          <Alert severity="info">Processe o projeto para ver a fitossociologia.</Alert>
        )}
      </TabPanel>

      {/* DISTRIBUIÇÃO DIAMÉTRICA */}
      <TabPanel value={tab} index={3}>
        {distribuicaoDiametrica?.length > 0 ? (
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }} gutterBottom>
              Distribuição Diamétrica
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Classe (cm)</TableCell>
                    <TableCell align="right">Nº de Fustes</TableCell>
                    <TableCell align="right">Área Basal (m²)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {distribuicaoDiametrica.map((cd, i) => (
                    <TableRow key={i} hover>
                      <TableCell>{cd.classe}</TableCell>
                      <TableCell align="right">{cd.nf}</TableCell>
                      <TableCell align="right">{cd.ab_total?.toFixed(4)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ fontWeight: 'bold' }}>
                    <TableCell><strong>Total</strong></TableCell>
                    <TableCell align="right"><strong>{distribuicaoDiametrica.reduce((s, c) => s + c.nf, 0)}</strong></TableCell>
                    <TableCell align="right"><strong>{distribuicaoDiametrica.reduce((s, c) => s + c.ab_total, 0)?.toFixed(4)}</strong></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        ) : (
          <Alert severity="info">Processe o projeto para ver a distribuição diamétrica.</Alert>
        )}
      </TabPanel>
    </Box>
  )
}