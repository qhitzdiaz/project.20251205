import React from 'react';
import { Box, Paper, Typography, Divider, Alert } from '@mui/material';

function MaintenancePage() {
  return (
    <Box>
      <Paper sx={{ p: 3, mb: 2, borderRadius: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          Maintenance
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Work orders, assignments, and SLA tracking will be managed here.
        </Typography>
      </Paper>

      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          Coming soon
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Alert severity="info">
          Maintenance tickets, priorities, and due dates will be editable once this page is wired to
          the API. Use the dashboard maintenance widget for a quick status check today.
        </Alert>
      </Paper>
    </Box>
  );
}

export default MaintenancePage;
