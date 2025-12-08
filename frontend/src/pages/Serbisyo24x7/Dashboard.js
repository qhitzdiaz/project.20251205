import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import AssignmentIcon from '@mui/icons-material/AssignmentTurnedIn';
import AddIcon from '@mui/icons-material/Add';
import { API_URLS } from '../../config/apiConfig';

const SerbisyoDashboard = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();
  const [stats, setStats] = useState({ services: 0, jobs: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [svcRes, jobRes] = await Promise.all([
          fetch(`${API_URLS.SERBISYO}/services`),
          fetch(`${API_URLS.SERBISYO}/jobs`),
        ]);
        if (!svcRes.ok || !jobRes.ok) throw new Error('Failed');
        const services = await svcRes.json();
        const jobs = await jobRes.json();
        setStats({ services: services.length, jobs: jobs.length });
      } catch (err) {
        setError('Unable to load Serbisyo24x7 data. Ensure the API is running.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: isDark
          ? 'linear-gradient(180deg, #0b1021 0%, #0f1a30 40%, #0e172b 100%)'
          : 'linear-gradient(180deg, #f5f7fa 0%, #e8ecf1 50%, #dce3eb 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: isDark ? 'white' : theme.palette.text.primary }}>
            Serbisyo24x7
          </Typography>
          <Typography variant="body1" sx={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
            Manage services and job requests.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Card elevation={isDark ? 0 : 2} sx={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <BuildIcon color="primary" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>{stats.services}</Typography>
                    <Typography variant="body2" color="text.secondary">Services</Typography>
                  </Box>
                </Box>
                <Button sx={{ mt: 2 }} variant="outlined" onClick={() => navigate('/serbisyo/services')}>Manage Services</Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card elevation={isDark ? 0 : 2} sx={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <AssignmentIcon color="secondary" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>{stats.jobs}</Typography>
                    <Typography variant="body2" color="text.secondary">Job Requests</Typography>
                  </Box>
                </Box>
                <Button sx={{ mt: 2 }} variant="outlined" onClick={() => navigate('/serbisyo/jobs')}>Manage Requests</Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card elevation={isDark ? 0 : 1} sx={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'white' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Quick Actions</Typography>
            <Grid container spacing={2}>
              {[{ label: 'Add Service', path: '/serbisyo/services', icon: <AddIcon /> }, { label: 'New Job Request', path: '/serbisyo/jobs', icon: <AssignmentIcon /> }].map((action) => (
                <Grid item xs={12} sm={6} key={action.label}>
                  <Button fullWidth variant="contained" startIcon={action.icon} onClick={() => navigate(action.path)}>
                    {action.label}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default SerbisyoDashboard;
