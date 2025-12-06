import React from 'react';
import { ThemeProvider, createTheme, CssBaseline, Container, Box, Typography, Grid, Paper, Button } from '@mui/material';
import WelcomePage from './pages/WelcomePage';

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
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">API: {apiBase}</Typography>
        </Box>
        <WelcomePage onGetStarted={() => { /* hook routing later */ }} />
      </Container>
    </ThemeProvider>
  );
}

export default App;
