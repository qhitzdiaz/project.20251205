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
} from '@mui/material';
import {
  PointOfSale as POSIcon,
  Inventory as InventoryIcon,
  Receipt as ReceiptIcon,
  TrendingUp as SalesIcon,
  AttachMoney as MoneyIcon,
  Category as CategoryIcon,
  People as CustomersIcon,
} from '@mui/icons-material';

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === 'dark';

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSales: 0,
    todaySales: 0,
    transactions: 0,
    products: 0,
    lowStock: 0,
    customers: 0,
    revenue: 0,
    avgTransaction: 0,
  });

  useEffect(() => {
    // Simulate loading dashboard data
    setTimeout(() => {
      setStats({
        totalSales: 0,
        todaySales: 0,
        transactions: 0,
        products: 0,
        lowStock: 0,
        customers: 0,
        revenue: 0,
        avgTransaction: 0,
      });
      setLoading(false);
    }, 500);
  }, []);

  const statCards = [
    {
      title: 'Today\'s Sales',
      value: `₱${stats.todaySales.toLocaleString('en-PH')}`,
      subtitle: `${stats.transactions} transactions`,
      icon: <SalesIcon sx={{ fontSize: 40 }} />,
      color: '#00796b',
      bgColor: isDark ? 'rgba(0,121,107,0.15)' : 'rgba(0,121,107,0.1)',
      action: () => navigate('/pos/sales'),
    },
    {
      title: 'Total Revenue',
      value: `₱${stats.revenue.toLocaleString('en-PH')}`,
      subtitle: 'All-time sales',
      icon: <MoneyIcon sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
      bgColor: isDark ? 'rgba(46,125,50,0.15)' : 'rgba(46,125,50,0.1)',
      action: () => navigate('/pos/reports'),
    },
    {
      title: 'Products',
      value: stats.products,
      subtitle: `${stats.lowStock} low stock`,
      icon: <InventoryIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      bgColor: isDark ? 'rgba(25,118,210,0.15)' : 'rgba(25,118,210,0.1)',
      action: () => navigate('/pos/inventory'),
    },
    {
      title: 'Transactions',
      value: stats.transactions,
      subtitle: `Avg ₱${stats.avgTransaction.toFixed(2)}`,
      icon: <ReceiptIcon sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
      bgColor: isDark ? 'rgba(237,108,2,0.15)' : 'rgba(237,108,2,0.1)',
      action: () => navigate('/pos/transactions'),
    },
    {
      title: 'Categories',
      value: '0',
      subtitle: 'Product categories',
      icon: <CategoryIcon sx={{ fontSize: 40 }} />,
      color: '#9c27b0',
      bgColor: isDark ? 'rgba(156,39,176,0.15)' : 'rgba(156,39,176,0.1)',
      action: () => navigate('/pos/categories'),
    },
    {
      title: 'Customers',
      value: stats.customers,
      subtitle: 'Registered customers',
      icon: <CustomersIcon sx={{ fontSize: 40 }} />,
      color: '#d32f2f',
      bgColor: isDark ? 'rgba(211,47,47,0.15)' : 'rgba(211,47,47,0.1)',
      action: () => navigate('/pos/customers'),
    },
  ];

  const quickActions = [
    { label: 'New Sale', path: '/pos/new-sale', color: '#00796b' },
    { label: 'Add Product', path: '/pos/inventory', color: '#1976d2' },
    { label: 'View Transactions', path: '/pos/transactions', color: '#ed6c02' },
    { label: 'Inventory', path: '/pos/inventory', color: '#2e7d32' },
    { label: 'Reports', path: '/pos/reports', color: '#9c27b0' },
    { label: 'Settings', path: '/pos/settings', color: '#546e7a' },
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
          ? 'radial-gradient(circle at 10% 20%, rgba(0,121,107,0.08), transparent 25%), radial-gradient(circle at 90% 10%, rgba(46,125,50,0.1), transparent 25%), linear-gradient(180deg, #0b1021 0%, #0f1a30 40%, #0e172b 100%)'
          : 'linear-gradient(180deg, #f5f7fa 0%, #e8ecf1 50%, #dce3eb 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Chip
            label="Point of Sales"
            sx={{
              mb: 2,
              backgroundColor: isDark ? 'rgba(0,121,107,0.2)' : 'rgba(0,121,107,0.15)',
              color: isDark ? '#4db6ac' : '#00796b',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          />
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              mb: 1,
              background: isDark
                ? 'linear-gradient(135deg, #4db6ac 0%, #00796b 100%)'
                : 'linear-gradient(135deg, #00796b 0%, #004d40 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            POS Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Manage sales, inventory, and transactions
          </Typography>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  background: isDark
                    ? 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)'
                    : '#ffffff',
                  backdropFilter: 'blur(10px)',
                  border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: isDark
                      ? '0 8px 24px rgba(0,0,0,0.4)'
                      : '0 8px 24px rgba(0,0,0,0.15)',
                  },
                }}
                onClick={stat.action}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
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
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, color: stat.color }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {stat.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stat.subtitle}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Quick Actions */}
        <Card
          sx={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)'
              : '#ffffff',
            backdropFilter: 'blur(10px)',
            border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
            mb: 4,
          }}
        >
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              {quickActions.map((action, index) => (
                <Grid item xs={6} sm={4} md={2} key={index}>
                  <Button
                    fullWidth
                    variant="contained"
                    sx={{
                      backgroundColor: action.color,
                      '&:hover': { backgroundColor: action.color, opacity: 0.9 },
                      py: 1.5,
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

        {/* Getting Started */}
        <Card
          sx={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(0,121,107,0.15) 0%, rgba(0,121,107,0.05) 100%)'
              : 'linear-gradient(135deg, rgba(0,121,107,0.1) 0%, rgba(0,121,107,0.05) 100%)',
            border: isDark ? '1px solid rgba(0,121,107,0.3)' : '1px solid rgba(0,121,107,0.2)',
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <POSIcon sx={{ fontSize: 32, color: '#00796b', mr: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Getting Started with POS
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" paragraph>
              Welcome to the Point of Sales system. Start by setting up your inventory, then process transactions and track sales.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                sx={{ backgroundColor: '#00796b' }}
                onClick={() => navigate('/pos/new-sale')}
              >
                Start New Sale
              </Button>
              <Button
                variant="outlined"
                sx={{ borderColor: '#00796b', color: '#00796b' }}
                onClick={() => navigate('/pos/inventory')}
              >
                Manage Inventory
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Dashboard;
