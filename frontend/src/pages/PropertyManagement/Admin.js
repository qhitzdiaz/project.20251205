import React, { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  Button,
} from '@mui/material';
import { API_URLS } from '../../config/apiConfig';

const currency = (val) => `₱${Number(val || 0).toLocaleString('en-PH', { maximumFractionDigits: 0 })}`;

const Admin = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === 'dark';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [admin, setAdmin] = useState({ cashflow: [] });
  const [transactions, setTransactions] = useState([]);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [dashRes, txnRes, invoiceRes] = await Promise.all([
          fetch(`${API_URLS.PROPERTY}/dashboard`),
          fetch(`${API_URLS.PROPERTY}/transactions`),
          fetch(`${API_URLS.PROPERTY}/invoices`).catch(() => null),
        ]);

        if (!dashRes.ok) throw new Error('Failed to load admin data');
        const dashJson = await dashRes.json();
        setAdmin(dashJson.admin || { cashflow: [] });

        if (txnRes.ok) {
          const txns = await txnRes.json();
          setTransactions(txns.slice(0, 8));
        }

        if (invoiceRes && invoiceRes.ok) {
          const inv = await invoiceRes.json();
          setInvoices(inv.slice(0, 8));
        }
      } catch (err) {
        setError('Unable to load admin data. Ensure the API is running.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
          ? 'linear-gradient(180deg, #0b1021 0%, #0f1a30 40%, #0e172b 100%)'
          : 'linear-gradient(180deg, #f5f7fa 0%, #e8ecf1 50%, #dce3eb 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ mb: 3 }}>
          <Chip
            label="Property Admin"
            sx={{
              mb: 2,
              backgroundColor: isDark ? 'rgba(0,150,136,0.2)' : 'rgba(0,150,136,0.15)',
              color: isDark ? '#80cbc4' : '#009688',
              fontWeight: 600,
            }}
          />
          <Typography variant="h4" sx={{ fontWeight: 800, color: isDark ? 'white' : theme.palette.text.primary }}>
            Admin & Cashflow
          </Typography>
          <Typography variant="body1" sx={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
            Track income, expenses, and monthly cash position for properties.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card elevation={isDark ? 0 : 2} sx={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'white' }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">Net Cash</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#009688' }}>{currency(admin.net_cash)}</Typography>
                <Typography variant="body2" color="text.secondary">Income minus expenses</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card elevation={isDark ? 0 : 2} sx={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'white' }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">Income</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#2e7d32' }}>{currency(admin.income_total)}</Typography>
                <Typography variant="body2" color="text.secondary">Total collected</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card elevation={isDark ? 0 : 2} sx={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'white' }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">Expenses</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#c62828' }}>{currency(admin.expense_total)}</Typography>
                <Typography variant="body2" color="text.secondary">Total spent</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>


        <Grid container spacing={3} sx={{ mt: 3 }}>
          <Grid item xs={12} md={6}>
            <Card elevation={isDark ? 0 : 1} sx={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'white' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Recent Transactions</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Latest income and expense entries.
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {transactions.length ? (
                  <List>
                    {transactions.map((t) => (
                      <ListItem key={t.id} disableGutters divider>
                        <ListItemText
                          primary={`${t.category || t.txn_type} • ${currency(t.amount)}`}
                          secondary={`${t.txn_date || '—'} • ${t.txn_type} ${t.property?.name ? '• ' + t.property.name : ''}`}
                        />
                        <Chip label={t.txn_type === 'income' ? 'Income' : 'Expense'} color={t.txn_type === 'income' ? 'success' : 'error'} size="small" />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">No transactions yet.</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card elevation={isDark ? 0 : 1} sx={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'white' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Admin Actions</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Jump to key admin endpoints.
                </Typography>
                <Grid container spacing={1}>
                  {[
                    { label: 'View Transactions', path: '/property/admin' },
                    { label: 'Properties', path: '/property/properties' },
                    { label: 'Tenants', path: '/property/tenants' },
                    { label: 'Leases', path: '/property/properties' },
                    { label: 'Maintenance', path: '/property/maintenance' },
                    { label: 'Expenses', path: '/property/expenses' },
                    { label: 'Staff', path: '/property/staff' },
                  ].map((action) => (
                    <Grid item xs={12} sm={6} key={action.label}>
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => navigate(action.path)}
                        sx={{
                          justifyContent: 'flex-start',
                          borderColor: isDark ? 'rgba(255,255,255,0.2)' : '#009688',
                          color: isDark ? 'white' : '#009688',
                          '&:hover': {
                            borderColor: '#009688',
                            backgroundColor: isDark ? 'rgba(0,150,136,0.15)' : 'rgba(0,150,136,0.08)',
                          },
                        }}
                      >
                        {action.label}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card
          elevation={isDark ? 0 : 1}
          sx={{ mt: 3, background: isDark ? 'rgba(255,255,255,0.03)' : 'white', border: isDark ? '1px solid rgba(255,255,255,0.08)' : 'none' }}
        >
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Invoices</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Issued and pending invoices for rent and expenses.
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {invoices.length ? (
              <List>
                {invoices.map((inv) => (
                  <ListItem key={inv.id} disableGutters divider>
                    <ListItemText
                      primary={`${inv.number || 'Invoice'} • ${currency(inv.amount)}`}
                      secondary={`${inv.status || 'pending'} • ${inv.due_date || 'No due date'}${inv.property?.name ? ' • ' + inv.property.name : ''}`}
                    />
                    <Chip label={inv.status || 'pending'} color={inv.status === 'paid' ? 'success' : inv.status === 'overdue' ? 'error' : 'warning'} size="small" />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">No invoices found. Connect billing to sync invoices.</Typography>
            )}
            <Box sx={{ textAlign: 'right', mt: 2 }}>
              <Button variant="contained" color="primary" onClick={() => navigate('/property/invoices')} sx={{ mr: 1 }}>
                Create Invoice
              </Button>
              <Button variant="text" onClick={() => navigate('/property/invoices')}>View All</Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Admin;
