import React from 'react';
import { Box, Paper, Typography, Divider, Alert } from '@mui/material';

function PropertiesPage() {
  return (
    <Box>
      <Paper sx={{ p: 3, mb: 2, borderRadius: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          Properties
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track property inventory, units, and assignments. This section will expand with CRUD
          workflows and reporting.
        </Typography>
      </Paper>

      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          Coming soon
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Alert severity="info">
          Property profiles, units, and map details will appear here. Use the Dashboard for a quick
          overview while this page is being built out.
        </Alert>
      </Paper>
    </Box>
  );
}

export default PropertiesPage;
