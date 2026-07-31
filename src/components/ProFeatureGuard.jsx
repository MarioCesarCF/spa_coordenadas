import { Link } from 'react-router-dom'
import { Alert, Box, Button, Paper, Typography } from '@mui/material'
import { useOrg } from '../contexts/OrganizacaoContext'

export default function ProFeatureGuard({ children }) {
  const { org, orgLoading } = useOrg()

  if (orgLoading) return null

  if (org?.config_limites?.calculos_habilitados) {
    return children
  }

  return (
    <Paper sx={{ p: 4, maxWidth: 560, mx: 'auto', mt: 4 }}>
      <Alert severity="info" sx={{ mb: 2 }}>
        Recurso disponível nos planos Profissional e Enterprise
      </Alert>
      <Typography sx={{ mb: 2 }}>
        Os cálculos florestais não estão habilitados no plano atual da sua organização.
      </Typography>
      <Box>
        <Button component={Link} to="/organizacao" variant="contained">
          Ver planos
        </Button>
      </Box>
    </Paper>
  )
}
