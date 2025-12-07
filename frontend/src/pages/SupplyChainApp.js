import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  Stack,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import {
  LocalShipping as LocalShippingIcon,
  Inventory2 as InventoryIcon,
  Timeline as TimelineIcon,
  Verified as VerifiedIcon,
  Bolt as BoltIcon,
  Insights as InsightsIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { API_URLS } from '../config/apiConfig';

const highlights = [
  {
    title: 'Supplier visibility',
    description: 'Scorecards, lead times, and clear ownership for every vendor relationship.',
    icon: <LocalShippingIcon sx={{ color: '#7c4dff' }} />,
  },
  {
    title: 'Inventory control',
    description: 'Track inbound, on-hand, and reserved stock with calibrated safety levels.',
    icon: <InventoryIcon sx={{ color: '#00acc1' }} />,
  },
  {
    title: 'Execution playbooks',
    description: 'Issue POs, capture receipts, and route exceptions with a predictable rhythm.',
    icon: <TimelineIcon sx={{ color: '#fb8c00' }} />,
  },
];

const pillars = [
  {
    label: 'Assurance',
    headline: 'Audit-ready by design',
    copy: 'Proof points for every movement: approvals, timestamps, attachments, and supplier acknowledgements.',
    icon: <VerifiedIcon color="success" />,
  },
  {
    label: 'Speed',
    headline: 'Shorten cycle times',
    copy: 'Pre-built templates, auto-filled reorder points, and SLA timers keep teams moving.',
    icon: <BoltIcon color="warning" />,
  },
  {
    label: 'Insight',
    headline: 'Decisions in real time',
    copy: 'A single operational lens with margin impact, risk flags, and landed-cost visibility.',
    icon: <InsightsIcon color="info" />,
  },
];

const steps = [
  'Model suppliers, SKUs, and lanes with your own rules.',
  'Publish playbooks for purchasing, receiving, and exception handling.',
  'Track every movement in one timeline and surface the risks automatically.',
  'Share a clean summary with finance, ops, and partners—no extra spreadsheets.',
];

const SupplyChainPage = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    sku: '',
    category: '',
    unitPrice: '',
    quantity: '',
    reorderLevel: '',
    unitOfMeasure: '',
    safetyStock: '',
    leadTimeDays: '',
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
        unit_of_measure: form.unitOfMeasure,
        quantity_in_stock: form.quantity ? parseInt(form.quantity, 10) : 0,
        reorder_level: form.reorderLevel ? parseInt(form.reorderLevel, 10) : 0,
        safety_stock: form.safetyStock ? parseInt(form.safetyStock, 10) : 0,
        lead_time_days: form.leadTimeDays ? parseInt(form.leadTimeDays, 10) : 0,
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
        quantity: '',
        reorderLevel: '',
        unitOfMeasure: '',
        safetyStock: '',
        leadTimeDays: '',
      });
      setTimeout(() => setSubmitted(false), 1800);
      setTimeout(() => setDialogOpen(false), 300);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 10% 20%, rgba(124,77,255,0.08), transparent 25%), radial-gradient(circle at 90% 10%, rgba(0,172,193,0.1), transparent 25%), linear-gradient(180deg, #0b1021 0%, #0f1a30 40%, #0e172b 100%)',
        color: 'white',
        py: { xs: 6, md: 10 },
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ maxWidth: 760, mb: 6 }}>
          <Chip
            label="New supply chain workspace"
            sx={{
              mb: 2,
              backgroundColor: 'rgba(255,255,255,0.08)',
              color: 'white',
              borderRadius: 2,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          />
          <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1.2, mb: 2 }}>
            Build a predictable supply chain with fewer clicks and clearer signals.
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.75)', mb: 4 }}>
            One focused workspace for suppliers, purchase orchestration, and inventory truth—without bolting on extra tools.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              sx={{ backgroundColor: '#7c4dff', '&:hover': { backgroundColor: '#6a40e6' }, minWidth: 200 }}
              onClick={() => setDialogOpen(true)}
            >
              Add product
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{
                borderColor: 'rgba(255,255,255,0.4)',
                color: 'white',
                minWidth: 180,
                '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.05)' },
              }}
              href="/supply-chain/add-product"
            >
              Open add-product page
            </Button>
          </Stack>
        </Box>

        <Grid container spacing={3} sx={{ mb: 5 }}>
          {highlights.map((item) => (
            <Grid item xs={12} md={4} key={item.title}>
              <Card
                elevation={0}
              sx={{
                height: '100%',
                backgroundColor: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  {item.icon}
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
                    {item.title}
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  {item.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

        <Grid container spacing={3} sx={{ mb: 6 }}>
          {pillars.map((pillar) => (
            <Grid item xs={12} md={4} key={pillar.label}>
              <Card
                elevation={0}
              sx={{
                height: '100%',
                backgroundColor: 'rgba(15, 23, 43, 0.9)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                  {pillar.icon}
                  <Chip label={pillar.label} size="small" sx={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.08)' }} />
                </Stack>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'white', mb: 1 }}>
                  {pillar.headline}
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.75)' }}>
                  {pillar.copy}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

        <Card
          elevation={0}
          sx={{
            mb: 6,
            backgroundColor: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <CardContent>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'white', mb: 2 }}>
              How we roll it out
            </Typography>
            <Grid container spacing={2}>
              {steps.map((step, index) => (
                <Grid item xs={12} sm={6} key={step}>
                  <Box sx={{ p: 2.5, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.04)' }}>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Chip
                        label={String(index + 1).padStart(2, '0')}
                        sx={{ backgroundColor: '#7c4dff', color: 'white', borderRadius: 1 }}
                        size="small"
                      />
                      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                        {step}
                      </Typography>
                    </Stack>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        <Card
          elevation={0}
          sx={{
            backgroundColor: '#0f1c36',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
          }}
        >
          <CardContent>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'white', mb: 1 }}>
              Ready when you are
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.75)', mb: 3 }}>
              Drop us into your next planning session. We will map suppliers, SKUs, and approvals into one clear workspace.
            </Typography>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 3 }} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                variant="contained"
                size="large"
                sx={{ backgroundColor: '#00acc1', '&:hover': { backgroundColor: '#0097a7' }, minWidth: 200 }}
              >
                Schedule a walkthrough
              </Button>
              <Button
                variant="text"
                size="large"
                sx={{ color: 'white', minWidth: 200, textDecoration: 'underline' }}
              >
                See the implementation checklist
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add a product</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Product name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <TextField
              label="SKU"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              required
            />
            <TextField
              label="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
            <TextField
              label="Unit of measure"
              value={form.unitOfMeasure}
              onChange={(e) => setForm({ ...form, unitOfMeasure: e.target.value })}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Unit price"
                type="number"
                inputProps={{ step: '0.01' }}
                value={form.unitPrice}
                onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
                fullWidth
              />
              <TextField
                label="On-hand qty"
                type="number"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                fullWidth
              />
              <TextField
                label="Reorder level"
                type="number"
                value={form.reorderLevel}
                onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })}
                fullWidth
              />
              <TextField
                label="Safety stock"
                type="number"
                value={form.safetyStock}
                onChange={(e) => setForm({ ...form, safetyStock: e.target.value })}
                fullWidth
              />
              <TextField
                label="Lead time (days)"
                type="number"
                value={form.leadTimeDays}
                onChange={(e) => setForm({ ...form, leadTimeDays: e.target.value })}
                fullWidth
              />
            </Stack>
            {error && <Alert severity="error">{error}</Alert>}
            {submitted && <Alert severity="success">Product saved to Supply Chain API.</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : 'Save product'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SupplyChainPage;
