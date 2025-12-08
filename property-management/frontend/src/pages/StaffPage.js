import React from 'react';
import { Box, Paper, Typography, Divider, Alert } from '@mui/material';

function StaffPage() {
  return (
    <Box>
      <Paper sx={{ p: 3, mb: 2, borderRadius: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          Staff
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Staffing rosters, roles, and schedules will live here as the module matures.
        </Typography>
      </Paper>

      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          Coming soon
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Alert severity="info">
          Employee records and assignments are on the roadmap. For now, staffing counts surface in
          the dashboard summary.
        </Alert>
      </Paper>
    </Box>
  );
}

export default StaffPage;
