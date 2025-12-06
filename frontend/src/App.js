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
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
  Menu,
  MenuItem,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  PersonAdd as PersonAddIcon,
  Close as CloseIcon,
  CloudUpload as CloudIcon,
  Image as MediaIcon,
  CalendarMonth as DentalIcon,
  Info as InfoIcon,
  Description as DocIcon,
  Support as SupportIcon,
  ArrowDropDown as ArrowDropDownIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from '@mui/icons-material';

// Import page components
import DentalApp from './pages/DentalApp';
import MediaPlayerApp from './pages/MediaPlayerApp';
import CloudStorageApp from './pages/CloudStorageApp';
import AboutUs from './pages/AboutUs';
import Documentation from './pages/Documentation';
import Support from './pages/Support';

const API_URL = process.env.REACT_APP_AUTH_API_URL || 'http://localhost:5010/api';

function AppContent() {
  const navigate = useNavigate();

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
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [appsMenuAnchor, setAppsMenuAnchor] = useState(null);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ username: '', email: '', password: '' });

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
        body: JSON.stringify(loginForm),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        setIsLoggedIn(true);
        setLoginDialogOpen(false);
        showSnackbar('Login successful!', 'success');
        setLoginForm({ email: '', password: '' });
      } else {
        showSnackbar(data.message || 'Login failed', 'error');
      }
    } catch (error) {
      showSnackbar('Error connecting to server', 'error');
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm),
      });
      const data = await response.json();
      if (response.ok) {
        setRegisterDialogOpen(false);
        setLoginDialogOpen(true);
        showSnackbar('Registration successful! Please login.', 'success');
        setRegisterForm({ username: '', email: '', password: '' });
      } else {
        showSnackbar(data.message || 'Registration failed', 'error');
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
    setAppsMenuAnchor(null);
  };

  const applications = [
    {
      id: 'dental',
      title: 'Dental Appointments',
      description: 'Manage patients, appointments, and scan medical records',
      icon: <DentalIcon sx={{ fontSize: 60, color: theme.palette.primary.main }} />,
      color: '#1976d2',
      path: '/dental',
      features: ['Patient Records', 'Appointments', 'Document Scanning', 'Treatment Plans']
    },
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
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="sticky" elevation={2}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => setDrawerOpen(true)} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 0, fontWeight: 700, cursor: 'pointer', mr: 4 }} onClick={() => navigate('/')}>
            Qhitz
          </Typography>

          {/* Header Navigation */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 2 }}>
            <Button color="inherit" onClick={() => navigate('/')}>Home</Button>
            <Button color="inherit" onClick={() => navigate('/about')}>About</Button>
            
            {/* Applications Dropdown */}
            <Button 
              color="inherit" 
              endIcon={<ArrowDropDownIcon />}
              onClick={(e) => setAppsMenuAnchor(e.currentTarget)}
            >
              Applications
            </Button>
            <Menu
              anchorEl={appsMenuAnchor}
              open={Boolean(appsMenuAnchor)}
              onClose={() => setAppsMenuAnchor(null)}
            >
              <MenuItem onClick={() => handleAppNavigation('/dental')}>
                <ListItemIcon><DentalIcon fontSize="small" /></ListItemIcon>
                Dental
              </MenuItem>
              <MenuItem onClick={() => handleAppNavigation('/media')}>
                <ListItemIcon><MediaIcon fontSize="small" /></ListItemIcon>
                Media Player
              </MenuItem>
              <MenuItem onClick={() => handleAppNavigation('/cloud')}>
                <ListItemIcon><CloudIcon fontSize="small" /></ListItemIcon>
                Cloud Storage
              </MenuItem>
            </Menu>

            <Button color="inherit" onClick={() => navigate('/documentation')}>Documentation</Button>
            <Button color="inherit" onClick={() => navigate('/support')}>Support</Button>
          </Box>

          {/* Theme Toggle */}
          <IconButton color="inherit" onClick={toggleTheme} sx={{ mr: 1 }} title={`Switch to ${themeMode === 'light' ? 'dark' : 'light'} mode`}>
            {themeMode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>

          {/* User Section */}
          {isLoggedIn ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip
                avatar={<Avatar>{user?.username?.charAt(0).toUpperCase()}</Avatar>}
                label={user?.username}
                color="primary"
                variant="outlined"
                sx={{ color: 'white', borderColor: 'white' }}
              />
              <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout}>Logout</Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button color="inherit" startIcon={<LoginIcon />} onClick={() => setLoginDialogOpen(true)}>Login</Button>
              <Button color="inherit" startIcon={<PersonAddIcon />} onClick={() => setRegisterDialogOpen(true)} variant="outlined" sx={{ borderColor: 'white' }}>Sign Up</Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 250, pt: 2 }}>
          <Box sx={{ px: 2, pb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Qhitz System</Typography>
          </Box>
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
            <ListItemButton onClick={() => { handleAppNavigation('/dental'); setDrawerOpen(false); }}>
              <ListItemIcon><DentalIcon /></ListItemIcon>
              <ListItemText primary="Dental" />
            </ListItemButton>
            <ListItemButton onClick={() => { handleAppNavigation('/media'); setDrawerOpen(false); }}>
              <ListItemIcon><MediaIcon /></ListItemIcon>
              <ListItemText primary="Media Player" />
            </ListItemButton>
            <ListItemButton onClick={() => { handleAppNavigation('/cloud'); setDrawerOpen(false); }}>
              <ListItemIcon><CloudIcon /></ListItemIcon>
              <ListItemText primary="Cloud Storage" />
            </ListItemButton>
            <Divider sx={{ my: 1 }} />
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
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1 }}>
        <Routes>
          {/* Home Page */}
          <Route path="/" element={
            <Container sx={{ py: 4 }}>
              {!isLoggedIn ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h2" gutterBottom sx={{ fontWeight: 700 }}>Welcome to Qhitz</Typography>
                  <Typography variant="h5" color="text.secondary" paragraph>Complete Business Management System</Typography>
                  <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
                    Manage your dental practice, multimedia files, and cloud storage all in one place.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button variant="contained" size="large" startIcon={<LoginIcon />} onClick={() => setLoginDialogOpen(true)}>Login</Button>
                    <Button variant="outlined" size="large" startIcon={<PersonAddIcon />} onClick={() => setRegisterDialogOpen(true)}>Sign Up</Button>
                  </Box>
                </Box>
              ) : (
                <Box>
                  <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>Your Applications</Typography>
                  <Grid container spacing={3}>
                    {applications.map((app) => (
                      <Grid item xs={12} md={4} key={app.id}>
                        <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }}>
                          <CardContent sx={{ flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>{app.icon}</Box>
                            <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', fontWeight: 600 }}>{app.title}</Typography>
                            <Typography variant="body2" color="text.secondary" paragraph sx={{ textAlign: 'center' }}>{app.description}</Typography>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>Features:</Typography>
                            <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                              {app.features.map((feature, idx) => (
                                <Typography component="li" variant="body2" key={idx} sx={{ mb: 0.5 }}>{feature}</Typography>
                              ))}
                            </Box>
                          </CardContent>
                          <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                            <Button variant="contained" size="large" sx={{ backgroundColor: app.color }} onClick={() => navigate(app.path)}>Open Application</Button>
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </Container>
          } />
          
          {/* Application Pages */}
          <Route path="/dental" element={isLoggedIn ? <DentalApp /> : <Box sx={{ textAlign: 'center', py: 8 }}><Typography variant="h5">Please login to access this application</Typography><Button variant="contained" sx={{ mt: 2 }} onClick={() => setLoginDialogOpen(true)}>Login</Button></Box>} />
          <Route path="/media" element={isLoggedIn ? <MediaPlayerApp /> : <Box sx={{ textAlign: 'center', py: 8 }}><Typography variant="h5">Please login to access this application</Typography><Button variant="contained" sx={{ mt: 2 }} onClick={() => setLoginDialogOpen(true)}>Login</Button></Box>} />
          <Route path="/cloud" element={isLoggedIn ? <CloudStorageApp /> : <Box sx={{ textAlign: 'center', py: 8 }}><Typography variant="h5">Please login to access this application</Typography><Button variant="contained" sx={{ mt: 2 }} onClick={() => setLoginDialogOpen(true)}>Login</Button></Box>} />
          
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
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>Qhitz Inc.</Typography>
              <Typography variant="body2" color="text.secondary">
                Complete business management system with dental appointments, multimedia server, and cloud storage.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>Quick Links</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }} onClick={() => navigate('/')}>Home</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }} onClick={() => navigate('/about')}>About Us</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }} onClick={() => navigate('/documentation')}>Documentation</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }} onClick={() => navigate('/support')}>Support</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>Contact</Typography>
              <Typography variant="body2" color="text.secondary">Email: info@qhitz.com</Typography>
              <Typography variant="body2" color="text.secondary">Phone: (555) 123-4567</Typography>
              <Typography variant="body2" color="text.secondary">Address: 123 Business St, City, State 12345</Typography>
            </Grid>
          </Grid>
          <Divider sx={{ my: 3 }} />
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Qhitz Inc. All rights reserved.
          </Typography>
        </Container>
      </Box>

      {/* Login Dialog */}
      <Dialog open={loginDialogOpen} onClose={() => setLoginDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle><Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><Typography variant="h5" sx={{ fontWeight: 700 }}>Login</Typography><IconButton onClick={() => setLoginDialogOpen(false)}><CloseIcon /></IconButton></Box></DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Email" type="email" margin="normal" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} />
          <TextField fullWidth label="Password" type="password" margin="normal" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} onKeyPress={(e) => e.key === 'Enter' && handleLogin()} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setLoginDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleLogin} disabled={loading}>{loading ? <CircularProgress size={20} /> : 'Login'}</Button>
        </DialogActions>
      </Dialog>

      {/* Register Dialog */}
      <Dialog open={registerDialogOpen} onClose={() => setRegisterDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle><Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><Typography variant="h5" sx={{ fontWeight: 700 }}>Sign Up</Typography><IconButton onClick={() => setRegisterDialogOpen(false)}><CloseIcon /></IconButton></Box></DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Username" margin="normal" value={registerForm.username} onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })} />
          <TextField fullWidth label="Email" type="email" margin="normal" value={registerForm.email} onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} />
          <TextField fullWidth label="Password" type="password" margin="normal" value={registerForm.password} onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} onKeyPress={(e) => e.key === 'Enter' && handleRegister()} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setRegisterDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleRegister} disabled={loading}>{loading ? <CircularProgress size={20} /> : 'Register'}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
      </Box>
    </ThemeProvider>
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
