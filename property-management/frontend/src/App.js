import React, { useState } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import PropertiesPage from './pages/PropertiesPage';
import TenantsPage from './pages/TenantsPage';
import MaintenancePage from './pages/MaintenancePage';
import StaffPage from './pages/StaffPage';
import ContractsPage from './pages/ContractsPage';
import Navigation from './components/Navigation';

// Prefer explicit API override, else use dev localhost, else same-origin (for prod behind proxy)
const apiBase = process.env.REACT_APP_PM_API
  || (process.env.NODE_ENV === 'development' ? 'http://localhost:5050/api' : '/api');

const theme = createTheme({
  palette: {
    primary: { main: '#1d4ed8' },
    secondary: { main: '#10b981' },
    background: { default: '#f5f7fb' },
  },
  shape: { borderRadius: 14 },
});

function App() {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const currentTheme = createTheme({
    ...theme,
    palette: {
      ...theme.palette,
      mode: darkMode ? 'dark' : 'light',
    },
  });

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          <Navigation apiBase={apiBase} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage apiBase={apiBase} />} />
              <Route path="/properties" element={<PropertiesPage apiBase={apiBase} />} />
              <Route path="/tenants" element={<TenantsPage apiBase={apiBase} />} />
              <Route path="/maintenance" element={<MaintenancePage apiBase={apiBase} />} />
              <Route path="/staff" element={<StaffPage apiBase={apiBase} />} />
              <Route path="/contracts" element={<ContractsPage apiBase={apiBase} />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
