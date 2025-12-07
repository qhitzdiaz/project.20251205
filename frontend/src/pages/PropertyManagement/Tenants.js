import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Card, CardContent, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, CircularProgress, useTheme, Grid } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, ArrowBack as BackIcon, Person as PersonIcon, Email as EmailIcon, Phone as PhoneIcon } from '@mui/icons-material';
import { API_URLS } from '../../config/apiConfig';

const Tenants = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === 'dark';
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentTenant, setCurrentTenant] = useState(null);
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', notes: '' });

  useEffect(() => { loadTenants(); }, []);

  const loadTenants = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URLS.PROPERTY}/tenants`);
      if (!response.ok) throw new Error('Failed to load tenants');
      setTenants(await response.json());
    } catch (err) {
      setError('Unable to load tenants. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (tenant = null) => {
    if (tenant) {
      setCurrentTenant(tenant);
      setForm({ full_name: tenant.full_name || '', email: tenant.email || '', phone: tenant.phone || '', notes: tenant.notes || '' });
    } else {
      setCurrentTenant(null);
      setForm({ full_name: '', email: '', phone: '', notes: '' });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.full_name) { setError('Tenant name is required'); return; }
    try {
      const url = currentTenant ? `${API_URLS.PROPERTY}/tenants/${currentTenant.id}` : `${API_URLS.PROPERTY}/tenants`;
      const response = await fetch(url, { method: currentTenant ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
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
                      <TableRow key={tenant.id} hover>
                        <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><PersonIcon sx={{ color: '#2e7d32', fontSize: 20 }} /><Typography variant="body1" sx={{ fontWeight: 600 }}>{tenant.full_name}</Typography></Box></TableCell>
                        <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><EmailIcon sx={{ fontSize: 16, color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }} />{tenant.email || '-'}</Box></TableCell>
                        <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><PhoneIcon sx={{ fontSize: 16, color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }} />{tenant.phone || '-'}</Box></TableCell>
                        <TableCell><Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tenant.notes || '-'}</Typography></TableCell>
                        <TableCell align="right">
                          <IconButton size="small" onClick={() => handleOpenDialog(tenant)} sx={{ color: '#1976d2' }}><EditIcon fontSize="small" /></IconButton>
                          <IconButton size="small" onClick={() => { setCurrentTenant(tenant); setDeleteDialogOpen(true); }} sx={{ color: '#d32f2f' }}><DeleteIcon fontSize="small" /></IconButton>
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
            <Grid item xs={12}><TextField label="Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required fullWidth /></Grid>
            <Grid item xs={12}><TextField label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} fullWidth /></Grid>
            <Grid item xs={12}><TextField label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} fullWidth /></Grid>
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
    </Box>
  );
};

export default Tenants;
