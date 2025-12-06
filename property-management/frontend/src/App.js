import React from 'react';
import { ThemeProvider, createTheme, CssBaseline, Container, Box, Typography, Grid, Paper, Button } from '@mui/material';

const apiBase = process.env.REACT_APP_PM_API || 'http://localhost:5050/api';

const theme = createTheme({
  palette: {
    primary: { main: '#1d4ed8' },
    secondary: { main: '#10b981' },
    background: { default: '#f5f7fb' },
  },
  shape: { borderRadius: 14 },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>Property Management</Typography>
            <Typography variant="body1" color="text.secondary">API: {apiBase}</Typography>
          </Box>
          <Button variant="contained" size="large">Add Property</Button>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Properties</Typography>
              <Typography variant="body2" color="text.secondary">List and manage properties</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Tenants</Typography>
              <Typography variant="body2" color="text.secondary">Track tenants and leases</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Maintenance</Typography>
              <Typography variant="body2" color="text.secondary">Handle maintenance requests</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
}

export default App;
