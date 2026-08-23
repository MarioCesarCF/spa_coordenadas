import { Component } from 'react'
import { Box, Typography, Button, Paper } from '@mui/material'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Erro capturado pelo ErrorBoundary:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <Box
          sx={{
            minHeight: '100dvh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
            bgcolor: 'background.default',
          }}
        >
          <Paper sx={{ p: 3, maxWidth: 600, width: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Algo deu errado
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Ocorreu um erro inesperado ao renderizar esta tela. Tente recarregar a página
              (Ctrl+F5). Se persistir, envie a mensagem abaixo para o suporte.
            </Typography>
            <Box
              component="pre"
              sx={{
                m: 0,
                mb: 2,
                p: 1.5,
                bgcolor: 'action.hover',
                borderRadius: 1,
                fontSize: 12,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                maxHeight: 200,
                overflow: 'auto',
              }}
            >
              {String(this.state.error?.message || this.state.error)}
            </Box>
            <Button variant="contained" onClick={() => window.location.assign('/')}>
              Ir para o início
            </Button>
          </Paper>
        </Box>
      )
    }

    return this.props.children
  }
}
