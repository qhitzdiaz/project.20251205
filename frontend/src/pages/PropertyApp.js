import React from 'react';
import { Container, Box, Typography, Grid, Paper, Button } from '@mui/material';

const API_BASE = process.env.REACT_APP_PROPERTY_API || 'http://localhost:5050/api';

function PropertyApp() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Property Management</Typography>
          <Typography variant="body2" color="text.secondary">API: {API_BASE}</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Track properties, tenants, leases, and maintenance requests from one place.
          </Typography>
        </Box>
        <Button variant="contained" size="large">Add Property</Button>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Properties</Typography>
            <Typography variant="body2" color="text.secondary">
              Add buildings, assign managers, track available units, and store addresses.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Tenants & Leases</Typography>
            <Typography variant="body2" color="text.secondary">
              Keep tenant contact info, lease dates, rent amounts, and unit assignments.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Maintenance</Typography>
            <Typography variant="body2" color="text.secondary">
              Log and prioritize maintenance requests; track status from open to resolved.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default PropertyApp;
