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
} from '@mui/icons-material';
import { API_URLS } from '../../config/apiConfig';

const PurchaseOrders = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === 'dark';

  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [form, setForm] = useState({
    order_number: '',
    supplier_id: '',
    product_id: '',
    quantity: '',
    unit_price: '',
    order_date: new Date().toISOString().split('T')[0],
    expected_delivery: '',
    status: 'pending',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [ordersRes, suppliersRes, productsRes] = await Promise.all([
        fetch(`${API_URLS.SUPPLY}/purchase-orders`),
        fetch(`${API_URLS.SUPPLY}/suppliers`),
        fetch(`${API_URLS.SUPPLY}/products`),
      ]);

      if (!ordersRes.ok || !suppliersRes.ok || !productsRes.ok) {
        throw new Error('Failed to load data');
      }

      const ordersData = await ordersRes.json();
      const suppliersData = await suppliersRes.json();
      const productsData = await productsRes.json();

      setOrders(ordersData);
      setSuppliers(suppliersData);
      setProducts(productsData);
    } catch (err) {
      setError('Unable to load purchase orders. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const generateOrderNumber = () => {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `PO-${dateStr}-${random}`;
  };

  const handleOpenDialog = (order = null) => {
    if (order) {
      setCurrentOrder(order);
      setForm({
        order_number: order.order_number || '',
        supplier_id: order.supplier_id || '',
        product_id: order.product_id || '',
        quantity: order.quantity || '',
        unit_price: order.unit_price || '',
        order_date: order.order_date || new Date().toISOString().split('T')[0],
        expected_delivery: order.expected_delivery || '',
        status: order.status || 'pending',
        notes: order.notes || '',
      });
    } else {
      setCurrentOrder(null);
      setForm({
        order_number: generateOrderNumber(),
        supplier_id: '',
        product_id: '',
        quantity: '',
        unit_price: '',
        order_date: new Date().toISOString().split('T')[0],
        expected_delivery: '',
        status: 'pending',
        notes: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCurrentOrder(null);
  };

  const handleSave = async () => {
    if (!form.order_number || !form.supplier_id || !form.quantity) {
      setError('Order number, supplier, and quantity are required');
      return;
    }

    try {
      const url = currentOrder
        ? `${API_URLS.SUPPLY}/purchase-orders/${currentOrder.id}`
        : `${API_URLS.SUPPLY}/purchase-orders`;
      const method = currentOrder ? 'PUT' : 'POST';

      const payload = {
        ...form,
        supplier_id: parseInt(form.supplier_id, 10),
        product_id: form.product_id ? parseInt(form.product_id, 10) : null,
        quantity: parseInt(form.quantity, 10),
        unit_price: form.unit_price ? parseFloat(form.unit_price) : 0,
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to save purchase order');

      await loadData();
      handleCloseDialog();
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (!currentOrder) return;

    try {
      const response = await fetch(`${API_URLS.SUPPLY}/purchase-orders/${currentOrder.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete purchase order');

      await loadData();
      setDeleteDialogOpen(false);
      setCurrentOrder(null);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'info';
      case 'shipped': return 'primary';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const calculateTotal = (quantity, unitPrice) => {
    return (parseFloat(quantity || 0) * parseFloat(unitPrice || 0)).toFixed(2);
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
                Purchase Orders
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}
              >
                Create and manage purchase orders to suppliers
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{
                backgroundColor: '#fb8c00',
                '&:hover': { backgroundColor: '#f57c00' },
              }}
            >
              Create Order
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Orders Table */}
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
                    <TableCell sx={{ fontWeight: 700 }}>Order Number</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Supplier</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Product</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Quantity</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Unit Price</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Total</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Order Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Expected Delivery</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }}>
                          No purchase orders found. Click "Create Order" to add one.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order) => {
                      const supplier = suppliers.find(s => s.id === order.supplier_id);
                      const product = products.find(p => p.id === order.product_id);
                      const total = calculateTotal(order.quantity, order.unit_price);

                      return (
                        <TableRow key={order.id} hover>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                              {order.order_number}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {supplier?.name || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>{product?.name || '-'}</TableCell>
                          <TableCell align="right">{order.quantity || 0}</TableCell>
                          <TableCell align="right">${parseFloat(order.unit_price || 0).toFixed(2)}</TableCell>
                          <TableCell align="right">
                            <Typography variant="body1" sx={{ fontWeight: 700 }}>
                              ${total}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {order.order_date ? new Date(order.order_date).toLocaleDateString() : '-'}
                          </TableCell>
                          <TableCell>
                            {order.expected_delivery ? new Date(order.expected_delivery).toLocaleDateString() : '-'}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={order.status || 'pending'}
                              color={getStatusColor(order.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(order)}
                              sx={{ color: '#00acc1' }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setCurrentOrder(order);
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
        <DialogTitle>{currentOrder ? 'Edit Purchase Order' : 'Create Purchase Order'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Order Number"
                value={form.order_number}
                onChange={(e) => setForm({ ...form, order_number: e.target.value })}
                required
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
                required
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
                select
                label="Product (Optional)"
                value={form.product_id}
                onChange={(e) => {
                  const productId = e.target.value;
                  const product = products.find(p => p.id === parseInt(productId, 10));
                  setForm({
                    ...form,
                    product_id: productId,
                    unit_price: product?.unit_price || form.unit_price,
                  });
                }}
                SelectProps={{ native: true }}
                fullWidth
              >
                <option value="">-- Select Product --</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - {product.sku}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Quantity"
                type="number"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                required
                fullWidth
              />
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
                label="Total Amount"
                value={`$${calculateTotal(form.quantity, form.unit_price)}`}
                InputProps={{ readOnly: true }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Order Date"
                type="date"
                value={form.order_date}
                onChange={(e) => setForm({ ...form, order_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Expected Delivery"
                type="date"
                value={form.expected_delivery}
                onChange={(e) => setForm({ ...form, expected_delivery: e.target.value })}
                InputLabelProps={{ shrink: true }}
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
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                multiline
                rows={3}
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {currentOrder ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete purchase order "{currentOrder?.order_number}"? This action cannot be undone.
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

export default PurchaseOrders;
