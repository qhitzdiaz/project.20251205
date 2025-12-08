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
  ButtonGroup,
} from '@mui/material';
import { Description as ContractIcon } from '@mui/icons-material';
import { API_URLS } from '../../config/apiConfig';
import ContractTemplate from './ContractTemplate';

const statusColors = {
  active: 'success',
  pending: 'warning',
  expired: 'error',
  terminated: 'default',
};

const Contracts = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [contractTemplateOpen, setContractTemplateOpen] = useState(false);
  const [contractType, setContractType] = useState('lease'); // 'lease' or 'property_management'
  const [saving, setSaving] = useState(false);

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const url = new URL(`${API_URLS.PROPERTY}/contracts`);
      if (filterStatus) url.searchParams.set('status', filterStatus);
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('Failed to load contracts');
      const data = await res.json();
      setContracts(data);
    } catch (err) {
      setError('Unable to load contracts. Ensure the API is running.');
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const handleContractClick = (contract) => {
    setSelectedContract(contract);
    setDetailOpen(true);
  };

  const handlePrint = (contract) => {
    if (!contract) return;

    const lessorName = contract.signed_by || '[LESSOR NAME]';
    const lessorAddress = contract.description || '[LESSOR ADDRESS]';
    const lesseeName = contract.party_name || '[LESSEE NAME]';
    const lesseeAddress = contract.party_email || '[LESSEE ADDRESS]';
    const unit = contract.contract_number || '[UNIT]';
    const propertyAddress = contract.payment_terms || '[PROPERTY ADDRESS]';
    const city = contract.renewal_terms || '[CITY]';
    const startDate = contract.start_date || '[START DATE]';
    const endDate = contract.end_date || '[END DATE]';
    const monthlyRent = Number(contract.value || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 });
    const securityDeposit = Number(contract.value || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 });
    const advanceMonths = contract.termination_notice_days || '[NUMBER]';
    const executionDate = contract.signed_at || '[DATE]';
    const executionPlace = 'Philippines';

    const html = `
      <html>
        <head>
          <title>Lease Contract</title>
          <style>
            body { font-family: 'Times New Roman', serif; line-height: 1.6; padding: 40px; color: #111; }
            h1, h2 { text-align: center; margin: 0 0 10px; }
            h1 { font-size: 20px; letter-spacing: 0.5px; }
            h2 { font-size: 14px; font-weight: 600; }
            .section-title { font-weight: 700; margin: 18px 0 8px; text-transform: uppercase; }
            p { text-align: justify; margin: 10px 0; }
            .article { margin: 14px 0; }
            .signature-block { margin-top: 40px; display: flex; gap: 40px; }
            .sig { flex: 1; text-align: center; }
            .sig .name { margin-top: 40px; font-weight: 700; border-top: 1px solid #000; padding-top: 6px; display: inline-block; min-width: 180px; }
            .witnesses { margin-top: 40px; }
            .witnesses .name { margin-top: 20px; font-weight: 700; border-top: 1px solid #000; padding-top: 6px; display: inline-block; min-width: 180px; }
            .metadata { margin-bottom: 20px; text-align: center; }
          </style>
        </head>
        <body>
          <h1>LEASE CONTRACT</h1>
          <h2>(Compliant with Philippine Law - Civil Code & RA 9653)</h2>
          <div class="metadata"><strong>Contract #</strong> ${contract.contract_number || 'N/A'} • <strong>Status</strong> ${contract.status || 'pending'}</div>

          <p><strong>KNOW ALL MEN BY THESE PRESENTS:</strong></p>
          <p>This LEASE CONTRACT is entered into by and between:</p>
          <p><strong>${lessorName}</strong>, of legal age, Filipino citizen, with address at ${lessorAddress}, hereinafter referred to as the <strong>LESSOR</strong>;</p>
          <p><strong>${lesseeName}</strong>, of legal age, Filipino citizen, with address at ${lesseeAddress}, hereinafter referred to as the <strong>LESSEE</strong>;</p>
          <p><strong>WITNESSETH:</strong> That</p>

          <div class="article">
            <div class="section-title">ARTICLE I - PREMISES</div>
            <p>The LESSOR hereby leases to the LESSEE the premises located at Unit ${unit}, ${propertyAddress}, ${city}, Metro Manila, Philippines, hereinafter referred to as the <strong>LEASED PREMISES</strong>.</p>
          </div>

          <div class="article">
            <div class="section-title">ARTICLE II - TERM OF LEASE</div>
            <p>The term of this lease shall be for a period of 12 (12) months, commencing on ${startDate} and ending on ${endDate}, unless sooner terminated as herein provided.</p>
          </div>

          <div class="article">
            <div class="section-title">ARTICLE III - RENTAL AND PAYMENT TERMS</div>
            <p>3.1. The monthly rental for the LEASED PREMISES is <strong>₱${monthlyRent}</strong> (Philippine Pesos), payable on or before the 5th day of each month.</p>
            <p>3.2. The LESSEE shall pay a security deposit of <strong>₱${securityDeposit}</strong> to guarantee the faithful performance of all obligations under this Contract.</p>
            <p>3.3. Advance rental payment of ${advanceMonths} month(s) amounting to <strong>₱${monthlyRent}</strong> shall be paid upon signing of this Contract.</p>
          </div>

          <div class="article">
            <div class="section-title">ARTICLE IV - USE OF PREMISES</div>
            <p>4.1. The LEASED PREMISES shall be used exclusively for residential purposes and shall not be used for any illegal, immoral, or nuisance-creating activities.</p>
            <p>4.2. The LESSEE shall not sublet the LEASED PREMISES or any portion thereof without the prior written consent of the LESSOR.</p>
          </div>

          <div class="article">
            <div class="section-title">ARTICLE V - MAINTENANCE AND REPAIRS</div>
            <p>5.1. The LESSEE shall maintain the LEASED PREMISES in good, clean, and tenantable condition at all times.</p>
            <p>5.2. Major repairs and maintenance affecting the structural integrity of the premises shall be the responsibility of the LESSOR.</p>
            <p>5.3. Minor repairs and ordinary wear and tear shall be the responsibility of the LESSEE.</p>
          </div>

          <div class="article">
            <div class="section-title">ARTICLE VI - UTILITIES AND SERVICES</div>
            <p>The LESSEE shall be responsible for the payment of all utilities including but not limited to electricity, water, internet, and other services consumed in the LEASED PREMISES during the term of this Contract.</p>
          </div>

          <div class="article">
            <div class="section-title">ARTICLE VII - TERMINATION</div>
            <p>7.1. This Contract may be terminated by either party upon thirty (30) days prior written notice to the other party.</p>
            <p>7.2. The LESSOR may terminate this Contract immediately for just causes including but not limited to: non-payment of rent, violation of any terms herein, illegal use of premises, or conduct causing nuisance.</p>
          </div>

          <div class="article">
            <div class="section-title">ARTICLE VIII - RETURN OF SECURITY DEPOSIT</div>
            <p>Upon termination of this Contract and surrender of the premises in good condition, normal wear and tear excepted, the security deposit shall be returned to the LESSEE within thirty (30) days, less any deductions for unpaid rent or damages.</p>
          </div>

          <div class="article">
            <div class="section-title">ARTICLE IX - GOVERNING LAW</div>
            <p>This Contract shall be governed by and construed in accordance with the laws of the Republic of the Philippines, particularly the Civil Code of the Philippines (Republic Act No. 386) and the Rent Control Act of 2009 (Republic Act No. 9653).</p>
          </div>

          <p><strong>IN WITNESS WHEREOF</strong>, the parties have hereunto set their hands this ${executionDate} at ${executionPlace}.</p>

          <div class="signature-block">
            <div class="sig">
              <div class="name">${lessorName}</div>
              <div>LESSOR</div>
            </div>
            <div class="sig">
              <div class="name">${lesseeName}</div>
              <div>LESSEE</div>
            </div>
          </div>

          <div class="witnesses">
            <div class="name">Witness #1</div><br/>
            <div class="name">Witness #2</div>
          </div>
        </body>
      </html>
    `;

    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 250);
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedContract) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URLS.PROPERTY}/contracts/${selectedContract.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      fetchContracts();
      setDetailOpen(false);
      setSelectedContract(null);
    } catch (err) {
      setError('Unable to update contract status.');
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
              Contracts
            </Typography>
            <Typography variant="body1" sx={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
              Manage service contracts, vendor agreements, and leases.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <ButtonGroup variant="contained">
              <Button
                startIcon={<ContractIcon />}
                onClick={() => {
                  setContractType('lease');
                  setContractTemplateOpen(true);
                }}
              >
                Generate Lease Contract
              </Button>
              <Button
                startIcon={<ContractIcon />}
                onClick={() => {
                  setContractType('property_management');
                  setContractTemplateOpen(true);
                }}
              >
                Property Management Agreement
              </Button>
            </ButtonGroup>
          </Box>
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
                  {['active', 'pending', 'expired', 'terminated'].map((s) => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </TextField>
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
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Contracts</Typography>
              <Divider sx={{ mb: 2 }} />
              {contracts.length ? (
                <List>
                  {contracts.map((contract) => (
                    <ListItem
                      key={contract.id}
                      divider
                      disableGutters
                      button
                      onClick={() => handleContractClick(contract)}
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
                        primary={`${contract.contract_type || 'Contract'} • ${contract.party_name || 'N/A'}`}
                        secondary={`${contract.start_date || 'No start'} to ${contract.end_date || 'No end'} • PHP ${Number(contract.value || 0).toLocaleString('en-PH')}`}
                      />
                      <Chip
                        label={contract.status || 'pending'}
                        color={statusColors[contract.status] || 'default'}
                        size="small"
                        sx={{ minWidth: 80, textTransform: 'capitalize' }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">No contracts found.</Typography>
              )}
            </CardContent>
          </Card>
        )}
      </Container>

      {/* Contract Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Contract Details</Typography>
            <Chip
              label={selectedContract?.status || 'pending'}
              color={statusColors[selectedContract?.status] || 'default'}
              size="small"
              sx={{ textTransform: 'capitalize' }}
            />
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedContract && (
            <Box sx={{ py: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Contract #</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedContract.contract_number || '—'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Contract Type</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedContract.contract_type || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Party Name</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedContract.party_name || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Party Email</Typography>
                  <Typography variant="body1">{selectedContract.party_email || '—'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Party Phone</Typography>
                  <Typography variant="body1">{selectedContract.party_phone || '—'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Start Date</Typography>
                  <Typography variant="body1">{selectedContract.start_date || 'Not set'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">End Date</Typography>
                  <Typography variant="body1">{selectedContract.end_date || 'Not set'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Value</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>PHP {Number(selectedContract.value || 0).toLocaleString('en-PH')}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Payment Terms</Typography>
                  <Typography variant="body2">{selectedContract.payment_terms || '—'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Renewal Terms</Typography>
                  <Typography variant="body2">{selectedContract.renewal_terms || '—'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Termination Notice</Typography>
                  <Typography variant="body2">{selectedContract.termination_notice_days || 0} days</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Auto Renew</Typography>
                  <Typography variant="body2">{selectedContract.auto_renew ? 'Yes' : 'No'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Signed At</Typography>
                  <Typography variant="body2">{selectedContract.signed_at || '—'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Signed By</Typography>
                  <Typography variant="body2">{selectedContract.signed_by || '—'}</Typography>
                </Grid>
                {selectedContract.description && (
                  <>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="caption" color="text.secondary">Description</Typography>
                      <Typography variant="body2">{selectedContract.description}</Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Close</Button>
          <Button onClick={() => handlePrint(selectedContract)} variant="outlined">
            Print
          </Button>
          {selectedContract?.status === 'active' && (
            <Button
              variant="outlined"
              color="error"
              onClick={() => handleUpdateStatus('terminated')}
              disabled={saving}
            >
              {saving ? 'Updating...' : 'Terminate'}
            </Button>
          )}
          {selectedContract?.status === 'pending' && (
            <Button
              variant="contained"
              color="success"
              onClick={() => handleUpdateStatus('active')}
              disabled={saving}
            >
              {saving ? 'Updating...' : 'Activate'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Contract Template Generator */}
      <ContractTemplate
        open={contractTemplateOpen}
        onClose={() => setContractTemplateOpen(false)}
        contractType={contractType}
      />
    </Box>
  );
};

export default Contracts;
