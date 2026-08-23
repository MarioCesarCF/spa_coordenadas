import { useState } from 'react'
import { Box, Tab, Tabs, Typography } from '@mui/material'
import AdminOrganizacoes from './AdminOrganizacoes'
import AdminUsuarios from './AdminUsuarios'
import AdminLogs from './AdminLogs'

function TabPanel({ children, value, index }) {
  if (value !== index) return null
  return <Box sx={{ pt: 2 }}>{children}</Box>
}

export default function AdminPage() {
  const [tab, setTab] = useState(0)
console.log("cheguei na admin page?")
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Administração
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tab} onChange={(_, novo) => setTab(novo)}>
          <Tab label="Organizações" />
          <Tab label="Usuários" />
          <Tab label="Logs de Auditoria" />
        </Tabs>
      </Box>

      <TabPanel value={tab} index={0}>
        <AdminOrganizacoes />
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <AdminUsuarios />
      </TabPanel>
      <TabPanel value={tab} index={2}>
        <AdminLogs />
      </TabPanel>
    </Box>
  )
}
