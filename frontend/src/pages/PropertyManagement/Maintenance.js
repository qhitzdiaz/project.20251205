import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Card, CardContent, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, CircularProgress, useTheme, Grid } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, ArrowBack as BackIcon, Build as BuildIcon } from '@mui/icons-material';
import { API_URLS } from '../../config/apiConfig';

const Maintenance = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === 'dark';
  const [requests, setRequests] = useState([]);
  const [properties, setProperties] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [form, setForm] = useState({ property_id: '', tenant_id: '', title: '', description: '', priority: 'medium', status: 'pending' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [reqRes, propRes, tenRes] = await Promise.all([fetch(`${API_URLS.PROPERTY}/maintenance`), fetch(`${API_URLS.PROPERTY}/properties`), fetch(`${API_URLS.PROPERTY}/tenants`)]);
      if (!reqRes.ok || !propRes.ok || !tenRes.ok) throw new Error('Failed to load data');
      setRequests(await reqRes.json());
      setProperties(await propRes.json());
      setTenants(await tenRes.json());
    } catch (err) {
      setError('Unable to load maintenance requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (request = null) => {
    if (request) {
      setCurrentRequest(request);
      setForm({ property_id: request.property_id || '', tenant_id: request.tenant_id || '', title: request.title || '', description: request.description || '', priority: request.priority || 'medium', status: request.status || 'pending' });
    } else {
      setCurrentRequest(null);
      setForm({ property_id: '', tenant_id: '', title: '', description: '', priority: 'medium', status: 'pending' });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.property_id) { setError('Title and property are required'); return; }
    try {
      const url = currentRequest ? `${API_URLS.PROPERTY}/maintenance/${currentRequest.id}` : `${API_URLS.PROPERTY}/maintenance`;
      const payload = { ...form, property_id: form.property_id ? parseInt(form.property_id, 10) : null, tenant_id: form.tenant_id ? parseInt(form.tenant_id, 10) : null };
      const response = await fetch(url, { method: currentRequest ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error('Failed to save maintenance request');
      await loadData();
      setDialogOpen(false);
      setCurrentRequest(null);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (!currentRequest) return;
    try {
      const response = await fetch(`${API_URLS.PROPERTY}/maintenance/${currentRequest.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete maintenance request');
      await loadData();
      setDeleteDialogOpen(false);
      setCurrentRequest(null);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'in_progress': return 'info';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const handleRowClick = (request) => {
    setCurrentRequest(request);
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
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: isDark ? 'white' : theme.palette.text.primary }}>Maintenance Requests</Typography>
              <Typography variant="body1" sx={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>Track and manage maintenance requests</Typography>
            </Box>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} sx={{ backgroundColor: '#ed6c02', '&:hover': { backgroundColor: '#e65100' } }}>Log Request</Button>
          </Box>
        </Box>
        {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
        <Card elevation={isDark ? 0 : 2} sx={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'white', border: isDark ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
          <CardContent>
            <TableContainer component={Paper} sx={{ background: 'transparent', boxShadow: 'none' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Property</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Tenant</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Priority</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Created</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requests.length === 0 ? (
                    <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}><Typography variant="body1" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }}>No maintenance requests found. Click "Log Request" to create one.</Typography></TableCell></TableRow>
                  ) : (
                    requests.map((request) => {
                      const property = properties.find(p => p.id === request.property_id);
                      const tenant = tenants.find(t => t.id === request.tenant_id);
                      return (
                        <TableRow
                          key={request.id}
                          hover
                          onClick={() => handleRowClick(request)}
                          sx={{
                            cursor: 'pointer',
                            '&:hover': {
                              backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                            },
                            transition: 'background-color 0.2s',
                          }}
                        >
                          <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><BuildIcon sx={{ color: '#ed6c02', fontSize: 20 }} /><Typography variant="body1" sx={{ fontWeight: 600 }}>{request.title}</Typography></Box></TableCell>
                          <TableCell>{property?.name || '-'}</TableCell>
                          <TableCell>{tenant?.full_name || '-'}</TableCell>
                          <TableCell><Chip label={request.priority || 'medium'} color={getPriorityColor(request.priority)} size="small" /></TableCell>
                          <TableCell><Chip label={request.status || 'pending'} color={getStatusColor(request.status)} size="small" /></TableCell>
                          <TableCell>{request.created_at ? new Date(request.created_at).toLocaleDateString() : '-'}</TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDialog(request);
                              }}
                              sx={{ color: '#1976d2' }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentRequest(request);
                                setDeleteDialogOpen(true);
                              }}
                              sx={{ color: '#d32f2f' }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Container>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{currentRequest ? 'Edit Maintenance Request' : 'Log New Maintenance Request'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}><TextField label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required fullWidth /></Grid>
            <Grid item xs={12} sm={6}><TextField select label="Property" value={form.property_id} onChange={(e) => setForm({ ...form, property_id: e.target.value })} SelectProps={{ native: true }} required fullWidth><option value="">-- Select Property --</option>{properties.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}</TextField></Grid>
            <Grid item xs={12} sm={6}><TextField select label="Tenant (Optional)" value={form.tenant_id} onChange={(e) => setForm({ ...form, tenant_id: e.target.value })} SelectProps={{ native: true }} fullWidth><option value="">-- Select Tenant --</option>{tenants.map((t) => (<option key={t.id} value={t.id}>{t.full_name}</option>))}</TextField></Grid>
            <Grid item xs={12} sm={6}><TextField select label="Priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} SelectProps={{ native: true }} fullWidth><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></TextField></Grid>
            <Grid item xs={12} sm={6}><TextField select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} SelectProps={{ native: true }} fullWidth><option value="pending">Pending</option><option value="in_progress">In Progress</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></TextField></Grid>
            <Grid item xs={12}><TextField label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} multiline rows={4} fullWidth /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>{currentRequest ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent><Typography>Are you sure you want to delete maintenance request "{currentRequest?.title}"? This action cannot be undone.</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Maintenance Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BuildIcon sx={{ color: '#ed6c02' }} />
              <Typography variant="h6">Maintenance Request</Typography>
            </Box>
            <Chip
              label={currentRequest?.status || 'pending'}
              color={getStatusColor(currentRequest?.status)}
              size="small"
            />
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {currentRequest && (
            <Box sx={{ py: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Title</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>{currentRequest.title}</Typography>
                </Grid>
                {currentRequest.description && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Description</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>{currentRequest.description}</Typography>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Box component="hr" sx={{ border: 'none', borderTop: '1px solid', borderColor: 'divider', my: 1 }} />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Priority</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip label={currentRequest.priority || 'medium'} color={getPriorityColor(currentRequest.priority)} size="small" />
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip label={currentRequest.status || 'pending'} color={getStatusColor(currentRequest.status)} size="small" />
                  </Box>
                </Grid>
                {currentRequest.property_id && (
                  <>
                    <Grid item xs={12}>
                      <Box component="hr" sx={{ border: 'none', borderTop: '1px solid', borderColor: 'divider', my: 1 }} />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">Property</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {properties.find(p => p.id === currentRequest.property_id)?.name || 'Unknown'}
                      </Typography>
                    </Grid>
                  </>
                )}
                {currentRequest.tenant_id && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Tenant</Typography>
                    <Typography variant="body1">
                      {tenants.find(t => t.id === currentRequest.tenant_id)?.full_name || 'Unknown'}
                    </Typography>
                  </Grid>
                )}
                {currentRequest.created_at && (
                  <>
                    <Grid item xs={12}>
                      <Box component="hr" sx={{ border: 'none', borderTop: '1px solid', borderColor: 'divider', my: 1 }} />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">Created</Typography>
                      <Typography variant="body2">{new Date(currentRequest.created_at).toLocaleDateString()}</Typography>
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
              handleOpenDialog(currentRequest);
            }}
          >
            Edit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Maintenance;
