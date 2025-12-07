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
  Stack,
  Chip,
  useTheme,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  LocalShipping as SupplierIcon,
  Inventory2 as InventoryIcon,
  ShoppingCart as PurchaseIcon,
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
    totalSuppliers: 0,
    activeSuppliers: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    pendingOrders: 0,
    totalOrders: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URLS.SUPPLY}/dashboard`);
      if (!response.ok) throw new Error('Failed to load dashboard data');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError('Unable to connect to Supply Chain API. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Suppliers',
      value: stats.totalSuppliers,
      subtitle: `${stats.activeSuppliers} active`,
      icon: <SupplierIcon sx={{ fontSize: 40 }} />,
      color: '#7c4dff',
      bgColor: isDark ? 'rgba(124,77,255,0.15)' : 'rgba(124,77,255,0.1)',
      action: () => navigate('/supply-chain/suppliers'),
    },
    {
      title: 'Products in Stock',
      value: stats.totalProducts,
      subtitle: `${stats.lowStockProducts} low stock`,
      icon: <InventoryIcon sx={{ fontSize: 40 }} />,
      color: '#00acc1',
      bgColor: isDark ? 'rgba(0,172,193,0.15)' : 'rgba(0,172,193,0.1)',
      action: () => navigate('/supply-chain/products'),
    },
    {
      title: 'Purchase Orders',
      value: stats.totalOrders,
      subtitle: `${stats.pendingOrders} pending`,
      icon: <PurchaseIcon sx={{ fontSize: 40 }} />,
      color: '#fb8c00',
      bgColor: isDark ? 'rgba(251,140,0,0.15)' : 'rgba(251,140,0,0.1)',
      action: () => navigate('/supply-chain/purchase-orders'),
    },
  ];

  const quickActions = [
    { label: 'Add Supplier', path: '/supply-chain/suppliers/add', color: '#7c4dff' },
    { label: 'Add Product', path: '/supply-chain/products/add', color: '#00acc1' },
    { label: 'Create Purchase Order', path: '/supply-chain/purchase-orders/add', color: '#fb8c00' },
    { label: 'View All Suppliers', path: '/supply-chain/suppliers', color: '#512da8' },
    { label: 'View All Products', path: '/supply-chain/products', color: '#0097a7' },
    { label: 'View All Orders', path: '/supply-chain/purchase-orders', color: '#f57c00' },
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
          ? 'radial-gradient(circle at 10% 20%, rgba(124,77,255,0.08), transparent 25%), radial-gradient(circle at 90% 10%, rgba(0,172,193,0.1), transparent 25%), linear-gradient(180deg, #0b1021 0%, #0f1a30 40%, #0e172b 100%)'
          : 'linear-gradient(180deg, #f5f7fa 0%, #e8ecf1 50%, #dce3eb 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Chip
            label="Supply Chain Management"
            sx={{
              mb: 2,
              backgroundColor: isDark ? 'rgba(124,77,255,0.2)' : 'rgba(124,77,255,0.15)',
              color: isDark ? '#b39dff' : '#7c4dff',
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
            Manage suppliers, inventory, and purchase orders from one central workspace.
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
                  background: isDark
                    ? 'rgba(255,255,255,0.05)'
                    : 'white',
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
                        backgroundColor: isDark
                          ? `${action.color}20`
                          : `${action.color}15`,
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
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckIcon sx={{ color: '#4caf50' }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    Supply Chain API Connected
                  </Typography>
                  <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }}>
                    All systems operational
                  </Typography>
                </Box>
              </Box>
              {stats.lowStockProducts > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <WarningIcon sx={{ color: '#fb8c00' }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {stats.lowStockProducts} Product(s) Low on Stock
                    </Typography>
                    <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }}>
                      Review inventory levels
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => navigate('/supply-chain/products')}
                  >
                    View
                  </Button>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Dashboard;
