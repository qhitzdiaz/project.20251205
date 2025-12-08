import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Work as WorkIcon,
} from '@mui/icons-material';
import { API_URLS } from '../../config/apiConfig';

const StaffPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [staff, setStaff] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [current, setCurrent] = useState(null);
  const [form, setForm] = useState({
    full_name: '',
    role: '',
    email: '',
    phone: '',
    property_id: '',
    department: '',
    address: '',
    date_of_birth: '',
    start_date: '',
    notes: '',
    is_active: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [staffRes, propsRes] = await Promise.all([
        fetch(`${API_URLS.PROPERTY}/staff`),
        fetch(`${API_URLS.PROPERTY}/properties`),
      ]);
      if (!staffRes.ok || !propsRes.ok) throw new Error('Failed to load staff');
      setStaff(await staffRes.json());
      setProperties(await propsRes.json());
    } catch (err) {
      setError('Unable to load staff. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (row = null) => {
    if (row) {
      setCurrent(row);
      setForm({
        full_name: row.full_name || '',
        role: row.role || '',
        email: row.email || '',
        phone: row.phone || '',
        property_id: row.property_id || '',
        department: row.department || '',
        address: row.address || '',
        date_of_birth: row.date_of_birth || '',
        start_date: row.start_date || '',
        notes: row.notes || '',
        is_active: row.is_active ?? true,
      });
    } else {
      setCurrent(null);
      setForm({
        full_name: '',
        role: '',
        email: '',
        phone: '',
        property_id: '',
        department: '',
        address: '',
        date_of_birth: '',
        start_date: '',
        notes: '',
        is_active: true,
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.full_name) {
      setError('Name is required');
      return;
    }
    try {
      const url = current ? `${API_URLS.PROPERTY}/staff/${current.id}` : `${API_URLS.PROPERTY}/staff`;
      const method = current ? 'PUT' : 'POST';
      const payload = {
        ...form,
        property_id: form.property_id ? parseInt(form.property_id, 10) : null,
        date_of_birth: form.date_of_birth || null,
        start_date: form.start_date || null,
      };
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to save staff');
      await loadData();
      setDialogOpen(false);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (!current) return;
    try {
      const res = await fetch(`${API_URLS.PROPERTY}/staff/${current.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete staff');
      await loadData();
      setDeleteDialogOpen(false);
      setCurrent(null);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: 4,
        background: isDark
          ? 'radial-gradient(circle at 10% 20%, rgba(25,118,210,0.08), transparent 25%), radial-gradient(circle at 90% 10%, rgba(46,125,50,0.1), transparent 25%), linear-gradient(180deg, #0b1021 0%, #0f1a30 40%, #0e172b 100%)'
          : 'linear-gradient(180deg, #f5f7fa 0%, #e8ecf1 50%, #dce3eb 100%)',
      }}
    >
      <Container maxWidth="xl">
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate('/property')}
            sx={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}
          >
            Back to Dashboard
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
            sx={{ backgroundColor: '#6a1b9a', '&:hover': { backgroundColor: '#5a1586' } }}
          >
            Add Staff
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Card elevation={isDark ? 0 : 2} sx={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'white', border: isDark ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <WorkIcon color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Staff
              </Typography>
            </Box>
            <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Property</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>DOB</TableCell>
                    <TableCell>Start</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {staff.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No staff yet. Click "Add Staff" to create one.
                      </TableCell>
                    </TableRow>
                  ) : (
                    staff.map((row) => {
                      const prop = properties.find((p) => p.id === row.property_id);
                      return (
                        <TableRow key={row.id} hover>
                          <TableCell sx={{ fontWeight: 600 }}>{row.full_name}</TableCell>
                          <TableCell>{row.role || '—'}</TableCell>
                          <TableCell>{row.department || '—'}</TableCell>
                          <TableCell>{prop ? prop.name : 'Unassigned'}</TableCell>
                          <TableCell>{row.email || '—'}</TableCell>
                          <TableCell>{row.phone || '—'}</TableCell>
                          <TableCell>{row.date_of_birth ? new Date(row.date_of_birth).toLocaleDateString() : '—'}</TableCell>
                          <TableCell>{row.start_date ? new Date(row.start_date).toLocaleDateString() : '—'}</TableCell>
                          <TableCell>
                            <Chip size="small" label={row.is_active ? 'Active' : 'Inactive'} color={row.is_active ? 'success' : 'default'} />
                          </TableCell>
                          <TableCell align="right">
                            <IconButton size="small" onClick={() => handleOpen(row)} sx={{ color: '#1976d2' }}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setCurrent(row);
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{current ? 'Edit Staff' : 'Add Staff'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                label="Full Name"
                fullWidth
                required
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Role" fullWidth value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Department" fullWidth value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Email" fullWidth value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Phone" fullWidth value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Address"
                fullWidth
                multiline
                minRows={2}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date of Birth"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={form.date_of_birth}
                onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Start Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                label="Property"
                value={form.property_id}
                onChange={(e) => setForm({ ...form, property_id: e.target.value })}
                SelectProps={{ native: true }}
                fullWidth
              >
                <option value="">-- Unassigned --</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                label="Status"
                value={form.is_active ? 'active' : 'inactive'}
                onChange={(e) => setForm({ ...form, is_active: e.target.value === 'active' })}
                SelectProps={{ native: true }}
                fullWidth
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Notes"
                multiline
                minRows={3}
                fullWidth
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {current ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Staff</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete {current?.full_name}?</Typography>
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

export default StaffPage;
