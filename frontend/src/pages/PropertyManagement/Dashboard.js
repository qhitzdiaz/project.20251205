import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  useTheme,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Apartment as PropertyIcon,
  People as TenantsIcon,
  PeopleAlt as StaffIcon,
  Build as MaintenanceIcon,
  TrendingUp as TrendingIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { API_URLS } from '../../config/apiConfig';

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === 'dark';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalTenants: 0,
    activeLeases: 0,
    maintenanceRequests: 0,
    pendingMaintenance: 0,
    staff: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [propertiesRes, tenantsRes, leasesRes, maintenanceRes] = await Promise.all([
        fetch(`${API_URLS.PROPERTY}/properties`),
        fetch(`${API_URLS.PROPERTY}/tenants`),
        fetch(`${API_URLS.PROPERTY}/leases`),
        fetch(`${API_URLS.PROPERTY}/maintenance`),
      ]);

      if (!propertiesRes.ok || !tenantsRes.ok || !leasesRes.ok || !maintenanceRes.ok) {
        throw new Error('Failed to load dashboard data');
      }

      const properties = await propertiesRes.json();
      const tenants = await tenantsRes.json();
      const leases = await leasesRes.json();
      const maintenance = await maintenanceRes.json();
      const staffRes = await fetch(`${API_URLS.PROPERTY}/staff`);
      const staffData = staffRes.ok ? await staffRes.json() : [];

      setStats({
        totalProperties: properties.length,
        totalTenants: tenants.length,
        activeLeases: leases.filter(l => l.status === 'active').length,
        maintenanceRequests: maintenance.length,
        pendingMaintenance: maintenance.filter(m => m.status === 'pending' || m.status === 'in_progress').length,
        staff: staffData.length,
      });
    } catch (err) {
      setError('Unable to connect to Property Management API. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Properties',
      value: stats.totalProperties,
      subtitle: 'Managed properties',
      icon: <PropertyIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      bgColor: isDark ? 'rgba(25,118,210,0.15)' : 'rgba(25,118,210,0.1)',
      action: () => navigate('/property/properties'),
    },
    {
      title: 'Active Tenants',
      value: stats.totalTenants,
      subtitle: `${stats.activeLeases} active leases`,
      icon: <TenantsIcon sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
      bgColor: isDark ? 'rgba(46,125,50,0.15)' : 'rgba(46,125,50,0.1)',
      action: () => navigate('/property/tenants'),
    },
    {
      title: 'Maintenance',
      value: stats.maintenanceRequests,
      subtitle: `${stats.pendingMaintenance} pending`,
      icon: <MaintenanceIcon sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
      bgColor: isDark ? 'rgba(237,108,2,0.15)' : 'rgba(237,108,2,0.1)',
      action: () => navigate('/property/maintenance'),
    },
    {
      title: 'Staff',
      value: stats.staff,
      subtitle: 'Active team members',
      icon: <StaffIcon sx={{ fontSize: 40 }} />,
      color: '#6a1b9a',
      bgColor: isDark ? 'rgba(106,27,154,0.15)' : 'rgba(106,27,154,0.1)',
      action: () => navigate('/property/staff'),
    },
  ];

  const quickActions = [
    { label: 'Add Property', path: '/property/add', color: '#1976d2' },
    { label: 'Add Tenant', path: '/property/tenants', color: '#2e7d32' },
    { label: 'Create Lease', path: '/property/properties', color: '#9c27b0' },
    { label: 'Log Maintenance', path: '/property/maintenance', color: '#ed6c02' },
    { label: 'View All Properties', path: '/property/properties', color: '#0288d1' },
    { label: 'View All Tenants', path: '/property/tenants', color: '#388e3c' },
  ];

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
          ? 'radial-gradient(circle at 10% 20%, rgba(25,118,210,0.08), transparent 25%), radial-gradient(circle at 90% 10%, rgba(46,125,50,0.1), transparent 25%), linear-gradient(180deg, #0b1021 0%, #0f1a30 40%, #0e172b 100%)'
          : 'linear-gradient(180deg, #f5f7fa 0%, #e8ecf1 50%, #dce3eb 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Chip
            label="Property Management"
            sx={{
              mb: 2,
              backgroundColor: isDark ? 'rgba(25,118,210,0.2)' : 'rgba(25,118,210,0.15)',
              color: isDark ? '#90caf9' : '#1976d2',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          />
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              mb: 1,
              color: isDark ? 'white' : theme.palette.text.primary,
            }}
          >
            Dashboard
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}
          >
            Manage properties, tenants, leases, and maintenance requests.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statCards.map((stat, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                elevation={isDark ? 0 : 2}
                sx={{
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'white',
                  border: isDark ? '1px solid rgba(255,255,255,0.1)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.15)',
                  },
                }}
                onClick={stat.action}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: 2,
                        backgroundColor: stat.bgColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: stat.color,
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <TrendingIcon sx={{ color: stat.color, fontSize: 28 }} />
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5, color: stat.color }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {stat.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }}>
                    {stat.subtitle}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Quick Actions */}
        <Card
          elevation={isDark ? 0 : 1}
          sx={{
            background: isDark ? 'rgba(255,255,255,0.03)' : 'white',
            border: isDark ? '1px solid rgba(255,255,255,0.08)' : 'none',
            mb: 4,
          }}
        >
          <CardContent>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              {quickActions.map((action, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Button
                    fullWidth
                    variant="outlined"
                    sx={{
                      borderColor: isDark ? 'rgba(255,255,255,0.2)' : action.color,
                      color: isDark ? 'white' : action.color,
                      py: 1.5,
                      fontWeight: 600,
                      '&:hover': {
                        borderColor: action.color,
                        backgroundColor: isDark ? `${action.color}20` : `${action.color}15`,
                      },
                    }}
                    onClick={() => navigate(action.path)}
                  >
                    {action.label}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card
          elevation={isDark ? 0 : 1}
          sx={{
            background: isDark ? 'rgba(255,255,255,0.03)' : 'white',
            border: isDark ? '1px solid rgba(255,255,255,0.08)' : 'none',
          }}
        >
          <CardContent>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
              System Status
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <CheckIcon sx={{ color: '#4caf50' }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  Property Management API Connected
                </Typography>
                <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }}>
                  All systems operational
                </Typography>
              </Box>
            </Box>
            {stats.pendingMaintenance > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <WarningIcon sx={{ color: '#ed6c02' }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {stats.pendingMaintenance} Pending Maintenance Request(s)
                  </Typography>
                  <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }}>
                    Review and assign maintenance tasks
                  </Typography>
                </Box>
                <Button size="small" variant="outlined" onClick={() => navigate('/property/maintenance')}>
                  View
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Dashboard;
