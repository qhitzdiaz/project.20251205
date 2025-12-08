import React, { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
} from '@mui/material';
import { API_URLS } from '../../config/apiConfig';

const currency = (val) => `₱${Number(val || 0).toLocaleString('en-PH', { maximumFractionDigits: 0 })}`;
const statusColors = {
  paid: 'success',
  sent: 'info',
  pending: 'warning',
  overdue: 'error',
  void: 'default',
};

const Invoices = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [query, setQuery] = useState('');
  const [filterProperty, setFilterProperty] = useState('');
  const [filterLease, setFilterLease] = useState('');
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [form, setForm] = useState({
    number: '',
    property_id: '',
    lease_id: '',
    amount: '',
    status: 'pending',
    due_date: '',
    memo: '',
  });

  const fetchInvoices = async () => {
    setLoading(true);
    setError('');
    try {
      const url = new URL(`${API_URLS.PROPERTY}/invoices`);
      if (filterStatus) url.searchParams.set('status', filterStatus);
      if (query) url.searchParams.set('q', query);
      if (filterProperty) url.searchParams.set('property_id', filterProperty);
      if (filterLease) url.searchParams.set('lease_id', filterLease);
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('Failed to load invoices');
      const data = await res.json();
      setInvoices(data);
    } catch (err) {
      setError('Unable to load invoices. Ensure the API is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [filterStatus, query, filterProperty, filterLease]);

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    try {
      // Build the payload, omitting empty strings for optional fields
      const payload = {
        amount: Number(form.amount || 0),
        status: form.status || 'pending',
      };

      // Only include optional fields if they have values
      if (form.number && form.number.trim()) payload.number = form.number.trim();
      if (form.property_id && form.property_id.trim()) payload.property_id = Number(form.property_id);
      if (form.lease_id && form.lease_id.trim()) payload.lease_id = Number(form.lease_id);
      if (form.due_date && form.due_date.trim()) payload.due_date = form.due_date;
      if (form.memo && form.memo.trim()) payload.memo = form.memo.trim();

      const res = await fetch(`${API_URLS.PROPERTY}/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create invoice');
      }

      setOpen(false);
      setForm({
        number: '',
        property_id: '',
        lease_id: '',
        amount: '',
        status: 'pending',
        due_date: '',
        memo: '',
      });
      fetchInvoices();
    } catch (err) {
      setError(err.message || 'Unable to create invoice. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleInvoiceClick = (invoice) => {
    setSelectedInvoice(invoice);
    setDetailOpen(true);
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedInvoice) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URLS.PROPERTY}/invoices/${selectedInvoice.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      fetchInvoices();
      setDetailOpen(false);
      setSelectedInvoice(null);
    } catch (err) {
      setError('Unable to update invoice status.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: isDark
          ? 'linear-gradient(180deg, #0b1021 0%, #0f1a30 40%, #0e172b 100%)'
          : 'linear-gradient(180deg, #f5f7fa 0%, #e8ecf1 50%, #dce3eb 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: isDark ? 'white' : theme.palette.text.primary }}>
              Invoices
            </Typography>
            <Typography variant="body1" sx={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
              Manage rent and expense invoices.
            </Typography>
          </Box>
          <Button variant="contained" onClick={() => setOpen(true)}>Create Invoice</Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Card
          elevation={isDark ? 0 : 1}
          sx={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'white', border: isDark ? '1px solid rgba(255,255,255,0.08)' : 'none', mb: 3 }}
        >
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  select
                  fullWidth
                  label="Filter by status"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  size="small"
                >
                  <MenuItem value="">All</MenuItem>
                  {['pending', 'sent', 'paid', 'overdue', 'void'].map((s) => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Search invoice # / memo"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Filter by property ID"
                  value={filterProperty}
                  onChange={(e) => setFilterProperty(e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Filter by lease ID"
                  value={filterLease}
                  onChange={(e) => setFilterLease(e.target.value)}
                  size="small"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Card
            elevation={isDark ? 0 : 1}
            sx={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'white', border: isDark ? '1px solid rgba(255,255,255,0.08)' : 'none' }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Invoices</Typography>
              <Divider sx={{ mb: 2 }} />
              {invoices.length ? (
                <List>
                  {invoices.map((inv) => (
                    <ListItem
                      key={inv.id}
                      divider
                      disableGutters
                      button
                      onClick={() => handleInvoiceClick(inv)}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                        },
                        transition: 'background-color 0.2s',
                        py: 1.5,
                      }}
                    >
                      <ListItemText
                        primary={`${inv.number || 'Invoice'} • ${currency(inv.amount)} • ${inv.status || 'pending'}`}
                        secondary={`${inv.due_date || 'No due date'} • Property ${inv.property_id || '-'}${inv.property?.name ? ' (' + inv.property.name + ')' : ''}${inv.property?.address ? ' • ' + inv.property.address : ''}${inv.lease_id ? ' • Lease ' + inv.lease_id : ''}`}
                      />
                      <Chip
                        label={inv.status || 'pending'}
                        color={statusColors[inv.status] || 'default'}
                        size="small"
                        sx={{ minWidth: 80, textTransform: 'capitalize' }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">No invoices found.</Typography>
              )}
            </CardContent>
          </Card>
        )}
      </Container>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create Invoice</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Invoice Number"
                fullWidth
                value={form.number}
                onChange={(e) => setForm({ ...form, number: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Amount"
                type="number"
                fullWidth
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Property ID (optional)"
                fullWidth
                value={form.property_id}
                onChange={(e) => setForm({ ...form, property_id: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Lease ID (optional)"
                fullWidth
                value={form.lease_id}
                onChange={(e) => setForm({ ...form, lease_id: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Due Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Status"
                fullWidth
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {['pending', 'sent', 'paid', 'overdue', 'void'].map((s) => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Memo"
                fullWidth
                multiline
                minRows={2}
                value={form.memo}
                onChange={(e) => setForm({ ...form, memo: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </DialogActions>
      </Dialog>

      {/* Invoice Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Invoice Details</Typography>
            <Chip
              label={selectedInvoice?.status || 'pending'}
              color={statusColors[selectedInvoice?.status] || 'default'}
              size="small"
              sx={{ textTransform: 'capitalize' }}
            />
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedInvoice && (
            <Box sx={{ py: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Invoice Number</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedInvoice.number || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Amount</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{currency(selectedInvoice.amount)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Due Date</Typography>
                  <Typography variant="body1">{selectedInvoice.due_date || 'Not set'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Issue Date</Typography>
                  <Typography variant="body1">{selectedInvoice.issue_date || 'Not set'}</Typography>
                </Grid>
                {selectedInvoice.property && (
                  <>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="caption" color="text.secondary">Property</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedInvoice.property.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{selectedInvoice.property.address}, {selectedInvoice.property.city}</Typography>
                    </Grid>
                  </>
                )}
                {selectedInvoice.lease && (
                  <>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="caption" color="text.secondary">Lease Information</Typography>
                      <Typography variant="body2">Unit: {selectedInvoice.lease.unit}</Typography>
                      <Typography variant="body2">Tenant: {selectedInvoice.lease.tenant?.full_name || 'N/A'}</Typography>
                      <Typography variant="body2">Rent: {currency(selectedInvoice.lease.rent)}/month</Typography>
                    </Grid>
                  </>
                )}
                {selectedInvoice.memo && (
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="caption" color="text.secondary">Memo</Typography>
                    <Typography variant="body2">{selectedInvoice.memo}</Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Close</Button>
          {selectedInvoice?.status !== 'paid' && (
            <Button
              variant="contained"
              color="success"
              onClick={() => handleUpdateStatus('paid')}
              disabled={saving}
            >
              {saving ? 'Updating...' : 'Mark as Paid'}
            </Button>
          )}
          {selectedInvoice?.status === 'pending' && (
            <Button
              variant="outlined"
              onClick={() => handleUpdateStatus('sent')}
              disabled={saving}
            >
              Mark as Sent
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Invoices;
