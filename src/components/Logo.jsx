import { Box } from '@mui/material'

export default function Logo({ sx }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 64 64"
      sx={{ display: 'block', width: 32, height: 32, ...sx }}
    >
      <circle cx="32" cy="32" r="25" fill="none" stroke="currentColor" strokeWidth="5" />
      <path fill="currentColor" d="M32 13 L26 25 L38 25 Z M24 25 L40 25 L32 39 Z M22 39 L42 39 L32 51 Z" />
      <g stroke="currentColor" strokeWidth="5" strokeLinecap="round">
        <line x1="32" y1="4" x2="32" y2="9" />
        <line x1="32" y1="55" x2="32" y2="60" />
        <line x1="4" y1="32" x2="9" y2="32" />
        <line x1="55" y1="32" x2="60" y2="32" />
      </g>
    </Box>
  )
}
