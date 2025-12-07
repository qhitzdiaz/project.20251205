import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  TextField,
  Stack,
} from '@mui/material';
import { API_URLS } from '../config/apiConfig';

const Card = ({ title, value, accent }) => (
  <Paper elevation={3} sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <Typography variant="subtitle2" color="text.secondary">{title}</Typography>
    <Chip label={value} color={accent} />
  </Paper>
);

const SupplyChainApp = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboard, setDashboard] = useState(null);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [form, setForm] = useState({
    sku: '',
    name: '',
    description: '',
    supplier_id: '',
    unit_cost: '',
    reorder_level: '',
    reorder_quantity: '',
  });
  const [formError, setFormError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [dRes, pRes, poRes, sRes, supRes] = await Promise.all([
        fetch(`${API_URLS.SUPPLY}/dashboard`).then((r) => r.json()),
        fetch(`${API_URLS.SUPPLY}/products`).then((r) => r.json()),
        fetch(`${API_URLS.SUPPLY}/purchase-orders`).then((r) => r.json()),
        fetch(`${API_URLS.SUPPLY}/shipments`).then((r) => r.json()),
        fetch(`${API_URLS.SUPPLY}/suppliers`).then((r) => r.json()),
      ]);
      setDashboard(dRes);
      setProducts(pRes);
      setPurchaseOrders(poRes);
      setShipments(sRes);
      setSuppliers(supRes);
    } catch (err) {
      setError('Cannot reach Supply Chain API (port 5060). Make sure docker-compose in supply-chain/backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async () => {
    setFormError('');
    if (!form.sku || !form.name) {
      setFormError('SKU and Name are required.');
      return;
    }
    try {
      const resp = await fetch(`${API_URLS.SUPPLY}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: form.sku,
          name: form.name,
          description: form.description,
          supplier_id: form.supplier_id ? Number(form.supplier_id) : null,
          unit_cost: Number(form.unit_cost || 0),
          unit: 'pcs',
          reorder_level: Number(form.reorder_level || 0),
          reorder_quantity: Number(form.reorder_quantity || 0),
        }),
      });
      if (!resp.ok) {
        const msg = (await resp.json())?.detail || 'Failed to create product';
        setFormError(msg);
        return;
      }
      setForm({
        sku: '',
        name: '',
        description: '',
        supplier_id: '',
        unit_cost: '',
        reorder_level: '',
        reorder_quantity: '',
      });
      await load();
    } catch {
      setFormError('Failed to create product');
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 4, display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
        Supply Chain Management
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Track suppliers, products, purchase orders, shipments, and low-stock alerts. This view uses the dedicated Supply Chain API on port 5060.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {dashboard && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}><Card title="Suppliers" value={dashboard.suppliers} accent="primary" /></Grid>
          <Grid item xs={12} sm={6} md={3}><Card title="Products" value={dashboard.products} accent="success" /></Grid>
          <Grid item xs={12} sm={6} md={3}><Card title="Open POs" value={dashboard.open_purchase_orders} accent="warning" /></Grid>
          <Grid item xs={12} sm={6} md={3}><Card title="Shipments In Transit" value={dashboard.shipments_in_transit} accent="info" /></Grid>
        </Grid>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Products</Typography>
            <Divider sx={{ mb: 1 }} />
            <List dense>
              {products.map((p) => (
                <ListItem key={p.id} divider>
                  <ListItemText
                    primary={`${p.name} (${p.sku})`}
                    secondary={`Supplier: ${p.supplier?.name || '—'} • On hand: ${p.stock_on_hand}`}
                  />
                  {p.reorder_level && p.stock_on_hand <= p.reorder_level && (
                    <Chip label="Reorder" color="warning" size="small" />
                  )}
                </ListItem>
              ))}
              {!products.length && <Typography color="text.secondary">No products yet.</Typography>}
            </List>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Add Product</Typography>
            {formError && <Alert severity="error" sx={{ mb: 1 }}>{formError}</Alert>}
            <Stack spacing={1.5}>
              <TextField label="SKU *" size="small" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
              <TextField label="Name *" size="small" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <TextField label="Description" size="small" multiline minRows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <TextField
                select
                SelectProps={{ native: true }}
                label="Supplier"
                size="small"
                value={form.supplier_id}
                onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}
              >
                <option value="">Select supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </TextField>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <TextField label="Unit Cost" type="number" size="small" value={form.unit_cost} onChange={(e) => setForm({ ...form, unit_cost: e.target.value })} />
                <TextField label="Reorder Level" type="number" size="small" value={form.reorder_level} onChange={(e) => setForm({ ...form, reorder_level: e.target.value })} />
                <TextField label="Reorder Qty" type="number" size="small" value={form.reorder_quantity} onChange={(e) => setForm({ ...form, reorder_quantity: e.target.value })} />
              </Stack>
              <Button variant="contained" onClick={handleCreateProduct}>Save Product</Button>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Purchase Orders</Typography>
            <Divider sx={{ mb: 1 }} />
            <List dense>
              {purchaseOrders.map((po) => (
                <ListItem key={po.id} divider>
                  <ListItemText
                    primary={`${po.reference} • ${po.status}`}
                    secondary={`Supplier: ${po.supplier?.name || '—'} • Lines: ${po.items?.length || 0} • Total: $${po.total_amount?.toFixed(2)}`}
                  />
                  <Chip size="small" label={po.status} color={po.status === 'received' ? 'success' : 'info'} />
                </ListItem>
              ))}
              {!purchaseOrders.length && <Typography color="text.secondary">No purchase orders yet.</Typography>}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Shipments</Typography>
            <Divider sx={{ mb: 1 }} />
            <List dense>
              {shipments.map((s) => (
                <ListItem key={s.id} divider>
                  <ListItemText
                    primary={`${s.carrier || 'Carrier TBD'} • ${s.status}`}
                    secondary={`PO ${s.purchase_order_id || 'N/A'} • Tracking ${s.tracking_number || '—'} • ETA ${s.eta || '—'}`}
                  />
                  <Chip size="small" label={s.status} color={s.status === 'delivered' ? 'success' : 'info'} />
                </ListItem>
              ))}
              {!shipments.length && <Typography color="text.secondary">No shipments yet.</Typography>}
            </List>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <Button variant="outlined" onClick={load}>Refresh</Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SupplyChainApp;
