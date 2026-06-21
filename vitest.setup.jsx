import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'
import React from 'react'

function mockComponent(defaultTag, displayName) {
  const Comp = React.forwardRef(({ children, sx, slotProps, component, label, ...props }, ref) => {
    const tag = component || defaultTag
    const extraProps = {}
    if (tag === 'input') {
      extraProps['aria-label'] = label
      extraProps['data-testid'] = displayName
    }
    if (tag === 'svg') {
      extraProps['data-testid'] = displayName
    }
    return React.createElement(tag, { ...props, ...extraProps, ref }, children)
  })
  Comp.displayName = displayName
  return Comp
}

vi.mock('@mui/material', () => {
  const mod = {
    __esModule: true,
    default: {},
    Box: mockComponent('div', 'Box'),
    Paper: mockComponent('div', 'Paper'),
    Card: mockComponent('div', 'Card'),
    CardContent: mockComponent('div', 'CardContent'),
    Typography: mockComponent('span', 'Typography'),
    Button: mockComponent('button', 'Button'),
    TextField: mockComponent('input', 'TextField'),
    Alert: mockComponent('div', 'Alert'),
    AppBar: mockComponent('div', 'AppBar'),
    Toolbar: mockComponent('div', 'Toolbar'),
    Container: mockComponent('div', 'Container'),
    Table: mockComponent('table', 'Table'),
    TableBody: mockComponent('tbody', 'TableBody'),
    TableCell: mockComponent('td', 'TableCell'),
    TableContainer: mockComponent('div', 'TableContainer'),
    TableHead: mockComponent('thead', 'TableHead'),
    TableRow: mockComponent('tr', 'TableRow'),
    TablePagination: mockComponent('div', 'TablePagination'),
    Dialog: React.forwardRef(({ children, open, sx, component, ...props }, ref) => {
      if (!open) return null
      return React.createElement('div', { ...props, ref }, children)
    }),
    DialogTitle: mockComponent('div', 'DialogTitle'),
    DialogContent: mockComponent('div', 'DialogContent'),
    DialogContentText: mockComponent('p', 'DialogContentText'),
    DialogActions: mockComponent('div', 'DialogActions'),
    Tooltip: mockComponent('span', 'Tooltip'),
    Snackbar: mockComponent('div', 'Snackbar'),
    CircularProgress: React.forwardRef((props, ref) => React.createElement('div', { ...props, role: 'progressbar', ref })),
    Grid: mockComponent('div', 'Grid'),
    IconButton: mockComponent('button', 'IconButton'),
    InputAdornment: mockComponent('div', 'InputAdornment'),
    CssBaseline: () => null,
    ThemeProvider: ({ children }) => React.createElement(React.Fragment, null, children),
    createTheme: () => ({}),
    useMediaQuery: () => false,
  }
  return mod
})

vi.mock('@mui/icons-material', () => {
  const icon = () => null
  icon.displayName = 'Icon'
  return {
    __esModule: true,
    default: icon,
    Visibility: icon,
    VisibilityOff: icon,
    Add: icon,
    Edit: (props) => React.createElement('svg', { 'data-testid': 'EditIcon', ...props }),
    Delete: (props) => React.createElement('svg', { 'data-testid': 'DeleteIcon', ...props }),
    Search: icon,
    Clear: icon,
    FileUpload: icon,
    Save: icon,
    ArrowBack: icon,
    Logout: icon,
  }
})

vi.mock('leaflet', () => {
  const mockIcon = { options: {} }
  function MockIcon() { return mockIcon }
  MockIcon.prototype = { options: {} }
  return {
    default: {
      Icon: MockIcon,
      icon: vi.fn(() => mockIcon),
      DomEvent: { disableClickPropagation: vi.fn(), disableScrollPropagation: vi.fn() },
      DivIcon: vi.fn(),
      popup: vi.fn(() => ({ setLatLng: vi.fn() })),
      marker: vi.fn(() => ({ addTo: vi.fn(), setLatLng: vi.fn() })),
      tileLayer: vi.fn(() => ({ addTo: vi.fn() })),
      map: vi.fn(() => ({ setView: vi.fn(), getZoom: vi.fn(() => 13), remove: vi.fn() })),
    },
    Icon: MockIcon,
    icon: vi.fn(() => mockIcon),
  }
})

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children, center, zoom, style }) =>
    React.createElement('div', { 'data-testid': 'map-container', 'data-center': JSON.stringify(center), 'data-zoom': zoom, style }, children),
  TileLayer: () => null,
  Marker: ({ position }) =>
    position ? React.createElement('div', { 'data-testid': 'marker', 'data-position': JSON.stringify(position) }) : null,
  useMapEvents: vi.fn(() => null),
  useMap: vi.fn(() => ({ setView: vi.fn(), getZoom: vi.fn(() => 13) })),
}))

vi.mock('@mui/material/styles', () => ({
  useTheme: () => ({ palette: { primary: { main: '#2e7d32' }, mode: 'light' } }),
  styled: (Comp) => Comp,
  createTheme: () => ({}),
}))
