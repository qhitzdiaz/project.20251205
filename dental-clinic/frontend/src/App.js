import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
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
  CalendarMonth as DentalIcon,
  Info as InfoIcon,
  Description as DocIcon,
  Support as SupportIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from '@mui/icons-material';

// Import page components
import WelcomePage from './pages/WelcomePage';
import DentalApp from './pages/DentalApp';
import NewPatientForm from './pages/NewPatientForm';
import AboutUs from './pages/AboutUs';
import Documentation from './pages/Documentation';
import Support from './pages/Support';
import { API_URL } from './config/apiConfig';

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

  const heroImage = themeMode === 'dark'
    ? '/images/qhitz-skyline-night.jpg'
    : '/images/qhitz-skyline-day.jpg';

  const pageBackground = themeMode === 'dark'
    ? `linear-gradient(180deg, rgba(0,0,0,0.85), rgba(0,0,0,0.75)), url(${heroImage})`
    : `url(${heroImage})`;

  return (
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
        {/* Mobile Drawer */}
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 250, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ pt: 2 }}>
            <Box sx={{ px: 2, pb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Compleat Smile</Typography>
              <Typography variant="caption" color="text.secondary">Dental Aesthetic</Typography>
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
              <ListItemButton onClick={() => { navigate('/dental'); setDrawerOpen(false); }}>
                <ListItemIcon><DentalIcon /></ListItemIcon>
                <ListItemText primary="Dental Portal" />
              </ListItemButton>
              <Divider sx={{ my: 1 }} />
              <ListItemButton onClick={() => { navigate('/about'); setDrawerOpen(false); }}>
                <ListItemIcon><InfoIcon /></ListItemIcon>
                <ListItemText primary="About" />
              </ListItemButton>
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

      {/* Floating Menu Button */}
      <IconButton
        onClick={() => setDrawerOpen(true)}
        sx={{
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 1200,
          backgroundColor: themeMode === 'dark' ? 'rgba(25, 118, 210, 0.9)' : 'rgba(25, 118, 210, 0.95)',
          color: 'white',
          boxShadow: '0 4px 20px rgba(25, 118, 210, 0.4)',
          '&:hover': {
            backgroundColor: themeMode === 'dark' ? 'rgba(25, 118, 210, 1)' : 'rgba(21, 101, 192, 1)',
            boxShadow: '0 6px 25px rgba(25, 118, 210, 0.5)',
          },
        }}
      >
        <MenuIcon />
      </IconButton>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1 }}>
        <Routes>
          {/* Home Page */}
          <Route path="/" element={<WelcomePage />} />

          {/* Application Pages */}
          <Route path="/dental" element={isLoggedIn ? <DentalApp /> : <Box sx={{ textAlign: 'center', py: 8 }}><Typography variant="h5">Please login to access this application</Typography><Button variant="contained" sx={{ mt: 2 }} onClick={() => setLoginDialogOpen(true)}>Login</Button></Box>} />
          
          {/* Info Pages */}
          <Route path="/new-patient" element={<NewPatientForm />} />
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
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>Compleat Smile Dental Aesthetic</Typography>
              <Typography variant="body2" color="text.secondary">
                Your Premier Destination for Complete Dental Care. Professional dental services with state-of-the-art technology.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>Quick Links</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }} onClick={() => navigate('/')}>Home</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }} onClick={() => navigate('/dental')}>Patient Portal</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }} onClick={() => navigate('/about')}>About Us</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }} onClick={() => navigate('/documentation')}>Documentation</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }} onClick={() => navigate('/support')}>Support</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>Contact</Typography>
              <Typography variant="body2" color="text.secondary">Email: info@compleatsmile.com</Typography>
              <Typography variant="body2" color="text.secondary">Phone: (555) 123-4567</Typography>
              <Typography variant="body2" color="text.secondary">Address: 123 Dental Street, Suite 100, Your City, ST 12345</Typography>
            </Grid>
          </Grid>
          <Divider sx={{ my: 3 }} />
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Compleat Smile Dental Aesthetic. All rights reserved.
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
