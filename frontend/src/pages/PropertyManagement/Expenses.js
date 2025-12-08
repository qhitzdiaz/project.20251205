import React, { useEffect, useState, useCallback } from 'react';
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
  recorded: 'default',
  pending: 'warning',
  reimbursed: 'success',
};

const Expenses = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ status: '', property_id: '', lease_id: '' });
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [form, setForm] = useState({
    property_id: '',
    lease_id: '',
    maintenance_id: '',
    category: '',
    amount: '',
    expense_date: '',
    status: 'recorded',
    memo: '',
  });

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const url = new URL(`${API_URLS.PROPERTY}/expenses`);
      if (filters.status) url.searchParams.set('status', filters.status);
      if (filters.property_id) url.searchParams.set('property_id', filters.property_id);
      if (filters.lease_id) url.searchParams.set('lease_id', filters.lease_id);
      if (query) url.searchParams.set('q', query);
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('Failed to load expenses');
      const data = await res.json();
      setExpenses(data);
    } catch (err) {
      setError('Unable to load expenses. Ensure the API is running.');
    } finally {
      setLoading(false);
    }
  }, [filters, query]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        amount: Number(form.amount || 0),
        status: form.status || 'recorded',
      };

      if (form.property_id && form.property_id.trim()) payload.property_id = Number(form.property_id);
      if (form.lease_id && form.lease_id.trim()) payload.lease_id = Number(form.lease_id);
      if (form.maintenance_id && form.maintenance_id.trim()) payload.maintenance_id = Number(form.maintenance_id);
      if (form.category && form.category.trim()) payload.category = form.category.trim();
      if (form.expense_date && form.expense_date.trim()) payload.expense_date = form.expense_date;
      if (form.memo && form.memo.trim()) payload.memo = form.memo.trim();

      const res = await fetch(`${API_URLS.PROPERTY}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create expense');
      }

      setOpen(false);
      setForm({
        property_id: '',
        lease_id: '',
        maintenance_id: '',
        category: '',
        amount: '',
        expense_date: '',
        status: 'recorded',
        memo: '',
      });
      fetchExpenses();
    } catch (err) {
      setError(err.message || 'Unable to create expense. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleExpenseClick = (expense) => {
    setSelectedExpense(expense);
    setDetailOpen(true);
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedExpense) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URLS.PROPERTY}/expenses/${selectedExpense.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      fetchExpenses();
      setDetailOpen(false);
      setSelectedExpense(null);
    } catch (err) {
      setError('Unable to update expense status.');
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
        py: 6,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: isDark ? 'white' : theme.palette.text.primary }}>
              Expenses
            </Typography>
            <Typography variant="body1" sx={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
              Track operating and maintenance costs by property or lease.
            </Typography>
          </Box>
          <Button variant="contained" onClick={() => setOpen(true)}>Add Expense</Button>
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
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Status"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  size="small"
                >
                  <MenuItem value="">All</MenuItem>
                  {['recorded', 'pending', 'reimbursed'].map((s) => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Property ID"
                  value={filters.property_id}
                  onChange={(e) => setFilters({ ...filters, property_id: e.target.value })}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Lease ID"
                  value={filters.lease_id}
                  onChange={(e) => setFilters({ ...filters, lease_id: e.target.value })}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Search memo/category"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
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
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Expenses</Typography>
              <Divider sx={{ mb: 2 }} />
              {expenses.length ? (
                <List>
                  {expenses.map((exp) => (
                    <ListItem
                      key={exp.id}
                      divider
                      disableGutters
                      button
                      onClick={() => handleExpenseClick(exp)}
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
                        primary={`${exp.category || 'Expense'} • ${currency(exp.amount)} • ${exp.status || 'recorded'}`}
                        secondary={`${exp.expense_date || 'No date'} • Property ${exp.property_id || '-'}${exp.property?.name ? ' (' + exp.property.name + ')' : ''}${exp.lease_id ? ' • Lease ' + exp.lease_id : ''}${exp.maintenance_id ? ' • Maintenance ' + exp.maintenance_id : ''}${exp.memo ? ' • ' + exp.memo : ''}`}
                      />
                      <Chip
                        label={exp.status || 'recorded'}
                        color={statusColors[exp.status] || 'default'}
                        size="small"
                        sx={{ minWidth: 90, textTransform: 'capitalize' }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">No expenses found.</Typography>
              )}
            </CardContent>
          </Card>
        )}
      </Container>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Expense</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
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
                label="Category"
                fullWidth
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Expense Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={form.expense_date}
                onChange={(e) => setForm({ ...form, expense_date: e.target.value })}
                required
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
                {['recorded', 'pending', 'reimbursed'].map((s) => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Property ID"
                fullWidth
                value={form.property_id}
                onChange={(e) => setForm({ ...form, property_id: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Lease ID"
                fullWidth
                value={form.lease_id}
                onChange={(e) => setForm({ ...form, lease_id: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Maintenance ID"
                fullWidth
                value={form.maintenance_id}
                onChange={(e) => setForm({ ...form, maintenance_id: e.target.value })}
              />
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

      {/* Expense Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Expense Details</Typography>
            <Chip
              label={selectedExpense?.status || 'recorded'}
              color={statusColors[selectedExpense?.status] || 'default'}
              size="small"
              sx={{ textTransform: 'capitalize' }}
            />
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedExpense && (
            <Box sx={{ py: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Category</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedExpense.category || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Amount</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{currency(selectedExpense.amount)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Expense Date</Typography>
                  <Typography variant="body1">{selectedExpense.expense_date || 'Not set'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>{selectedExpense.status || 'recorded'}</Typography>
                </Grid>
                {selectedExpense.property && (
                  <>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="caption" color="text.secondary">Property</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedExpense.property.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{selectedExpense.property.address}, {selectedExpense.property.city}</Typography>
                    </Grid>
                  </>
                )}
                {selectedExpense.lease_id && (
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="caption" color="text.secondary">Lease ID</Typography>
                    <Typography variant="body2">{selectedExpense.lease_id}</Typography>
                  </Grid>
                )}
                {selectedExpense.maintenance_id && (
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="caption" color="text.secondary">Maintenance ID</Typography>
                    <Typography variant="body2">{selectedExpense.maintenance_id}</Typography>
                  </Grid>
                )}
                {selectedExpense.memo && (
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="caption" color="text.secondary">Memo</Typography>
                    <Typography variant="body2">{selectedExpense.memo}</Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Close</Button>
          {selectedExpense?.status !== 'reimbursed' && (
            <Button
              variant="contained"
              color="success"
              onClick={() => handleUpdateStatus('reimbursed')}
              disabled={saving}
            >
              {saving ? 'Updating...' : 'Mark as Reimbursed'}
            </Button>
          )}
          {selectedExpense?.status === 'recorded' && (
            <Button
              variant="outlined"
              onClick={() => handleUpdateStatus('pending')}
              disabled={saving}
            >
              Mark as Pending
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Expenses;
