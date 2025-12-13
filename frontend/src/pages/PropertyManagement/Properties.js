import React, { useState, useEffect, useCallback } from 'react';
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
  MyLocation as MyLocationIcon,
  Map as MapIcon,
} from '@mui/icons-material';
import { API_URLS } from '../../config/apiConfig';
import { apiGet, apiPost, apiPut, apiDelete, apiRequest } from '../../utils/api';

const Properties = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === 'dark';

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [currentProperty, setCurrentProperty] = useState(null);
  const [geocoding, setGeocoding] = useState(false);
  const [autoGeocodeEnabled, setAutoGeocodeEnabled] = useState(true);
  const [form, setForm] = useState({
    name: '',
    address: '',
    address_unit: '',
    address_street: '',
    barangay: '',
    city: '',
    province: '',
    country: 'Philippines',
    postal_code: '',
    units_total: '',
    manager_name: '',
    manager_phone: '',
    manager_email: '',
    latitude: '',
    longitude: '',
  });

  const handleGeocode = useCallback(async (isAuto = false) => {
    const { address, city, province, country } = form;
    if (!address) {
      if (!isAuto) {
        setError('Please enter an address first');
      }
      return;
    }

    setGeocoding(true);
    if (!isAuto) {
      setError('');
    }

    try {
      const result = await apiPost(`${API_URLS.PROPERTY}/geocode`, {
        address: address || [
          form.address_unit,
          form.address_street,
          form.barangay,
        ].filter(Boolean).join(', '),
        city,
        province,
        country,
      });

      setForm((prev) => ({
        ...prev,
        latitude: result.latitude.toString(),
        longitude: result.longitude.toString(),
      }));
      if (!isAuto) {
        setError('');
      }
    } catch (err) {
      // Only show error if manual geocoding
      if (!isAuto) {
        setError(err.message);
      }
    } finally {
      setGeocoding(false);
    }
  }, [form]);

  useEffect(() => {
    loadProperties();
  }, []);

  // Auto-geocode when address changes
  useEffect(() => {
    if (!autoGeocodeEnabled || !form.address || !form.city) return;

    const timeoutId = setTimeout(() => {
      handleGeocode(true);
    }, 1500); // Wait 1.5 seconds after user stops typing

    return () => clearTimeout(timeoutId);
  }, [autoGeocodeEnabled, form.address, form.city, form.province, form.country, handleGeocode]);

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
      setAutoGeocodeEnabled(false); // Disable auto-geocode when editing existing property
      // Derive name parts from full_name if separate fields are missing
      const fullName = (property.full_name || '').trim();
      let first = property.first_name || '';
      let middle = property.middle_name || '';
      let last = property.last_name || '';
      if (fullName && (!first || !last)) {
        const tokens = fullName.split(/\s+/);
        if (tokens.length === 1) {
          first = tokens[0];
        } else if (tokens.length === 2) {
          first = tokens[0];
          last = tokens[1];
        } else {
          first = tokens[0];
          last = tokens[tokens.length - 1];
          middle = tokens.slice(1, -1).join(' ');
        }
      }
      // No reliable way to split monolithic address; keep provided split fields if any
      setForm({
        name: property.name || '',
        address: property.address || '',
        full_name: fullName || '',
        first_name: first,
        middle_name: middle,
        last_name: last,
        address_unit: property.address_unit || '',
        address_street: property.address_street || '',
        barangay: property.barangay || '',
        city: property.city || '',
        province: property.province || '',
        country: property.country || 'Philippines',
        postal_code: property.postal_code || '',
        units_total: property.units_total || '',
        manager_name: property.manager_name || '',
        manager_phone: property.manager_phone || '',
        manager_email: property.manager_email || '',
        latitude: property.latitude || '',
        longitude: property.longitude || '',
      });
    } else {
      setCurrentProperty(null);
      setAutoGeocodeEnabled(true); // Enable auto-geocode for new properties
      setForm({
        name: '',
        address: '',
        address_unit: '',
        address_street: '',
        barangay: '',
        city: '',
        province: '',
        country: 'Philippines',
        postal_code: '',
        units_total: '',
        manager_name: '',
        manager_phone: '',
        manager_email: '',
        latitude: '',
        longitude: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCurrentProperty(null);
  };

  const handleSave = async () => {
    // Compose address from split parts if address not provided
    const composedAddress = (form.address && form.address.trim())
      ? form.address.trim()
      : [form.address_unit, form.address_street, form.barangay, form.city, form.province, form.postal_code]
          .filter(Boolean)
          .join(', ');

    if (!form.name || !composedAddress) {
      setError('Property name and address are required');
      return;
    }

    try {
      const url = currentProperty
        ? `${API_URLS.PROPERTY}/properties/${currentProperty.id}`
        : `${API_URLS.PROPERTY}/properties`;
      const method = currentProperty ? 'PUT' : 'POST';

      // Compose full_name from first/middle/last if not explicitly provided
      const composedFullName = `${(form.first_name || '').trim()}${form.middle_name ? ' ' + form.middle_name.trim() : ''}${form.last_name ? ' ' + form.last_name.trim() : ''}`.trim();

      const payload = {
        ...form,
        address: composedAddress,
        full_name: (form.full_name || composedFullName) || undefined,
        first_name: form.first_name || undefined,
        middle_name: form.middle_name || undefined,
        last_name: form.last_name || undefined,
        address_unit: form.address_unit || undefined,
        address_street: form.address_street || undefined,
        barangay: form.barangay || undefined,
        units_total: form.units_total ? parseInt(form.units_total, 10) : 0,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
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

  const handleRowClick = (property) => {
    setCurrentProperty(property);
    setDetailOpen(true);
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

        <Grid container spacing={3}>
          {/* Properties Table */}
          <Grid item xs={12} lg={7}>
            <Card
              elevation={isDark ? 0 : 2}
              sx={{
                background: isDark ? 'rgba(255,255,255,0.05)' : 'white',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : 'none',
                height: '600px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 0 }}>
                <TableContainer
                  component={Paper}
                  sx={{
                    background: 'transparent',
                    boxShadow: 'none',
                    flex: 1,
                    overflow: 'auto',
                  }}
                >
                  <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        background: isDark ? 'rgba(255,255,255,0.05)' : 'white',
                        borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : undefined,
                      }}
                    >
                      Property Name
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        background: isDark ? 'rgba(255,255,255,0.05)' : 'white',
                        borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : undefined,
                      }}
                    >
                      Address
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        background: isDark ? 'rgba(255,255,255,0.05)' : 'white',
                        borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : undefined,
                      }}
                    >
                      City
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        background: isDark ? 'rgba(255,255,255,0.05)' : 'white',
                        borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : undefined,
                      }}
                      align="right"
                    >
                      Units
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        background: isDark ? 'rgba(255,255,255,0.05)' : 'white',
                        borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : undefined,
                      }}
                      align="right"
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {properties.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }}>
                          No properties found. Click "Add Property" to create one.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    properties.map((property) => (
                      <TableRow
                        key={property.id}
                        hover
                        onClick={() => handleRowClick(property)}
                        sx={{
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                          },
                          transition: 'background-color 0.2s',
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <BusinessIcon sx={{ color: '#1976d2', fontSize: 20 }} />
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {property.name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                                {property.manager_name || 'No manager'}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <LocationIcon sx={{ fontSize: 16, color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }} />
                            <Box>
                              <Typography variant="body2">{property.address}</Typography>
                              {property.city && (
                                <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                                  {property.city}{property.province ? `, ${property.province}` : ''}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {property.latitude && property.longitude ? (
                            <Chip
                              icon={<LocationIcon />}
                              label="On Map"
                              size="small"
                              color="success"
                              variant="outlined"
                            />
                          ) : (
                            <Chip
                              label="No coords"
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Chip label={property.units_total || 0} size="small" color="primary" />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/property/${property.id}`);
                            }}
                            sx={{ color: '#2e7d32' }}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDialog(property);
                            }}
                            sx={{ color: '#1976d2' }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
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
      </Grid>

          {/* Map View */}
          <Grid item xs={12} lg={5}>
            <Card
              elevation={isDark ? 0 : 2}
              sx={{
                background: isDark ? 'rgba(255,255,255,0.05)' : 'white',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : 'none',
                height: '600px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Property Locations
                </Typography>
                {(() => {
                  const propertiesWithCoords = properties.filter(p => p.latitude && p.longitude);

                  if (propertiesWithCoords.length === 0) {
                    return (
                      <Box
                        sx={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                          borderRadius: 2,
                          p: 3,
                        }}
                      >
                        <Box sx={{ textAlign: 'center' }}>
                          <LocationIcon sx={{ fontSize: 48, color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', mb: 2 }} />
                          <Typography variant="body1" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }}>
                            No properties with location data yet
                          </Typography>
                          <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)', mt: 1 }}>
                            Add coordinates to properties to see them on the map
                          </Typography>
                        </Box>
                      </Box>
                    );
                  }

                  // Calculate center point (average of all coordinates)
                  const avgLat = propertiesWithCoords.reduce((sum, p) => sum + Number(p.latitude), 0) / propertiesWithCoords.length;
                  const avgLng = propertiesWithCoords.reduce((sum, p) => sum + Number(p.longitude), 0) / propertiesWithCoords.length;

                  // Build marker list for URL
                  const markers = propertiesWithCoords
                    .map((p, idx) => `marker=${p.latitude},${p.longitude}`)
                    .join('&');

                  const mapUrl = `https://www.openstreetmap.org/export/embed.html?layer=mapnik&${markers}&bbox=${avgLng - 0.1},${avgLat - 0.1},${avgLng + 0.1},${avgLat + 0.1}`;

                  return (
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Box
                        sx={{
                          flex: 1,
                          border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                          borderRadius: 2,
                          overflow: 'hidden',
                          mb: 2,
                        }}
                      >
                        <iframe
                          title="Properties Map"
                          src={mapUrl}
                          style={{ width: '100%', height: '100%', border: 0 }}
                          loading="lazy"
                        />
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', mb: 1 }}>
                          Showing {propertiesWithCoords.length} {propertiesWithCoords.length === 1 ? 'property' : 'properties'} on map
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<MapIcon />}
                            href={`https://www.google.com/maps/search/?api=1&query=${avgLat},${avgLng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ flex: 1, minWidth: '110px' }}
                          >
                            Google Maps
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<MapIcon />}
                            href={`https://www.openstreetmap.org/?mlat=${avgLat}&mlon=${avgLng}#map=12/${avgLat}/${avgLng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ flex: 1, minWidth: '110px' }}
                          >
                            OpenStreetMap
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  );
                })()}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
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
            {/* Full Name split into First, Middle, Last */}
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="First Name"
                    value={form.first_name || ''}
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Middle Name (optional)"
                    value={form.middle_name || ''}
                    onChange={(e) => setForm({ ...form, middle_name: e.target.value })}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Last Name / Surname"
                    value={form.last_name || ''}
                    onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                    required
                    fullWidth
                  />
                </Grid>
              </Grid>
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
            {/* Address Details Grid (Split) */}
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Unit/Building"
                    value={form.address_unit}
                    onChange={(e) => setForm({ ...form, address_unit: e.target.value })}
                    fullWidth
                    helperText="e.g., Unit 5A, Building Name"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Street"
                    value={form.address_street}
                    onChange={(e) => setForm({ ...form, address_street: e.target.value })}
                    fullWidth
                    helperText="e.g., Katipunan Ave"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Barangay"
                    value={form.barangay}
                    onChange={(e) => setForm({ ...form, barangay: e.target.value })}
                    fullWidth
                    helperText="e.g., Barangay Loyola Heights"
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="City/Municipality"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Province"
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
                disabled
                helperText="Fixed to Philippines"
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
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Location Coordinates
                  {geocoding && (
                    <Typography component="span" variant="caption" sx={{ ml: 1, color: 'primary.main' }}>
                      (auto-detecting...)
                    </Typography>
                  )}
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={geocoding ? <CircularProgress size={16} /> : <MyLocationIcon />}
                  onClick={() => handleGeocode(false)}
                  disabled={geocoding || !form.address}
                  sx={{ ml: 'auto' }}
                >
                  {geocoding ? 'Finding...' : 'Get Coordinates'}
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Latitude"
                type="number"
                placeholder="14.5995 (Manila)"
                value={form.latitude}
                onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Longitude"
                type="number"
                placeholder="120.9842 (Manila)"
                value={form.longitude}
                onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                fullWidth
              />
            </Grid>
            {form.latitude && form.longitude && (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    size="small"
                    variant="text"
                    startIcon={<MapIcon />}
                    href={`https://www.google.com/maps?q=${form.latitude},${form.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open in Google Maps
                  </Button>
                  <Button
                    size="small"
                    variant="text"
                    startIcon={<MapIcon />}
                    href={`https://maps.apple.com/?q=${form.latitude},${form.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open in Apple Maps
                  </Button>
                  <Button
                    size="small"
                    variant="text"
                    startIcon={<MapIcon />}
                    href={`https://www.openstreetmap.org/?mlat=${form.latitude}&mlon=${form.longitude}#map=16/${form.latitude}/${form.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open in OpenStreetMap
                  </Button>
                </Box>
              </Grid>
            )}
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

      {/* Property Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Property Details</Typography>
            {currentProperty?.latitude && currentProperty?.longitude && (
              <Chip
                icon={<LocationIcon />}
                label="On Map"
                size="small"
                color="success"
                variant="outlined"
              />
            )}
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {currentProperty && (
            <Box sx={{ py: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <BusinessIcon sx={{ color: '#1976d2', fontSize: 24 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>{currentProperty.name}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box component="hr" sx={{ border: 'none', borderTop: '1px solid', borderColor: 'divider', my: 1 }} />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Address</Typography>
                  <Typography variant="body1">{currentProperty.address}</Typography>
                  {currentProperty.city && (
                    <Typography variant="body2" color="text.secondary">
                      {currentProperty.city}{currentProperty.province ? `, ${currentProperty.province}` : ''} {currentProperty.postal_code || ''}
                    </Typography>
                  )}
                  {currentProperty.country && (
                    <Typography variant="body2" color="text.secondary">{currentProperty.country}</Typography>
                  )}
                </Grid>
                {currentProperty.units_total > 0 && (
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Total Units</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{currentProperty.units_total}</Typography>
                  </Grid>
                )}
                {(currentProperty.manager_name || currentProperty.manager_phone || currentProperty.manager_email) && (
                  <>
                    <Grid item xs={12}>
                      <Box component="hr" sx={{ border: 'none', borderTop: '1px solid', borderColor: 'divider', my: 1 }} />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">Property Manager</Typography>
                      {currentProperty.manager_name && (
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>{currentProperty.manager_name}</Typography>
                      )}
                      {currentProperty.manager_phone && (
                        <Typography variant="body2">{currentProperty.manager_phone}</Typography>
                      )}
                      {currentProperty.manager_email && (
                        <Typography variant="body2">{currentProperty.manager_email}</Typography>
                      )}
                    </Grid>
                  </>
                )}
                {currentProperty.latitude && currentProperty.longitude && (
                  <>
                    <Grid item xs={12}>
                      <Box component="hr" sx={{ border: 'none', borderTop: '1px solid', borderColor: 'divider', my: 1 }} />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">Location</Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Lat: {currentProperty.latitude}, Lng: {currentProperty.longitude}
                      </Typography>
                      <Box
                        component="iframe"
                        src={`https://www.google.com/maps?q=${currentProperty.latitude},${currentProperty.longitude}&output=embed`}
                        sx={{
                          width: '100%',
                          height: 300,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          mb: 1
                        }}
                        title="Property Location"
                      />
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<MapIcon />}
                          href={`https://www.google.com/maps?q=${currentProperty.latitude},${currentProperty.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Google Maps
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<MapIcon />}
                          href={`https://maps.apple.com/?q=${currentProperty.latitude},${currentProperty.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Apple Maps
                        </Button>
                      </Box>
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Close</Button>
          <Button
            variant="outlined"
            onClick={() => {
              setDetailOpen(false);
              navigate(`/property/${currentProperty?.id}`);
            }}
          >
            View Full Details
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setDetailOpen(false);
              handleOpenDialog(currentProperty);
            }}
          >
            Edit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Properties;
