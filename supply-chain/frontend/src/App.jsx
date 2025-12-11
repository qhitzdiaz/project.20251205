import React, { useEffect, useState, useMemo } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Paper,
  Box,
  Stack,
  Button,
  TextField,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  LocalShipping,
  Inventory,
  Factory,
  ShoppingCartCheckout,
  Add,
  Refresh,
} from '@mui/icons-material';
import {
  fetchDashboard,
  fetchProducts,
  fetchSuppliers,
  fetchPurchaseOrders,
  fetchShipments,
  createProduct,
  createSupplier,
  createPurchaseOrder,
  recordMovement,
} from './api';
import { API_BASE } from './api';

const StatCard = ({ icon, label, value, color }) => (
  <Paper elevation={3} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
    <Box
      sx={{
        width: 42,
        height: 42,
        borderRadius: '12px',
        bgcolor: `${color}.50`,
        color: `${color}.700`,
        display: 'grid',
        placeItems: 'center',
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        {value}
      </Typography>
    </Box>
  </Paper>
);

const Section = ({ title, action, children }) => (
  <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      {action}
    </Box>
    <Divider sx={{ mb: 2 }} />
    {children}
  </Paper>
);

function App() {
  const [dashboard, setDashboard] = useState(null);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  const [productForm, setProductForm] = useState({
    sku: '',
    name: '',
    description: '',
    supplier_id: '',
    unit_cost: '',
    unit: 'pcs',
    reorder_level: 0,
    reorder_quantity: 0,
  });

  const [supplierForm, setSupplierForm] = useState({
    name: '',
    contact_name: '',
    phone: '',
    email: '',
    address: '',
  });

  const [movementForm, setMovementForm] = useState({
    product_id: '',
    movement_type: 'inbound',
    quantity: 0,
    reason: '',
    reference: '',
  });

  const [poForm, setPoForm] = useState({
    reference: `PO-${new Date().getFullYear()}-${Math.floor(Math.random() * 900 + 100)}`,
    supplier_id: '',
    expected_date: '',
    notes: '',
    items: [],
  });

  const reload = async () => {
    setLoading(true);
    setError('');
    try {
      const [d, p, s, o, sh] = await Promise.all([
        fetchDashboard(),
        fetchProducts(),
        fetchSuppliers(),
        fetchPurchaseOrders(),
        fetchShipments(),
      ]);
      setDashboard(d);
      setProducts(p);
      setSuppliers(s);
      setPurchaseOrders(o);
      setShipments(sh);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Unable to load supply chain data. Ensure the backend (port 5070) is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const supplierMap = useMemo(
    () => Object.fromEntries(suppliers.map((s) => [s.id, s.name])),
    [suppliers]
  );

  const handleCreateProduct = async () => {
    setCreating(true);
    try {
      const payload = { ...productForm, supplier_id: productForm.supplier_id || null, unit_cost: Number(productForm.unit_cost || 0) };
      await createProduct(payload);
      setProductForm({
        sku: '',
        name: '',
        description: '',
        supplier_id: '',
        unit_cost: '',
        unit: 'pcs',
        reorder_level: 0,
        reorder_quantity: 0,
      });
      reload();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create product');
    } finally {
      setCreating(false);
    }
  };

  const handleCreateSupplier = async () => {
    setCreating(true);
    try {
      await createSupplier(supplierForm);
      setSupplierForm({ name: '', contact_name: '', phone: '', email: '', address: '' });
      reload();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create supplier');
    } finally {
      setCreating(false);
    }
  };

  const handleCreatePO = async () => {
    setCreating(true);
    try {
      await createPurchaseOrder({
        ...poForm,
        supplier_id: poForm.supplier_id || null,
        items: poForm.items.map((i) => ({
          ...i,
          quantity: Number(i.quantity),
          unit_cost: Number(i.unit_cost),
        })),
      });
      setPoForm({
        reference: `PO-${new Date().getFullYear()}-${Math.floor(Math.random() * 900 + 100)}`,
        supplier_id: '',
        expected_date: '',
        notes: '',
        items: [],
      });
      reload();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create purchase order');
    } finally {
      setCreating(false);
    }
  };

  const handleMovement = async () => {
    setCreating(true);
    try {
      await recordMovement({ ...movementForm, quantity: Number(movementForm.quantity) });
      setMovementForm({ product_id: '', movement_type: 'inbound', quantity: 0, reason: '', reference: '' });
      reload();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to record movement');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ height: '100vh', display: 'grid', placeItems: 'center' }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />
          <Typography>Loading supply chain...</Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f5f7fb', minHeight: '100vh' }}>
      <AppBar position="static" color="primary" enableColorOnDark>
        <Toolbar>
          <Typography variant="h6" sx={{ fontWeight: 700, flexGrow: 1 }}>
            Supply Chain Management
          </Typography>
          <Button color="inherit" startIcon={<Refresh />} onClick={reload}>
            Refresh
          </Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 4 }}>
        <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: '#e8f4ff', border: '1px solid #c7e3ff' }}>
          <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
            API: {API_BASE}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Status: {error ? 'Unavailable' : 'Healthy'} {lastUpdated ? `• Last updated ${lastUpdated.toLocaleTimeString()}` : ''}
          </Typography>
          {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
        </Paper>

        {dashboard && (
          <Grid container spacing={3} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard icon={<Factory />} label="Suppliers" value={dashboard.suppliers} color="indigo" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard icon={<Inventory />} label="Products" value={dashboard.products} color="teal" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard icon={<ShoppingCartCheckout />} label="Open POs" value={dashboard.open_purchase_orders} color="orange" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard icon={<LocalShipping />} label="Shipments in Transit" value={dashboard.shipments_in_transit} color="blue" />
            </Grid>
          </Grid>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Section title="Products">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>SKU</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Supplier</TableCell>
                    <TableCell align="right">Cost</TableCell>
                    <TableCell align="right">On Hand</TableCell>
                    <TableCell align="right">Reorder</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((p) => (
                    <TableRow key={p.id} hover>
                      <TableCell>{p.sku}</TableCell>
                      <TableCell>{p.name}</TableCell>
                      <TableCell>{p.supplier?.name || '—'}</TableCell>
                      <TableCell align="right">${p.unit_cost?.toFixed(2)}</TableCell>
                      <TableCell align="right">{p.stock_on_hand}</TableCell>
                      <TableCell align="right">
                        {p.reorder_level ? (
                          <Chip
                            size="small"
                            label={`Min ${p.reorder_level}`}
                            color={p.stock_on_hand <= p.reorder_level ? 'warning' : 'default'}
                          />
                        ) : (
                          '—'
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Section>

            <Section title="Purchase Orders" action={
              <Button startIcon={<Add />} variant="outlined" onClick={handleCreatePO} disabled={creating || !poForm.items.length}>
                Save PO
              </Button>
            }>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth label="Reference" value={poForm.reference} onChange={(e) => setPoForm({ ...poForm, reference: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    SelectProps={{ native: true }}
                    fullWidth
                    label="Supplier"
                    value={poForm.supplier_id}
                    onChange={(e) => setPoForm({ ...poForm, supplier_id: e.target.value })}
                  >
                    <option value="">Select supplier</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Expected Date"
                    InputLabelProps={{ shrink: true }}
                    value={poForm.expected_date}
                    onChange={(e) => setPoForm({ ...poForm, expected_date: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    label="Notes"
                    value={poForm.notes}
                    onChange={(e) => setPoForm({ ...poForm, notes: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>Line Items</Typography>
                  <Grid container spacing={2}>
                    {poForm.items.map((item, idx) => (
                      <React.Fragment key={idx}>
                        <Grid item xs={4}>
                          <TextField
                            select
                            SelectProps={{ native: true }}
                            fullWidth
                            label="Product"
                            value={item.product_id}
                            onChange={(e) => {
                              const next = [...poForm.items];
                              next[idx].product_id = Number(e.target.value);
                              setPoForm({ ...poForm, items: next });
                            }}
                          >
                            <option value="">Pick product</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </TextField>
                        </Grid>
                        <Grid item xs={4}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Quantity"
                            value={item.quantity}
                            onChange={(e) => {
                              const next = [...poForm.items];
                              next[idx].quantity = e.target.value;
                              setPoForm({ ...poForm, items: next });
                            }}
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Unit Cost"
                            value={item.unit_cost}
                            onChange={(e) => {
                              const next = [...poForm.items];
                              next[idx].unit_cost = e.target.value;
                              setPoForm({ ...poForm, items: next });
                            }}
                          />
                        </Grid>
                      </React.Fragment>
                    ))}
                  </Grid>
                  <Button
                    startIcon={<Add />}
                    sx={{ mt: 1 }}
                    onClick={() => setPoForm({ ...poForm, items: [...poForm.items, { product_id: '', quantity: 0, unit_cost: 0 }] })}
                  >
                    Add Item
                  </Button>
                </Grid>
              </Grid>

              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Reference</TableCell>
                    <TableCell>Supplier</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Lines</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {purchaseOrders.map((po) => (
                    <TableRow key={po.id}>
                      <TableCell>{po.reference}</TableCell>
                      <TableCell>{po.supplier?.name || '—'}</TableCell>
                      <TableCell>
                        <Chip size="small" label={po.status} color={po.status === 'received' ? 'success' : po.status === 'cancelled' ? 'error' : 'info'} />
                      </TableCell>
                      <TableCell align="right">{po.items?.length || 0}</TableCell>
                      <TableCell align="right">${po.total_amount?.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Section>
          </Grid>

          <Grid item xs={12} md={5}>
            <Section title="Add Supplier" action={
              <Button variant="contained" startIcon={<Add />} onClick={handleCreateSupplier} disabled={creating || !supplierForm.name}>
                Save Supplier
              </Button>
            }>
              <Stack spacing={2}>
                <TextField label="Name" value={supplierForm.name} onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })} />
                <TextField label="Contact" value={supplierForm.contact_name} onChange={(e) => setSupplierForm({ ...supplierForm, contact_name: e.target.value })} />
                <TextField label="Phone" value={supplierForm.phone} onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })} />
                <TextField label="Email" value={supplierForm.email} onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })} />
                <TextField label="Address" multiline minRows={2} value={supplierForm.address} onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })} />
              </Stack>
            </Section>

            <Section title="Add Product" action={
              <Button variant="contained" startIcon={<Add />} onClick={handleCreateProduct} disabled={creating || !productForm.sku || !productForm.name}>
                Save Product
              </Button>
            }>
              <Stack spacing={2}>
                <TextField label="SKU" value={productForm.sku} onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })} />
                <TextField label="Name" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} />
                <TextField label="Description" multiline minRows={2} value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} />
                <TextField
                  select
                  SelectProps={{ native: true }}
                  label="Supplier"
                  value={productForm.supplier_id}
                  onChange={(e) => setProductForm({ ...productForm, supplier_id: e.target.value })}
                >
                  <option value="">Select supplier</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </TextField>
                <Stack direction="row" spacing={2}>
                  <TextField label="Unit Cost" type="number" value={productForm.unit_cost} onChange={(e) => setProductForm({ ...productForm, unit_cost: e.target.value })} />
                  <TextField label="Unit" value={productForm.unit} onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })} />
                </Stack>
                <Stack direction="row" spacing={2}>
                  <TextField label="Reorder Level" type="number" value={productForm.reorder_level} onChange={(e) => setProductForm({ ...productForm, reorder_level: Number(e.target.value) })} />
                  <TextField label="Reorder Qty" type="number" value={productForm.reorder_quantity} onChange={(e) => setProductForm({ ...productForm, reorder_quantity: Number(e.target.value) })} />
                </Stack>
              </Stack>
            </Section>

            <Section title="Inventory Movement" action={
              <Button variant="contained" startIcon={<Add />} onClick={handleMovement} disabled={creating || !movementForm.product_id || !movementForm.quantity}>
                Record
              </Button>
            }>
              <Stack spacing={2}>
                <TextField
                  select
                  SelectProps={{ native: true }}
                  label="Product"
                  value={movementForm.product_id}
                  onChange={(e) => setMovementForm({ ...movementForm, product_id: Number(e.target.value) })}
                >
                  <option value="">Select product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </TextField>
                <TextField
                  select
                  SelectProps={{ native: true }}
                  label="Type"
                  value={movementForm.movement_type}
                  onChange={(e) => setMovementForm({ ...movementForm, movement_type: e.target.value })}
                >
                  <option value="inbound">Inbound</option>
                  <option value="outbound">Outbound</option>
                  <option value="adjust">Adjust</option>
                </TextField>
                <TextField
                  type="number"
                  label="Quantity"
                  value={movementForm.quantity}
                  onChange={(e) => setMovementForm({ ...movementForm, quantity: e.target.value })}
                />
                <TextField label="Reason" value={movementForm.reason} onChange={(e) => setMovementForm({ ...movementForm, reason: e.target.value })} />
                <TextField label="Reference" value={movementForm.reference} onChange={(e) => setMovementForm({ ...movementForm, reference: e.target.value })} />
              </Stack>
            </Section>

            <Section title="Shipments">
              <List dense>
                {shipments.map((s) => (
                  <ListItem key={s.id} divider>
                    <ListItemText
                      primary={`${s.carrier || 'Carrier TBD'} • ${s.status}`}
                      secondary={`PO: ${s.purchase_order_id || 'N/A'} • ETA: ${s.eta || '—'} • Tracking: ${s.tracking_number || '—'}`}
                    />
                  </ListItem>
                ))}
                {!shipments.length && <Typography color="text.secondary">No shipments yet.</Typography>}
              </List>
            </Section>

            <Section title="Low Stock">
              <List dense>
                {dashboard?.low_stock?.length ? (
                  dashboard.low_stock.map((ls) => (
                    <ListItem key={ls.id} divider>
                      <ListItemText primary={`${ls.name} (${ls.sku})`} secondary={`On hand: ${ls.stock_on_hand} • Reorder level: ${ls.reorder_level}`} />
                      <Chip label="Reorder" color="warning" size="small" />
                    </ListItem>
                  ))
                ) : (
                  <Typography color="text.secondary">No low-stock alerts right now.</Typography>
                )}
              </List>
            </Section>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default App;
