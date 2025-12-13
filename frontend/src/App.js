import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Button,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  CardActions,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Close as CloseIcon,
  CloudUpload as CloudIcon,
  Image as MediaIcon,
  ManageAccounts as UsersIcon,
  Apartment as PropertyIcon,
  Info as InfoIcon,
  Description as DocIcon,
  Support as SupportIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  LocalShipping as SupplyIcon,
  Build as ServicesIcon,
  PointOfSale as POSIcon,
} from '@mui/icons-material';

// Import page components
import MediaPlayerApp from './pages/MediaPlayerApp';
import CloudStorageApp from './pages/CloudStorageApp';
import AddPropertyPage from './pages/AddPropertyPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import TenantDetailPage from './pages/TenantDetailPage';
import MaintenanceDetailPage from './pages/MaintenanceDetailPage';
import AboutUs from './pages/AboutUs';
import Documentation from './pages/Documentation';
import Support from './pages/Support';
import { API_URL } from './config/apiConfig';

// Supply Chain pages
import SupplyChainDashboard from './pages/SupplyChain/Dashboard';
import SupplyChainSuppliers from './pages/SupplyChain/Suppliers';
import SupplyChainProducts from './pages/SupplyChain/Products';
import SupplyChainPurchaseOrders from './pages/SupplyChain/PurchaseOrders';
// Serbisyo24x7 pages
import SerbisyoDashboard from './pages/Serbisyo24x7/Dashboard';
import SerbisyoServices from './pages/Serbisyo24x7/Services';

// Point of Sales pages
import POSDashboard from './pages/PointOfSales/Dashboard';

// Property Management pages
import PropertyDashboard from './pages/PropertyManagement/Dashboard';
import PropertyProperties from './pages/PropertyManagement/Properties';
import PropertyTenants from './pages/PropertyManagement/Tenants';
import PropertyMaintenance from './pages/PropertyManagement/Maintenance';
import PropertyStaff from './pages/PropertyManagement/Staff';
import PropertyAdmin from './pages/PropertyManagement/Admin';
import PropertyInvoices from './pages/PropertyManagement/Invoices';
import PropertyPricing from './pages/PropertyManagement/Pricing';
import PropertyExpenses from './pages/PropertyManagement/Expenses';
import PropertyContracts from './pages/PropertyManagement/Contracts';
import UserManagement from './pages/UserManagement';

// Auth context
import { AuthProvider } from './context/AuthContext';

function AppContent() {
  const navigate = useNavigate();
  const safeAreaTop = 'env(safe-area-inset-top)';

  // Detect system color scheme preference
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  // Theme mode state - defaults to system preference
  const [themeMode, setThemeMode] = useState(() => {
    const savedMode = localStorage.getItem('themeMode');
    return savedMode || (prefersDarkMode ? 'dark' : 'light');
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const [loginForm, setLoginForm] = useState({ identifier: '', password: '' });

  // Create theme based on mode
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: themeMode,
          primary: {
            main: themeMode === 'dark' ? '#90caf9' : '#1976d2',
          },
          secondary: {
            main: themeMode === 'dark' ? '#f48fb1' : '#dc004e',
          },
          background: {
            default: themeMode === 'dark' ? '#121212' : '#f5f5f5',
            paper: themeMode === 'dark' ? '#1e1e1e' : '#ffffff',
          },
        },
        typography: {
          fontFamily: 'Roboto, Arial, sans-serif',
          h4: { fontWeight: 600 },
        },
        shape: { borderRadius: 12 },
      }),
    [themeMode]
  );

  // Toggle theme mode
  const toggleTheme = () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  // Update theme when system preference changes
  useEffect(() => {
    const savedMode = localStorage.getItem('themeMode');
    if (!savedMode) {
      setThemeMode(prefersDarkMode ? 'dark' : 'light');
    }
  }, [prefersDarkMode]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) verifyToken(token);
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await fetch(`${API_URL}/auth/verify`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsLoggedIn(true);
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      localStorage.removeItem('token');
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Send identifier as both email and username so either works server-side
        body: JSON.stringify({
          email: loginForm.identifier,
          username: loginForm.identifier,
          password: loginForm.password,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        setIsLoggedIn(true);
        setLoginDialogOpen(false);
        showSnackbar('Login successful!', 'success');
        setLoginForm({ identifier: '', password: '' });
      } else {
        showSnackbar(data.message || 'Login failed', 'error');
      }
    } catch (error) {
      showSnackbar('Error connecting to server', 'error');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsLoggedIn(false);
    navigate('/');
    showSnackbar('Logged out successfully', 'info');
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleAppNavigation = (path) => {
    if (!isLoggedIn) {
      setLoginDialogOpen(true);
      showSnackbar('Please login to access applications', 'warning');
    } else {
      navigate(path);
    }
  };

  const applications = [
    {
      id: 'mediaplayer',
      title: 'Media Player',
      description: 'Play videos and music directly in your browser',
      icon: <MediaIcon sx={{ fontSize: 60, color: theme.palette.secondary.main }} />,
      color: '#dc004e',
      path: '/media',
      features: ['Video Player', 'Music Player', 'Upload Media', 'Playlist Support']
    },
    {
      id: 'cloud',
      title: 'Cloud Storage',
      description: 'Store files in folders and share with secure links',
      icon: <CloudIcon sx={{ fontSize: 60, color: '#4caf50' }} />,
      color: '#4caf50',
      path: '/cloud',
      features: ['Folder Management', 'File Sharing', 'Storage Quotas', 'Secure Links']
    },
    {
      id: 'property',
      title: 'Property Management',
      description: 'Manage properties, tenants, leases, and maintenance',
      icon: <PropertyIcon sx={{ fontSize: 60, color: '#1976d2' }} />,
      color: '#1976d2',
      path: '/property',
      features: ['Properties', 'Tenants', 'Maintenance', 'Leases']
    },
    {
      id: 'supply',
      title: 'Supply Chain',
      description: 'Curated playbook for suppliers, purchasing, and inventory truth.',
      icon: <SupplyIcon sx={{ fontSize: 60, color: '#512da8' }} />,
      color: '#512da8',
      path: '/supply-chain',
      features: ['Add products fast', 'Supplier visibility', 'Execution playbooks', 'Exception routing']
    },
    {
      id: 'serbisyo',
      title: 'Serbisyo24x7',
      description: '24/7 service management for jobs, requests, and scheduling',
      icon: <ServicesIcon sx={{ fontSize: 60, color: '#ff6f00' }} />,
      color: '#ff6f00',
      path: '/serbisyo',
      features: ['Service Catalog', 'Job Requests', 'Scheduling', 'Status Tracking']
    },
    {
      id: 'pos',
      title: 'Point of Sales',
      description: 'Complete POS system for retail and service transactions',
      icon: <POSIcon sx={{ fontSize: 60, color: '#00796b' }} />,
      color: '#00796b',
      path: '/pos',
      features: ['Sales Transactions', 'Inventory Tracking', 'Receipt Printing', 'Payment Processing']
    },
  ];

  const heroImage = themeMode === 'dark'
    ? '/images/qhitz-skyline-night.jpg'
    : '/images/qhitz-skyline-day.jpg';

  const pageBackground = themeMode === 'dark'
    ? `linear-gradient(180deg, rgba(0,0,0,0.85), rgba(0,0,0,0.75)), url(${heroImage})`
    : `url(${heroImage})`;

  return (
    <AuthProvider user={user} isLoggedIn={isLoggedIn} onLogout={() => setIsLoggedIn(false)}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          backgroundImage: pageBackground,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            paddingTop: safeAreaTop,
            backdropFilter: 'blur(20px)',
            backgroundColor: themeMode === 'dark'
              ? 'rgba(18, 18, 18, 0.85)'
              : 'rgba(255, 255, 255, 0.85)',
            borderBottom: `1px solid ${themeMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            boxShadow: themeMode === 'dark'
              ? '0 4px 30px rgba(0, 0, 0, 0.3)'
              : '0 4px 30px rgba(0, 0, 0, 0.1)',
          }}
        >
        <Toolbar sx={{ minHeight: { xs: 64, sm: 70 } }}>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setDrawerOpen(true)}
            sx={{
              mr: 2,
              color: themeMode === 'dark' ? '#fff' : theme.palette.primary.main,
            }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              cursor: 'pointer',
              background: themeMode === 'dark'
                ? 'linear-gradient(45deg, #90caf9 30%, #64b5f6 90%)'
                : 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
            }}
            onClick={() => navigate('/')}
          >
            Qhitz Inc.,
          </Typography>

          {/* Theme Toggle */}
          <IconButton
            color="inherit"
            onClick={toggleTheme}
            sx={{
              color: themeMode === 'dark' ? '#ffd700' : theme.palette.primary.main,
              '&:hover': {
                backgroundColor: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(25, 118, 210, 0.1)',
              },
            }}
            title={`Switch to ${themeMode === 'light' ? 'dark' : 'light'} mode`}
          >
            {themeMode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>

          {/* Login/Logout Button */}
          {isLoggedIn ? (
            <Button
              color="inherit"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{
                color: themeMode === 'dark' ? '#fff' : theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(25, 118, 210, 0.1)',
                },
                ml: 1,
                display: { xs: 'none', md: 'flex' },
              }}
            >
              Logout
            </Button>
          ) : (
            <Button
              color="inherit"
              startIcon={<LoginIcon />}
              onClick={() => setLoginDialogOpen(true)}
              sx={{
                color: themeMode === 'dark' ? '#fff' : theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(25, 118, 210, 0.1)',
                },
                ml: 1,
                display: { xs: 'none', md: 'flex' },
              }}
            >
              Login
            </Button>
          )}

          {/* User Avatar (Desktop) */}
          {isLoggedIn && (
            <Box sx={{ ml: 2, display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: theme.palette.primary.main,
                  cursor: 'pointer',
                }}
              >
                {user?.username?.charAt(0).toUpperCase()}
              </Avatar>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Spacer for fixed AppBar */}
      <Toolbar sx={{ minHeight: { xs: 'calc(64px + env(safe-area-inset-top))', sm: 'calc(70px + env(safe-area-inset-top))' } }} />

      {/* Mobile Drawer */}
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 250, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ pt: 2 }}>
            <Box sx={{ px: 2, pb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Qhitz Inc.,</Typography>
            </Box>
            <Divider />

            {/* User Section */}
            {isLoggedIn ? (
              <Box sx={{ px: 2, py: 2, bgcolor: 'action.hover' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                    {user?.username?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user?.username}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                      {user?.email}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ) : (
              <Box sx={{ px: 2, py: 2 }}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<LoginIcon />}
                  onClick={() => { setLoginDialogOpen(true); setDrawerOpen(false); }}
                  sx={{ mb: 1 }}
                >
                  Login
                </Button>
              </Box>
            )}
            <Divider />

            <List>
              <ListItemButton onClick={() => { navigate('/'); setDrawerOpen(false); }}>
                <ListItemIcon><HomeIcon /></ListItemIcon>
                <ListItemText primary="Home" />
              </ListItemButton>
              <ListItemButton onClick={() => { navigate('/about'); setDrawerOpen(false); }}>
                <ListItemIcon><InfoIcon /></ListItemIcon>
                <ListItemText primary="About Us" />
              </ListItemButton>

              <Divider sx={{ my: 1 }} />
              <Typography variant="overline" sx={{ px: 2, py: 1, color: 'text.secondary', fontWeight: 600 }}>
                Applications
              </Typography>

              <ListItemButton onClick={() => { handleAppNavigation('/media'); setDrawerOpen(false); }}>
                <ListItemIcon><MediaIcon /></ListItemIcon>
                <ListItemText primary="Media Player" />
              </ListItemButton>
              <ListItemButton onClick={() => { handleAppNavigation('/cloud'); setDrawerOpen(false); }}>
                <ListItemIcon><CloudIcon /></ListItemIcon>
                <ListItemText primary="Cloud Storage" />
              </ListItemButton>
              <ListItemButton onClick={() => { handleAppNavigation('/property'); setDrawerOpen(false); }}>
                <ListItemIcon><PropertyIcon /></ListItemIcon>
                <ListItemText primary="Property Management" />
              </ListItemButton>
              {isLoggedIn && (
                <ListItemButton onClick={() => { navigate('/users'); setDrawerOpen(false); }}>
                  <ListItemIcon><UsersIcon /></ListItemIcon>
                  <ListItemText primary="User Management" />
                </ListItemButton>
              )}
              <ListItemButton onClick={() => { navigate('/supply-chain'); setDrawerOpen(false); }}>
                <ListItemIcon><SupplyIcon /></ListItemIcon>
                <ListItemText primary="Supply Chain" />
              </ListItemButton>
              <ListItemButton onClick={() => { navigate('/serbisyo'); setDrawerOpen(false); }}>
                <ListItemIcon><ServicesIcon /></ListItemIcon>
                <ListItemText primary="Serbisyo24x7" />
              </ListItemButton>

              <Divider sx={{ my: 1 }} />
              <Typography variant="overline" sx={{ px: 2, py: 1, color: 'text.secondary', fontWeight: 600 }}>
                Resources
              </Typography>

              <ListItemButton onClick={() => { navigate('/documentation'); setDrawerOpen(false); }}>
                <ListItemIcon><DocIcon /></ListItemIcon>
                <ListItemText primary="Documentation" />
              </ListItemButton>
              <ListItemButton onClick={() => { navigate('/support'); setDrawerOpen(false); }}>
                <ListItemIcon><SupportIcon /></ListItemIcon>
                <ListItemText primary="Support" />
              </ListItemButton>
            </List>
          </Box>

          {/* Logout at Bottom */}
          {isLoggedIn && (
            <>
              <Box sx={{ flexGrow: 1 }} />
              <Divider />
              <Box sx={{ p: 2 }}>
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  startIcon={<LogoutIcon />}
                  onClick={() => { handleLogout(); setDrawerOpen(false); }}
                >
                  Logout
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1 }}>
        <Routes>
          {/* Home Page */}
          <Route path="/" element={
            <Box
              sx={{
                position: 'relative',
                minHeight: '70vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                backgroundImage: themeMode === 'dark'
                  ? `linear-gradient(180deg, rgba(0,0,0,0.55), rgba(0,0,0,0.7)), url(${heroImage})`
                  : `url(${heroImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              <Container sx={{ py: 8 }}>
                {!isLoggedIn ? (
                  <Box sx={{ textAlign: 'center', color: 'white' }}>
                  <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>Login to continue</Typography>
                  <Typography variant="body1" color="rgba(255,255,255,0.85)" paragraph sx={{ maxWidth: 640, mx: 'auto', mb: 4 }}>
                    Access your applications with your existing account.
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Button variant="contained" size="large" startIcon={<LoginIcon />} onClick={() => setLoginDialogOpen(true)}>Login</Button>
                  </Box>
                </Box>
              ) : (
                  <Box>
                    <Typography variant="h4" gutterBottom sx={{ mb: 4, color: 'white' }}>Your Applications</Typography>
                    <Grid container spacing={3}>
                      {applications.map((app) => (
                        <Grid item xs={12} md={4} key={app.id}>
                          {app.isPlaceholder ? (
                            <Card
                              elevation={0}
                              sx={{
                                height: '100%',
                                minHeight: 420,
                                backgroundColor: 'transparent',
                                border: `1px dashed ${theme.palette.divider}`,
                                boxShadow: 'none',
                              }}
                            >
                              <CardContent sx={{ flexGrow: 1 }} />
                            </Card>
                          ) : (
                            <Card
                              elevation={4}
                              sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': { transform: 'translateY(-4px)', boxShadow: 8 },
                              }}
                            >
                              <CardContent sx={{ flexGrow: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                                  {app.id === 'supply' ? (
                                    <Box
                                      sx={{
                                        width: 84,
                                        height: 84,
                                        borderRadius: '50%',
                                        display: 'grid',
                                        placeItems: 'center',
                                        background: 'radial-gradient(circle at 30% 30%, #7c4dff, #311b92)',
                                        boxShadow: '0 10px 30px rgba(81,45,168,0.35)',
                                      }}
                                    >
                                      {app.icon}
                                    </Box>
                                  ) : (
                                    app.icon
                                  )}
                                </Box>
                                <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', fontWeight: 700 }}>
                                  {app.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" paragraph sx={{ textAlign: 'center' }}>
                                  {app.description}
                                </Typography>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 700 }}>Features:</Typography>
                                <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                                  {app.features.map((feature, idx) => (
                                    <Typography component="li" variant="body2" key={idx} sx={{ mb: 0.5 }}>
                                      {feature}
                                    </Typography>
                                  ))}
                                </Box>
                              </CardContent>
                              <CardActions sx={{ justifyContent: 'center', pb: 2, gap: 1 }}>
                                {app.id === 'supply' ? (
                                  <Button
                                    variant="contained"
                                    size="medium"
                                    sx={{ backgroundColor: app.color }}
                                    onClick={() => navigate(app.path)}
                                  >
                                    Open application
                                  </Button>
                                ) : (
                                  <Button variant="contained" size="large" sx={{ backgroundColor: app.color }} onClick={() => navigate(app.path)}>
                                    Open Application
                                  </Button>
                                )}
                              </CardActions>
                            </Card>
                          )}
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </Container>
            </Box>
          } />
          
          {/* Application Pages */}
          <Route path="/media" element={isLoggedIn ? <MediaPlayerApp /> : <Box sx={{ textAlign: 'center', py: 8 }}><Typography variant="h5">Please login to access this application</Typography><Button variant="contained" sx={{ mt: 2 }} onClick={() => setLoginDialogOpen(true)}>Login</Button></Box>} />
          <Route path="/cloud" element={isLoggedIn ? <CloudStorageApp /> : <Box sx={{ textAlign: 'center', py: 8 }}><Typography variant="h5">Please login to access this application</Typography><Button variant="contained" sx={{ mt: 2 }} onClick={() => setLoginDialogOpen(true)}>Login</Button></Box>} />

          {/* Property Management Pages */}
          <Route path="/property" element={isLoggedIn ? <PropertyDashboard /> : <Box sx={{ textAlign: 'center', py: 8 }}><Typography variant="h5">Please login to access this application</Typography><Button variant="contained" sx={{ mt: 2 }} onClick={() => setLoginDialogOpen(true)}>Login</Button></Box>} />
          <Route path="/property/properties" element={isLoggedIn ? <PropertyProperties /> : <Box sx={{ textAlign: 'center', py: 8 }}><Typography variant="h5">Please login to access this application</Typography><Button variant="contained" sx={{ mt: 2 }} onClick={() => setLoginDialogOpen(true)}>Login</Button></Box>} />
          <Route path="/property/tenants" element={isLoggedIn ? <PropertyTenants /> : <Box sx={{ textAlign: 'center', py: 8 }}><Typography variant="h5">Please login to access this application</Typography><Button variant="contained" sx={{ mt: 2 }} onClick={() => setLoginDialogOpen(true)}>Login</Button></Box>} />
          <Route path="/property/maintenance" element={isLoggedIn ? <PropertyMaintenance /> : <Box sx={{ textAlign: 'center', py: 8 }}><Typography variant="h5">Please login to access this application</Typography><Button variant="contained" sx={{ mt: 2 }} onClick={() => setLoginDialogOpen(true)}>Login</Button></Box>} />
          <Route path="/property/admin" element={isLoggedIn ? <PropertyAdmin /> : <Box sx={{ textAlign: 'center', py: 8 }}><Typography variant="h5">Please login to access this application</Typography><Button variant="contained" sx={{ mt: 2 }} onClick={() => setLoginDialogOpen(true)}>Login</Button></Box>} />
          <Route path="/property/invoices" element={isLoggedIn ? <PropertyInvoices /> : <Box sx={{ textAlign: 'center', py: 8 }}><Typography variant="h5">Please login to access this application</Typography><Button variant="contained" sx={{ mt: 2 }} onClick={() => setLoginDialogOpen(true)}>Login</Button></Box>} />
          <Route path="/property/pricing" element={isLoggedIn ? <PropertyPricing /> : <Box sx={{ textAlign: 'center', py: 8 }}><Typography variant="h5">Please login to access this application</Typography><Button variant="contained" sx={{ mt: 2 }} onClick={() => setLoginDialogOpen(true)}>Login</Button></Box>} />
          <Route path="/property/expenses" element={isLoggedIn ? <PropertyExpenses /> : <Box sx={{ textAlign: 'center', py: 8 }}><Typography variant="h5">Please login to access this application</Typography><Button variant="contained" sx={{ mt: 2 }} onClick={() => setLoginDialogOpen(true)}>Login</Button></Box>} />
          <Route path="/property/contracts" element={isLoggedIn ? <PropertyContracts /> : <Box sx={{ textAlign: 'center', py: 8 }}><Typography variant="h5">Please login to access this application</Typography><Button variant="contained" sx={{ mt: 2 }} onClick={() => setLoginDialogOpen(true)}>Login</Button></Box>} />
          <Route path="/property/staff" element={isLoggedIn ? <PropertyStaff /> : <Box sx={{ textAlign: 'center', py: 8 }}><Typography variant="h5">Please login to access this application</Typography><Button variant="contained" sx={{ mt: 2 }} onClick={() => setLoginDialogOpen(true)}>Login</Button></Box>} />
          <Route path="/property/add" element={isLoggedIn ? <AddPropertyPage /> : <Box sx={{ textAlign: 'center', py: 8 }}><Typography variant="h5">Please login to access this application</Typography><Button variant="contained" sx={{ mt: 2 }} onClick={() => setLoginDialogOpen(true)}>Login</Button></Box>} />
          <Route path="/property/:id" element={isLoggedIn ? <PropertyDetailPage /> : <Box sx={{ textAlign: 'center', py: 8 }}><Typography variant="h5">Please login to access this application</Typography><Button variant="contained" sx={{ mt: 2 }} onClick={() => setLoginDialogOpen(true)}>Login</Button></Box>} />
          <Route path="/tenants/:id" element={isLoggedIn ? <TenantDetailPage /> : <Box sx={{ textAlign: 'center', py: 8 }}><Typography variant="h5">Please login to access this application</Typography><Button variant="contained" sx={{ mt: 2 }} onClick={() => setLoginDialogOpen(true)}>Login</Button></Box>} />
          <Route path="/maintenance/:id" element={isLoggedIn ? <MaintenanceDetailPage /> : <Box sx={{ textAlign: 'center', py: 8 }}><Typography variant="h5">Please login to access this application</Typography><Button variant="contained" sx={{ mt: 2 }} onClick={() => setLoginDialogOpen(true)}>Login</Button></Box>} />
          <Route path="/users" element={isLoggedIn ? <UserManagement /> : <Box sx={{ textAlign: 'center', py: 8 }}><Typography variant="h5">Please login to access this application</Typography><Button variant="contained" sx={{ mt: 2 }} onClick={() => setLoginDialogOpen(true)}>Login</Button></Box>} />

          {/* Serbisyo24x7 Pages */}
          <Route path="/serbisyo" element={isLoggedIn ? <SerbisyoDashboard /> : <Box sx={{ textAlign: 'center', py: 8 }}><Typography variant="h5">Please login to access this application</Typography><Button variant="contained" sx={{ mt: 2 }} onClick={() => setLoginDialogOpen(true)}>Login</Button></Box>} />
          <Route path="/serbisyo/services" element={isLoggedIn ? <SerbisyoServices /> : <Box sx={{ textAlign: 'center', py: 8 }}><Typography variant="h5">Please login to access this application</Typography><Button variant="contained" sx={{ mt: 2 }} onClick={() => setLoginDialogOpen(true)}>Login</Button></Box>} />

          {/* Supply Chain Pages */}
          <Route path="/supply-chain" element={isLoggedIn ? <SupplyChainDashboard /> : <Box sx={{ textAlign: 'center', py: 8 }}><Typography variant="h5">Please login to access this application</Typography><Button variant="contained" sx={{ mt: 2 }} onClick={() => setLoginDialogOpen(true)}>Login</Button></Box>} />
          <Route path="/supply-chain/suppliers" element={isLoggedIn ? <SupplyChainSuppliers /> : <Box sx={{ textAlign: 'center', py: 8 }}><Typography variant="h5">Please login to access this application</Typography><Button variant="contained" sx={{ mt: 2 }} onClick={() => setLoginDialogOpen(true)}>Login</Button></Box>} />
          <Route path="/supply-chain/suppliers/add" element={isLoggedIn ? <SupplyChainSuppliers /> : <Box sx={{ textAlign: 'center', py: 8 }}><Typography variant="h5">Please login to access this application</Typography><Button variant="contained" sx={{ mt: 2 }} onClick={() => setLoginDialogOpen(true)}>Login</Button></Box>} />
          <Route path="/supply-chain/products" element={isLoggedIn ? <SupplyChainProducts /> : <Box sx={{ textAlign: 'center', py: 8 }}><Typography variant="h5">Please login to access this application</Typography><Button variant="contained" sx={{ mt: 2 }} onClick={() => setLoginDialogOpen(true)}>Login</Button></Box>} />
          <Route path="/supply-chain/products/add" element={isLoggedIn ? <SupplyChainProducts /> : <Box sx={{ textAlign: 'center', py: 8 }}><Typography variant="h5">Please login to access this application</Typography><Button variant="contained" sx={{ mt: 2 }} onClick={() => setLoginDialogOpen(true)}>Login</Button></Box>} />
          <Route path="/supply-chain/purchase-orders" element={isLoggedIn ? <SupplyChainPurchaseOrders /> : <Box sx={{ textAlign: 'center', py: 8 }}><Typography variant="h5">Please login to access this application</Typography><Button variant="contained" sx={{ mt: 2 }} onClick={() => setLoginDialogOpen(true)}>Login</Button></Box>} />
          <Route path="/supply-chain/purchase-orders/add" element={isLoggedIn ? <SupplyChainPurchaseOrders /> : <Box sx={{ textAlign: 'center', py: 8 }}><Typography variant="h5">Please login to access this application</Typography><Button variant="contained" sx={{ mt: 2 }} onClick={() => setLoginDialogOpen(true)}>Login</Button></Box>} />

          {/* Point of Sales Pages */}
          <Route path="/pos" element={isLoggedIn ? <POSDashboard /> : <Box sx={{ textAlign: 'center', py: 8 }}><Typography variant="h5">Please login to access this application</Typography><Button variant="contained" sx={{ mt: 2 }} onClick={() => setLoginDialogOpen(true)}>Login</Button></Box>} />

          {/* Info Pages */}
          <Route path="/about" element={<AboutUs />} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="/support" element={<Support />} />
        </Routes>
      </Box>

      {/* Footer */}
      <Box component="footer" sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : theme.palette.grey[200],
        borderTop: `1px solid ${theme.palette.divider}`
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>Qhitz Inc.,</Typography>
              <Typography variant="body2" color="text.secondary">
                Complete business management system with multimedia, cloud storage, property, and a dedicated supply chain.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>Quick Links</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }} onClick={() => navigate('/')}>Home</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }} onClick={() => navigate('/about')}>About Us</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }} onClick={() => navigate('/supply-chain')}>Supply Chain</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }} onClick={() => navigate('/property')}>Property Management</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }} onClick={() => navigate('/serbisyo')}>Serbisyo24x7</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }} onClick={() => navigate('/documentation')}>Documentation</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }} onClick={() => navigate('/support')}>Support</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>Contact</Typography>
              <Typography variant="body2" color="text.secondary">Email: info@qhitz.com</Typography>
              <Typography variant="body2" color="text.secondary">Phone: 0927-172-3002</Typography>
              <Typography variant="body2" color="text.secondary">Address: Quezon City, Metro Manila, Philippines</Typography>
            </Grid>
          </Grid>
          <Divider sx={{ my: 3 }} />
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Qhitz Inc., All rights reserved.
          </Typography>
        </Container>
      </Box>

      {/* Login Dialog */}
      <Dialog open={loginDialogOpen} onClose={() => setLoginDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle><Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><Typography variant="h5" sx={{ fontWeight: 700 }}>Login</Typography><IconButton onClick={() => setLoginDialogOpen(false)}><CloseIcon /></IconButton></Box></DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Username or Email" helperText="Use either your username or email to sign in" margin="normal" value={loginForm.identifier} onChange={(e) => setLoginForm({ ...loginForm, identifier: e.target.value })} />
          <TextField fullWidth label="Password" type="password" margin="normal" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} onKeyPress={(e) => e.key === 'Enter' && handleLogin()} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setLoginDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleLogin} disabled={loading}>{loading ? <CircularProgress size={20} /> : 'Login'}</Button>
        </DialogActions>
      </Dialog>

        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>
        </Box>
      </ThemeProvider>
    </AuthProvider>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
