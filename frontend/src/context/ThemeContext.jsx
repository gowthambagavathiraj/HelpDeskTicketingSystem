import { createContext, useContext, useState, useEffect } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

const ColorModeContext = createContext({ toggleColorMode: () => {}, mode: 'dark' })

export function ColorModeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('helpdesk_theme') || 'dark'
  })

  useEffect(() => {
    localStorage.setItem('helpdesk_theme', mode)
    const body = document.body
    if (mode === 'light') {
      body.classList.remove('dark-theme')
      body.classList.add('light-theme')
    } else {
      body.classList.remove('light-theme')
      body.classList.add('dark-theme')
    }
  }, [mode])

  const toggleColorMode = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  // Define MUI Theme configurations
  const muiTheme = createTheme({
    palette: {
      mode,
      primary: {
        main: '#3b82f6', // Bright Blue
        light: '#60a5fa',
        dark: '#1d4ed8',
      },
      secondary: {
        main: '#8b5cf6', // Bright Purple
        light: '#a78bfa',
        dark: '#6d28d9',
      },
      background: {
        default: mode === 'light' ? '#f8fafc' : '#0b0b18',
        paper: mode === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(19, 19, 31, 0.8)',
      },
      text: {
        primary: mode === 'light' ? '#0f172a' : '#f8fafc',
        secondary: mode === 'light' ? '#475569' : '#94a3b8',
      },
    },
    shape: {
      borderRadius: 16,
    },
    typography: {
      fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif",
      h1: { fontWeight: 700 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 600 },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 500 },
      h6: { fontWeight: 500 },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            backdropFilter: 'blur(12px)',
            border: mode === 'light' ? '1px solid rgba(226, 232, 240, 0.8)' : '1px solid rgba(46, 46, 74, 0.5)',
            boxShadow: mode === 'light' 
              ? '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05)'
              : '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.3)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 10,
            fontWeight: 500,
            padding: '8px 16px',
          },
        },
      },
    },
  })

  return (
    <ColorModeContext.Provider value={{ toggleColorMode, mode }}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}

export const useColorMode = () => useContext(ColorModeContext)
