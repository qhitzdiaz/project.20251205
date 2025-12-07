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
  Rating,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as BackIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { API_URLS } from '../../config/apiConfig';

const Suppliers = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === 'dark';

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState(null);
  const [form, setForm] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    status: 'active',
    rating: 0,
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URLS.SUPPLY}/suppliers`);
      if (!response.ok) throw new Error('Failed to load suppliers');
      const data = await response.json();
      setSuppliers(data);
    } catch (err) {
      setError('Unable to load suppliers. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (supplier = null) => {
    if (supplier) {
      setCurrentSupplier(supplier);
      setForm({
        name: supplier.name || '',
        contact_person: supplier.contact_person || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        status: supplier.status || 'active',
        rating: supplier.rating || 0,
      });
    } else {
      setCurrentSupplier(null);
      setForm({
        name: '',
        contact_person: '',
        email: '',
        phone: '',
        address: '',
        status: 'active',
        rating: 0,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCurrentSupplier(null);
    setForm({
      name: '',
      contact_person: '',
      email: '',
      phone: '',
      address: '',
      status: 'active',
      rating: 0,
    });
  };

  const handleSave = async () => {
    if (!form.name) {
      setError('Supplier name is required');
      return;
    }

    try {
      const url = currentSupplier
        ? `${API_URLS.SUPPLY}/suppliers/${currentSupplier.id}`
        : `${API_URLS.SUPPLY}/suppliers`;
      const method = currentSupplier ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error('Failed to save supplier');

      await loadSuppliers();
      handleCloseDialog();
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (!currentSupplier) return;

    try {
      const response = await fetch(`${API_URLS.SUPPLY}/suppliers/${currentSupplier.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete supplier');

      await loadSuppliers();
      setDeleteDialogOpen(false);
      setCurrentSupplier(null);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      default: return 'default';
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
          ? 'radial-gradient(circle at 10% 20%, rgba(124,77,255,0.08), transparent 25%), radial-gradient(circle at 90% 10%, rgba(0,172,193,0.1), transparent 25%), linear-gradient(180deg, #0b1021 0%, #0f1a30 40%, #0e172b 100%)'
          : 'linear-gradient(180deg, #f5f7fa 0%, #e8ecf1 50%, #dce3eb 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate('/supply-chain')}
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
                Suppliers
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}
              >
                Manage your supplier relationships
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{
                backgroundColor: '#7c4dff',
                '&:hover': { backgroundColor: '#6a40e6' },
              }}
            >
              Add Supplier
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Suppliers Table */}
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
                    <TableCell sx={{ fontWeight: 700 }}>Supplier Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Contact Person</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Phone</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Rating</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {suppliers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }}>
                          No suppliers found. Click "Add Supplier" to create one.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    suppliers.map((supplier) => (
                      <TableRow key={supplier.id} hover>
                        <TableCell>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {supplier.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <PersonIcon sx={{ fontSize: 16, color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }} />
                            {supplier.contact_person || '-'}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <EmailIcon sx={{ fontSize: 16, color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }} />
                            {supplier.email || '-'}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <PhoneIcon sx={{ fontSize: 16, color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }} />
                            {supplier.phone || '-'}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Rating value={supplier.rating || 0} readOnly size="small" />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={supplier.status || 'active'}
                            color={getStatusColor(supplier.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(supplier)}
                            sx={{ color: '#00acc1' }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setCurrentSupplier(supplier);
                              setDeleteDialogOpen(true);
                            }}
                            sx={{ color: '#f44336' }}
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
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{currentSupplier ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Supplier Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Contact Person"
              value={form.contact_person}
              onChange={(e) => setForm({ ...form, contact_person: e.target.value })}
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              fullWidth
            />
            <TextField
              label="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              fullWidth
            />
            <TextField
              label="Address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              multiline
              rows={2}
              fullWidth
            />
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Supplier Rating
              </Typography>
              <Rating
                value={form.rating}
                onChange={(e, newValue) => setForm({ ...form, rating: newValue || 0 })}
              />
            </Box>
            <TextField
              select
              label="Status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              SelectProps={{ native: true }}
              fullWidth
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {currentSupplier ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete supplier "{currentSupplier?.name}"? This action cannot be undone.
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

export default Suppliers;
