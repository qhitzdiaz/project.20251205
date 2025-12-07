import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  TextField,
  Typography,
  Alert,
  Divider,
  Chip,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import { API_URLS } from '../config/apiConfig';

const AddProductPage = () => {
  const [form, setForm] = useState({
    name: '',
    sku: '',
    category: '',
    unitPrice: '',
    standardCost: '',
    unitOfMeasure: '',
    quantity: '',
    reorderLevel: '',
    safetyStock: '',
    leadTimeDays: '',
    description: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!form.name || !form.sku) {
      setError('Name and SKU are required.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        sku: form.sku,
        category: form.category,
        unit_price: form.unitPrice ? parseFloat(form.unitPrice) : 0,
        standard_cost: form.standardCost ? parseFloat(form.standardCost) : 0,
        unit_of_measure: form.unitOfMeasure,
        quantity_in_stock: form.quantity ? parseInt(form.quantity, 10) : 0,
        reorder_level: form.reorderLevel ? parseInt(form.reorderLevel, 10) : 0,
        safety_stock: form.safetyStock ? parseInt(form.safetyStock, 10) : 0,
        lead_time_days: form.leadTimeDays ? parseInt(form.leadTimeDays, 10) : 0,
        description: form.description,
        status: 'available',
      };
      const res = await fetch(`${API_URLS.SUPPLY}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Unable to save product.');
      }
      setSubmitted(true);
      setForm({
        name: '',
        sku: '',
        category: '',
        unitPrice: '',
        standardCost: '',
        unitOfMeasure: '',
        quantity: '',
        reorderLevel: '',
        safetyStock: '',
        leadTimeDays: '',
        description: '',
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
        background: 'linear-gradient(180deg, #0b1021 0%, #0f1a30 40%, #0e172b 100%)',
        py: { xs: 6, md: 10 },
      }}
    >
      <Container maxWidth="md">
        <Card elevation={6} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ background: 'linear-gradient(135deg, #512da8, #00acc1)', color: 'white', p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Chip label="Supply Chain" size="small" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.5)', backgroundColor: 'transparent' }} />
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>Workspace</Typography>
            </Stack>
            <IconButton size="small" onClick={() => window.history.back()} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Box sx={{ backgroundColor: '#f7f9fc', px: 3, py: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Add a Product
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)' }}>
              Capture SKU details, costs, and reorder settings in one place.
            </Typography>
          </Box>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={2}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={8}>
                  <TextField
                    label="Product name"
                    fullWidth
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="SKU"
                    fullWidth
                    required
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Category"
                    fullWidth
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Unit price"
                    type="number"
                    inputProps={{ step: '0.01' }}
                    fullWidth
                    value={form.unitPrice}
                    onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Standard cost"
                    type="number"
                    inputProps={{ step: '0.01' }}
                    fullWidth
                    value={form.standardCost}
                    onChange={(e) => setForm({ ...form, standardCost: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Unit of measure"
                    fullWidth
                    value={form.unitOfMeasure}
                    onChange={(e) => setForm({ ...form, unitOfMeasure: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="On-hand quantity"
                    type="number"
                    fullWidth
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Reorder level"
                    type="number"
                    fullWidth
                    value={form.reorderLevel}
                    onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Safety stock"
                    type="number"
                    fullWidth
                    value={form.safetyStock}
                    onChange={(e) => setForm({ ...form, safetyStock: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Lead time (days)"
                    type="number"
                    fullWidth
                    value={form.leadTimeDays}
                    onChange={(e) => setForm({ ...form, leadTimeDays: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Description"
                    fullWidth
                    multiline
                    minRows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </Grid>
              </Grid>

              {error && <Alert severity="error">{error}</Alert>}
              {submitted && (
                <Alert severity="success">
                  Product saved to Supply Chain API.
                </Alert>
              )}

              <Divider />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="flex-end">
                <Button variant="outlined" href="/supply-chain">
                  Back to Supply Chain
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save product'}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default AddProductPage;
