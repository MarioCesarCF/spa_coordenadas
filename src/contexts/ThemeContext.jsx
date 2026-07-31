import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles'

const STORAGE_KEY = 'sylven_theme_mode'

const ThemeContext = createContext({
  mode: 'light',
  toggleTheme: () => {},
})

export const lightTheme = createTheme({
  palette: {
    primary: { main: '#2e7d32' },
  },
})

function readStoredMode() {
  try {
    return localStorage.getItem(STORAGE_KEY) || 'light'
  } catch {
    return 'light'
  }
}

export default function ThemeProvider({ children }) {
  const [mode, setMode] = useState(readStoredMode)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, mode)
    } catch {
      // storage indisponível (ex.: modo anônimo) — segue sem persistir
    }
  }, [mode])

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: '#2e7d32' },
        },
      }),
    [mode],
  )

  const value = useMemo(
    () => ({
      mode,
      toggleTheme: () => setMode((prev) => (prev === 'light' ? 'dark' : 'light')),
    }),
    [mode],
  )

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  )
}

export function useThemeMode() {
  return useContext(ThemeContext)
}
