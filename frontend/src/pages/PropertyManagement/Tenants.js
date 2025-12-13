import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Card, CardContent, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, CircularProgress, useTheme, Grid } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, ArrowBack as BackIcon, Person as PersonIcon, Email as EmailIcon, Phone as PhoneIcon } from '@mui/icons-material';
import { API_URLS } from '../../config/apiConfig';
import { apiGet, apiPost, apiPut, apiDelete } from '../../utils/api';

const Tenants = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === 'dark';
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [currentTenant, setCurrentTenant] = useState(null);
  const [form, setForm] = useState({
    full_name: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    username: '',
    email: '',
    phone: '',
    notes: '',
    address: '',
    address_unit: '',
    address_street: '',
    barangay: '',
    city: '',
    province: '',
    country: 'Philippines',
    postal_code: '',
  });

  useEffect(() => { loadTenants(); }, []);

  const loadTenants = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiGet(`${API_URLS.PROPERTY}/tenants`);
      setTenants(data);
    } catch (err) {
      setError('Unable to load tenants. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (tenant = null) => {
    if (tenant) {
      setCurrentTenant(tenant);
      // Derive name parts from full_name if separate fields are missing
      const fullName = (tenant.full_name || '').trim();
      let first = tenant.first_name || '';
      let middle = tenant.middle_name || '';
      let last = tenant.last_name || '';
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
      setForm({
        full_name: fullName,
        first_name: first,
        middle_name: middle,
        last_name: last,
        username: tenant.username || '',
        email: tenant.email || '',
        phone: tenant.phone || '',
        notes: tenant.notes || '',
        address: tenant.address || '',
        address_unit: tenant.address_unit || '',
        address_street: tenant.address_street || '',
        barangay: tenant.barangay || '',
        city: tenant.city || '',
        province: tenant.province || '',
        country: tenant.country || 'Philippines',
        postal_code: tenant.postal_code || '',
      });
    } else {
      setCurrentTenant(null);
      setForm({
        full_name: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        username: '',
        email: '',
        phone: '',
        notes: '',
        address: '',
        address_unit: '',
        address_street: '',
        barangay: '',
        city: '',
        province: '',
        country: 'Philippines',
        postal_code: '',
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    // Compose full name from parts if not explicitly provided
    const composedFullName = `${(form.first_name || '').trim()}${form.middle_name ? ' ' + form.middle_name.trim() : ''}${form.last_name ? ' ' + form.last_name.trim() : ''}`.trim();
    const fullName = (form.full_name || composedFullName).trim();
    // Compose address from split parts if address not provided
    const composedAddress = (form.address && form.address.trim())
      ? form.address.trim()
      : [form.address_unit, form.address_street, form.barangay, form.city, form.province, form.postal_code]
          .filter(Boolean)
          .join(', ');
    if (!fullName) { setError('Tenant name is required'); return; }
    try {
      const url = currentTenant ? `${API_URLS.PROPERTY}/tenants/${currentTenant.id}` : `${API_URLS.PROPERTY}/tenants`;
      const payload = {
        ...form,
        full_name: fullName,
        first_name: form.first_name || undefined,
        middle_name: form.middle_name || undefined,
        last_name: form.last_name || undefined,
        username: form.username || undefined,
        address: composedAddress,
        address_unit: form.address_unit || undefined,
        address_street: form.address_street || undefined,
        barangay: form.barangay || undefined,
        city: form.city || undefined,
        province: form.province || undefined,
        country: form.country || 'Philippines',
        postal_code: form.postal_code || undefined,
      };
      const response = await fetch(url, { method: currentTenant ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error('Failed to save tenant');
      await loadTenants();
      setDialogOpen(false);
      setCurrentTenant(null);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (!currentTenant) return;
    try {
      const response = await fetch(`${API_URLS.PROPERTY}/tenants/${currentTenant.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete tenant');
      await loadTenants();
      setDeleteDialogOpen(false);
      setCurrentTenant(null);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRowClick = (tenant) => {
    setCurrentTenant(tenant);
    setDetailOpen(true);
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><CircularProgress size={60} /></Box>;

  return (
    <Box sx={{ minHeight: '100vh', background: isDark ? 'radial-gradient(circle at 10% 20%, rgba(25,118,210,0.08), transparent 25%), radial-gradient(circle at 90% 10%, rgba(46,125,50,0.1), transparent 25%), linear-gradient(180deg, #0b1021 0%, #0f1a30 40%, #0e172b 100%)' : 'linear-gradient(180deg, #f5f7fa 0%, #e8ecf1 50%, #dce3eb 100%)', py: 4 }}>
      <Container maxWidth="xl">
        <Box sx={{ mb: 4 }}>
          <Button startIcon={<BackIcon />} onClick={() => navigate('/property')} sx={{ mb: 2, color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>Back to Dashboard</Button>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: isDark ? 'white' : theme.palette.text.primary }}>Tenants</Typography>
              <Typography variant="body1" sx={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>Manage tenant information</Typography>
            </Box>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} sx={{ backgroundColor: '#2e7d32', '&:hover': { backgroundColor: '#1b5e20' } }}>Add Tenant</Button>
          </Box>
        </Box>
        {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
        <Card elevation={isDark ? 0 : 2} sx={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'white', border: isDark ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
          <CardContent>
            <TableContainer component={Paper} sx={{ background: 'transparent', boxShadow: 'none' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Phone</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Notes</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tenants.length === 0 ? (
                    <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4 }}><Typography variant="body1" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }}>No tenants found. Click "Add Tenant" to create one.</Typography></TableCell></TableRow>
                  ) : (
                    tenants.map((tenant) => (
                      <TableRow
                        key={tenant.id}
                        hover
                        onClick={() => handleRowClick(tenant)}
                        sx={{
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                          },
                          transition: 'background-color 0.2s',
                        }}
                      >
                        <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><PersonIcon sx={{ color: '#2e7d32', fontSize: 20 }} /><Typography variant="body1" sx={{ fontWeight: 600 }}>{tenant.full_name}</Typography></Box></TableCell>
                        <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><EmailIcon sx={{ fontSize: 16, color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }} />{tenant.email || '-'}</Box></TableCell>
                        <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><PhoneIcon sx={{ fontSize: 16, color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }} />{tenant.phone || '-'}</Box></TableCell>
                        <TableCell><Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tenant.notes || '-'}</Typography></TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDialog(tenant);
                            }}
                            sx={{ color: '#1976d2' }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentTenant(tenant);
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
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{currentTenant ? 'Edit Tenant' : 'Add New Tenant'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            {/* Split Full Name */}
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField label="First Name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required fullWidth />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField label="Middle Name (optional)" value={form.middle_name} onChange={(e) => setForm({ ...form, middle_name: e.target.value })} fullWidth />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField label="Last Name / Surname" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} required fullWidth />
                </Grid>
              </Grid>
            </Grid>
            {/* Username for Tenant Mobile App */}
            <Grid item xs={12}>
              <TextField label="Username (for Tenant App)" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} helperText="Username used to sign in on the tenant mobile app" fullWidth />
            </Grid>
            <Grid item xs={12}><TextField label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} fullWidth /></Grid>
            {currentTenant?.firebase_uid && (
              <Grid item xs={12}>
                <TextField label="Firebase UID" value={currentTenant.firebase_uid} InputProps={{ readOnly: true }} helperText="Linked Firebase identity (read-only)" fullWidth />
              </Grid>
            )}
            <Grid item xs={12}><TextField label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} fullWidth /></Grid>
            {/* Address fields */}
            <Grid item xs={12}><TextField label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} multiline rows={2} fullWidth /></Grid>
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}><TextField label="Unit/Building" value={form.address_unit} onChange={(e) => setForm({ ...form, address_unit: e.target.value })} helperText="e.g., Unit 5A, Building Name" fullWidth /></Grid>
                <Grid item xs={12} sm={4}><TextField label="Street" value={form.address_street} onChange={(e) => setForm({ ...form, address_street: e.target.value })} helperText="e.g., Katipunan Ave" fullWidth /></Grid>
                <Grid item xs={12} sm={4}><TextField label="Barangay" value={form.barangay} onChange={(e) => setForm({ ...form, barangay: e.target.value })} helperText="e.g., Barangay Loyola Heights" fullWidth /></Grid>
                <Grid item xs={12} sm={4}><TextField label="City / Municipality" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} fullWidth /></Grid>
                <Grid item xs={12} sm={4}><TextField label="Province" value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} fullWidth /></Grid>
                <Grid item xs={12} sm={4}><TextField label="Postal Code" value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} fullWidth /></Grid>
                <Grid item xs={12} sm={4}><TextField label="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} helperText="Fixed to Philippines" disabled fullWidth /></Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}><TextField label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} multiline rows={3} fullWidth /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>{currentTenant ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent><Typography>Are you sure you want to delete tenant "{currentTenant?.full_name}"? This action cannot be undone.</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Tenant Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon sx={{ color: '#2e7d32' }} />
            <Typography variant="h6">Tenant Details</Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {currentTenant && (
            <Box sx={{ py: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Full Name</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{currentTenant.full_name}</Typography>
                </Grid>
                {currentTenant.email && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Email</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <EmailIcon sx={{ fontSize: 18, color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }} />
                      <Typography variant="body1">{currentTenant.email}</Typography>
                    </Box>
                  </Grid>
                )}
                {currentTenant.phone && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Phone</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <PhoneIcon sx={{ fontSize: 18, color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }} />
                      <Typography variant="body1">{currentTenant.phone}</Typography>
                    </Box>
                  </Grid>
                )}
                {currentTenant.notes && (
                  <>
                    <Grid item xs={12}>
                      <Box component="hr" sx={{ border: 'none', borderTop: '1px solid', borderColor: 'divider', my: 1 }} />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">Notes</Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>{currentTenant.notes}</Typography>
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
              handleOpenDialog(currentTenant);
            }}
          >
            Edit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Tenants;
