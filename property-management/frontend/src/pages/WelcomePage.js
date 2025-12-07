import React from 'react';
import { Box, Typography, Button, Grid, Paper } from '@mui/material';

function WelcomePage({ onGetStarted }) {
  return (
    <Box sx={{ mb: 4 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          background: 'linear-gradient(135deg, #1d4ed8 0%, #0ea5e9 50%, #10b981 100%)',
          color: '#fff'
        }}
      >
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
          Welcome to Property Management
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
          Track properties, tenants, leases, and maintenance in one place.
        </Typography>
        <Button variant="contained" color="secondary" size="large" onClick={onGetStarted}>
          Get Started
        </Button>
      </Paper>

      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Properties</Typography>
            <Typography variant="body2" color="text.secondary">
              Add buildings, set managers, and track available units.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Tenants & Leases</Typography>
            <Typography variant="body2" color="text.secondary">
              Keep tenant contact info, lease terms, rent amounts, and dates.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Maintenance</Typography>
            <Typography variant="body2" color="text.secondary">
              Log requests, prioritize, and monitor resolution status.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default WelcomePage;
