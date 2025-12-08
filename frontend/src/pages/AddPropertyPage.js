import React, { useState, useEffect, useCallback } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
  Chip,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  HomeWork as HomeWorkIcon,
  Close as CloseIcon,
  MyLocation as MyLocationIcon,
  Map as MapIcon
} from '@mui/icons-material';
import { API_URLS } from '../config/apiConfig';

const AddPropertyPage = () => {
  const [form, setForm] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    units: '',
    manager: '',
    phone: '',
    email: '',
    latitude: '',
    longitude: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  const handleGeocode = useCallback(async (isAuto = false) => {
    const { address, city, state } = form;
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
      const response = await fetch(`${API_URLS.PROPERTY}/geocode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          city,
          province: state,
          country: 'USA',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Geocoding failed');
      }

      const data = await response.json();
      setForm((prev) => ({
        ...prev,
        latitude: data.latitude.toString(),
        longitude: data.longitude.toString(),
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

  // Auto-geocode when address changes
  useEffect(() => {
    if (!form.address || !form.city) return;

    const timeoutId = setTimeout(() => {
      handleGeocode(true);
    }, 1500); // Wait 1.5 seconds after user stops typing

    return () => clearTimeout(timeoutId);
  }, [form.address, form.city, form.state, handleGeocode]);

  const handleSubmit = async () => {
    setError('');
    if (!form.name || !form.address || !form.city) {
      setError('Name, address, and city are required.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        address: form.address,
        city: form.city,
        province: form.state,
        country: 'USA',
        units_total: form.units ? parseInt(form.units, 10) : 0,
        manager_name: form.manager,
        manager_phone: form.phone,
        manager_email: form.email,
        postal_code: form.zip,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
      };
      const res = await fetch(`${API_URLS.PROPERTY}/properties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Unable to save property.');
      }
      setSubmitted(true);
      setForm({
        name: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        units: '',
        manager: '',
        phone: '',
        email: '',
        latitude: '',
        longitude: '',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setTimeout(() => setSubmitted(false), 2000);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0c182e 0%, #0f233f 40%, #0b1324 100%)',
        py: { xs: 6, md: 10 },
      }}
    >
      <Container maxWidth="md">
        <Card elevation={6} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ background: 'linear-gradient(135deg, #1565c0, #00acc1)', color: 'white', p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <HomeWorkIcon />
              <Box>
                <Chip label="Property" size="small" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.5)', backgroundColor: 'transparent', mb: 0.5 }} />
                <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
                  Add a Property
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                  Capture key details before assigning units and tenants.
                </Typography>
              </Box>
            </Stack>
            <IconButton size="small" onClick={() => window.history.back()} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={2}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Property name"
                    fullWidth
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Address"
                    fullWidth
                    required
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="City"
                    fullWidth
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    label="State/Province"
                    fullWidth
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    label="ZIP/Postal"
                    fullWidth
                    value={form.zip}
                    onChange={(e) => setForm({ ...form, zip: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Unit count"
                    type="number"
                    fullWidth
                    value={form.units}
                    onChange={(e) => setForm({ ...form, units: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Property manager"
                    fullWidth
                    value={form.manager}
                    onChange={(e) => setForm({ ...form, manager: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Manager phone"
                    fullWidth
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Manager email"
                    fullWidth
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
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
                    fullWidth
                    placeholder="e.g., 43.6532"
                    value={form.latitude}
                    onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                    helperText="Optional: used for map preview"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Longitude"
                    type="number"
                    fullWidth
                    placeholder="-79.3832"
                    value={form.longitude}
                    onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                    helperText="Optional: used for map preview"
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

              {error && <Alert severity="error">{error}</Alert>}
              {submitted && (
                <Alert severity="success">
                  Property saved to Property API.
                </Alert>
              )}

              <Divider />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="flex-end">
                <Button variant="outlined" href="/property">
                  Back to Property
                </Button>
                <Button variant="contained" onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Saving...' : 'Save property'}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default AddPropertyPage;
