import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Alert,
  CircularProgress,
  useTheme,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as BackIcon,
  Visibility as ViewIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { API_URLS } from '../../config/apiConfig';

const Properties = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === 'dark';

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentProperty, setCurrentProperty] = useState(null);
  const [form, setForm] = useState({
    name: '',
    address: '',
    city: '',
    province: '',
    country: 'USA',
    postal_code: '',
    units_total: '',
    manager_name: '',
    manager_phone: '',
    manager_email: '',
  });

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URLS.PROPERTY}/properties`);
      if (!response.ok) throw new Error('Failed to load properties');
      const data = await response.json();
      setProperties(data);
    } catch (err) {
      setError('Unable to load properties. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (property = null) => {
    if (property) {
      setCurrentProperty(property);
      setForm({
        name: property.name || '',
        address: property.address || '',
        city: property.city || '',
        province: property.province || '',
        country: property.country || 'USA',
        postal_code: property.postal_code || '',
        units_total: property.units_total || '',
        manager_name: property.manager_name || '',
        manager_phone: property.manager_phone || '',
        manager_email: property.manager_email || '',
      });
    } else {
      setCurrentProperty(null);
      setForm({
        name: '',
        address: '',
        city: '',
        province: '',
        country: 'USA',
        postal_code: '',
        units_total: '',
        manager_name: '',
        manager_phone: '',
        manager_email: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCurrentProperty(null);
  };

  const handleSave = async () => {
    if (!form.name || !form.address) {
      setError('Property name and address are required');
      return;
    }

    try {
      const url = currentProperty
        ? `${API_URLS.PROPERTY}/properties/${currentProperty.id}`
        : `${API_URLS.PROPERTY}/properties`;
      const method = currentProperty ? 'PUT' : 'POST';

      const payload = {
        ...form,
        units_total: form.units_total ? parseInt(form.units_total, 10) : 0,
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to save property');

      await loadProperties();
      handleCloseDialog();
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (!currentProperty) return;

    try {
      const response = await fetch(`${API_URLS.PROPERTY}/properties/${currentProperty.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete property');

      await loadProperties();
      setDeleteDialogOpen(false);
      setCurrentProperty(null);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

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
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate('/property')}
            sx={{
              mb: 2,
              color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
            }}
          >
            Back to Dashboard
          </Button>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  mb: 1,
                  color: isDark ? 'white' : theme.palette.text.primary,
                }}
              >
                Properties
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}
              >
                Manage your property portfolio
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{
                backgroundColor: '#1976d2',
                '&:hover': { backgroundColor: '#1565c0' },
              }}
            >
              Add Property
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Properties Table */}
        <Card
          elevation={isDark ? 0 : 2}
          sx={{
            background: isDark ? 'rgba(255,255,255,0.05)' : 'white',
            border: isDark ? '1px solid rgba(255,255,255,0.1)' : 'none',
          }}
        >
          <CardContent>
            <TableContainer component={Paper} sx={{ background: 'transparent', boxShadow: 'none' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Property Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Address</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>City</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Province</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Units</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Manager</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {properties.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }}>
                          No properties found. Click "Add Property" to create one.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    properties.map((property) => (
                      <TableRow key={property.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <BusinessIcon sx={{ color: '#1976d2', fontSize: 20 }} />
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {property.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <LocationIcon sx={{ fontSize: 16, color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }} />
                            {property.address}
                          </Box>
                        </TableCell>
                        <TableCell>{property.city || '-'}</TableCell>
                        <TableCell>{property.province || '-'}</TableCell>
                        <TableCell align="right">
                          <Chip label={property.units_total || 0} size="small" color="primary" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {property.manager_name || '-'}
                          </Typography>
                          {property.manager_phone && (
                            <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                              {property.manager_phone}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/property/${property.id}`)}
                            sx={{ color: '#2e7d32' }}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(property)}
                            sx={{ color: '#1976d2' }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setCurrentProperty(property);
                              setDeleteDialogOpen(true);
                            }}
                            sx={{ color: '#d32f2f' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Container>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{currentProperty ? 'Edit Property' : 'Add New Property'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                label="Property Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="City"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Province/State"
                value={form.province}
                onChange={(e) => setForm({ ...form, province: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Country"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Postal Code"
                value={form.postal_code}
                onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Total Units"
                type="number"
                value={form.units_total}
                onChange={(e) => setForm({ ...form, units_total: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Manager Name"
                value={form.manager_name}
                onChange={(e) => setForm({ ...form, manager_name: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Manager Phone"
                value={form.manager_phone}
                onChange={(e) => setForm({ ...form, manager_phone: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Manager Email"
                type="email"
                value={form.manager_email}
                onChange={(e) => setForm({ ...form, manager_email: e.target.value })}
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {currentProperty ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete property "{currentProperty?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Properties;
