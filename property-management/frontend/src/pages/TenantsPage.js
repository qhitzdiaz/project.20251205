import React from 'react';
import { Box, Paper, Typography, Divider, Alert } from '@mui/material';

function TenantsPage() {
  return (
    <Box>
      <Paper sx={{ p: 3, mb: 2, borderRadius: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          Tenants
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage tenant records, leases, and notices. The full experience is in progress.
        </Typography>
      </Paper>

      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          Coming soon
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Alert severity="info">
          Tenant profiles and lease details will surface here. For now, monitor lease health from the
          Dashboard cards.
        </Alert>
      </Paper>
    </Box>
  );
}

export default TenantsPage;
