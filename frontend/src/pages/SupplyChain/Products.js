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
  Warning as WarningIcon,
} from '@mui/icons-material';
import { API_URLS } from '../../config/apiConfig';

const Products = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === 'dark';

  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [form, setForm] = useState({
    name: '',
    sku: '',
    category: '',
    unit_price: '',
    unit_of_measure: '',
    quantity_in_stock: '',
    reorder_level: '',
    safety_stock: '',
    lead_time_days: '',
    supplier_id: '',
    status: 'available',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [productsRes, suppliersRes] = await Promise.all([
        fetch(`${API_URLS.SUPPLY}/products`),
        fetch(`${API_URLS.SUPPLY}/suppliers`),
      ]);

      if (!productsRes.ok || !suppliersRes.ok) throw new Error('Failed to load data');

      const productsData = await productsRes.json();
      const suppliersData = await suppliersRes.json();

      setProducts(productsData);
      setSuppliers(suppliersData);
    } catch (err) {
      setError('Unable to load products. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (product = null) => {
    if (product) {
      setCurrentProduct(product);
      setForm({
        name: product.name || '',
        sku: product.sku || '',
        category: product.category || '',
        unit_price: product.unit_price || '',
        unit_of_measure: product.unit_of_measure || '',
        quantity_in_stock: product.quantity_in_stock || '',
        reorder_level: product.reorder_level || '',
        safety_stock: product.safety_stock || '',
        lead_time_days: product.lead_time_days || '',
        supplier_id: product.supplier_id || '',
        status: product.status || 'available',
      });
    } else {
      setCurrentProduct(null);
      setForm({
        name: '',
        sku: '',
        category: '',
        unit_price: '',
        unit_of_measure: '',
        quantity_in_stock: '',
        reorder_level: '',
        safety_stock: '',
        lead_time_days: '',
        supplier_id: '',
        status: 'available',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCurrentProduct(null);
  };

  const handleSave = async () => {
    if (!form.name || !form.sku) {
      setError('Product name and SKU are required');
      return;
    }

    try {
      const url = currentProduct
        ? `${API_URLS.SUPPLY}/products/${currentProduct.id}`
        : `${API_URLS.SUPPLY}/products`;
      const method = currentProduct ? 'PUT' : 'POST';

      const payload = {
        ...form,
        unit_price: form.unit_price ? parseFloat(form.unit_price) : 0,
        quantity_in_stock: form.quantity_in_stock ? parseInt(form.quantity_in_stock, 10) : 0,
        reorder_level: form.reorder_level ? parseInt(form.reorder_level, 10) : 0,
        safety_stock: form.safety_stock ? parseInt(form.safety_stock, 10) : 0,
        lead_time_days: form.lead_time_days ? parseInt(form.lead_time_days, 10) : 0,
        supplier_id: form.supplier_id ? parseInt(form.supplier_id, 10) : null,
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to save product');

      await loadData();
      handleCloseDialog();
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (!currentProduct) return;

    try {
      const response = await fetch(`${API_URLS.SUPPLY}/products/${currentProduct.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete product');

      await loadData();
      setDeleteDialogOpen(false);
      setCurrentProduct(null);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const getStockStatus = (product) => {
    const qty = product.quantity_in_stock || 0;
    const reorder = product.reorder_level || 0;
    const safety = product.safety_stock || 0;

    if (qty === 0) return { label: 'Out of Stock', color: 'error' };
    if (qty <= safety) return { label: 'Critical', color: 'error' };
    if (qty <= reorder) return { label: 'Low Stock', color: 'warning' };
    return { label: 'In Stock', color: 'success' };
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
      <Container maxWidth="xl">
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
                Products & Inventory
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}
              >
                Manage your product catalog and inventory levels
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{
                backgroundColor: '#00acc1',
                '&:hover': { backgroundColor: '#0097a7' },
              }}
            >
              Add Product
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Products Table */}
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
                    <TableCell sx={{ fontWeight: 700 }}>SKU</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Product Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Supplier</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Unit Price</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">In Stock</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Reorder Level</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }}>
                          No products found. Click "Add Product" to create one.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product) => {
                      const stockStatus = getStockStatus(product);
                      const supplier = suppliers.find(s => s.id === product.supplier_id);

                      return (
                        <TableRow key={product.id} hover>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                              {product.sku}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {product.name}
                            </Typography>
                            {product.unit_of_measure && (
                              <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                                per {product.unit_of_measure}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>{product.category || '-'}</TableCell>
                          <TableCell>{supplier?.name || '-'}</TableCell>
                          <TableCell align="right">
                            ${parseFloat(product.unit_price || 0).toFixed(2)}
                          </TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                              {stockStatus.color === 'warning' || stockStatus.color === 'error' ? (
                                <WarningIcon sx={{ fontSize: 16, color: stockStatus.color === 'error' ? '#f44336' : '#fb8c00' }} />
                              ) : null}
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {product.quantity_in_stock || 0}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right">{product.reorder_level || 0}</TableCell>
                          <TableCell>
                            <Chip label={stockStatus.label} color={stockStatus.color} size="small" />
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(product)}
                              sx={{ color: '#00acc1' }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setCurrentProduct(product);
                                setDeleteDialogOpen(true);
                              }}
                              sx={{ color: '#f44336' }}
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
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{currentProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Product Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="SKU"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Supplier"
                value={form.supplier_id}
                onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}
                SelectProps={{ native: true }}
                fullWidth
              >
                <option value="">-- Select Supplier --</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Unit Price"
                type="number"
                inputProps={{ step: '0.01' }}
                value={form.unit_price}
                onChange={(e) => setForm({ ...form, unit_price: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Unit of Measure"
                value={form.unit_of_measure}
                onChange={(e) => setForm({ ...form, unit_of_measure: e.target.value })}
                placeholder="e.g., box, unit, kg"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Quantity in Stock"
                type="number"
                value={form.quantity_in_stock}
                onChange={(e) => setForm({ ...form, quantity_in_stock: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Reorder Level"
                type="number"
                value={form.reorder_level}
                onChange={(e) => setForm({ ...form, reorder_level: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Safety Stock"
                type="number"
                value={form.safety_stock}
                onChange={(e) => setForm({ ...form, safety_stock: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Lead Time (Days)"
                type="number"
                value={form.lead_time_days}
                onChange={(e) => setForm({ ...form, lead_time_days: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                label="Status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                SelectProps={{ native: true }}
                fullWidth
              >
                <option value="available">Available</option>
                <option value="discontinued">Discontinued</option>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {currentProduct ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete product "{currentProduct?.name}"? This action cannot be undone.
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

export default Products;
