import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

function StatCard({ label, value, helper }) {
  return (
    <Paper sx={{ p: 2, borderRadius: 2, height: '100%' }} elevation={0}>
      <Typography variant="subtitle2" color="text.secondary">{label}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 0.5 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          {value !== undefined && value !== null ? value : '—'}
        </Typography>
      </Box>
      {helper && (
        <Typography variant="caption" color="text.secondary">{helper}</Typography>
      )}
    </Paper>
  );
}

export default StatCard;
