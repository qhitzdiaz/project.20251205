import React, { useRef, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import { Print as PrintIcon, PictureAsPdf as PdfIcon, Close as CloseIcon } from '@mui/icons-material';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { API_URLS } from '../../config/apiConfig';

const ContractTemplate = ({ open, onClose, contractType = 'lease', propertyData, tenantData }) => {
  const contractRef = useRef(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [contractData, setContractData] = useState({
    // Lessor (Property Owner) Information
    lessorName: '',
    lessorAddress: '',
    lessorCitizenship: 'Filipino',

    // Lessee (Tenant) Information
    lesseeName: tenantData?.full_name || '',
    lesseeAddress: '',
    lesseeCitizenship: 'Filipino',

    // For Property Management Service Contract
    clientName: '', // Property owner who wants management services
    clientAddress: '',
    clientCitizenship: 'Filipino',
    managerName: '', // Property management company
    managerAddress: '',
    managerBusinessName: '',
    managerTIN: '',
    managementFeePercentage: '10',
    managementFeeFixed: '',

    // Property Information
    propertyAddress: propertyData?.address || '',
    propertyCity: propertyData?.city || '',
    propertyProvince: propertyData?.province || 'Metro Manila',
    unitNumber: '',
    propertyType: 'Residential',
    propertyDescription: '',

    // Lease Terms
    monthlyRent: '',
    securityDeposit: '',
    advanceRent: '',
    leaseStartDate: '',
    leaseEndDate: '',
    leaseDuration: '12',
    serviceDuration: '12',

    // Utilities
    utilitiesIncluded: [],

    // Special Provisions
    specialProvisions: '',

    // Date and Place of Execution
    executionDate: new Date().toISOString().split('T')[0],
    executionPlace: 'Philippines',
  });

  const buildSummaryDescription = () => {
    if (contractType === 'property_management') {
      return [
        `Owner: ${contractData.clientName || '[PROPERTY OWNER]'}`,
        `Manager: ${contractData.managerBusinessName || contractData.managerName || '[PROPERTY MANAGER]'}`,
        `Property: ${contractData.propertyAddress || '[PROPERTY ADDRESS]'}, ${contractData.propertyCity || '[CITY]'}, ${contractData.propertyProvince || '[PROVINCE]'}`,
        `Service term: ${contractData.serviceDuration || 12} months (${contractData.leaseStartDate || '[START DATE]'} to ${contractData.leaseEndDate || '[END DATE]'})`,
        `Fee: ${contractData.managementFeePercentage ? `${contractData.managementFeePercentage}%` : ''}${contractData.managementFeeFixed ? ` / ₱${Number(contractData.managementFeeFixed || 0).toLocaleString('en-PH')}` : ''}`
      ].join(' | ');
    }

    return [
      `Lessor: ${contractData.lessorName || '[LESSOR NAME]'} (${contractData.lessorAddress || '[LESSOR ADDRESS]'})`,
      `Lessee: ${contractData.lesseeName || '[LESSEE NAME]'} (${contractData.lesseeAddress || '[LESSEE ADDRESS]'})`,
      `Premises: Unit ${contractData.unitNumber || '[UNIT]'}, ${contractData.propertyAddress || '[PROPERTY ADDRESS]'}, ${contractData.propertyCity || '[CITY]'}, ${contractData.propertyProvince || '[PROVINCE]'}`,
      `Term: ${contractData.leaseDuration || 12} months (${contractData.leaseStartDate || '[START DATE]'} to ${contractData.leaseEndDate || '[END DATE]'})`,
      `Rent: ₱${Number(contractData.monthlyRent || 0).toLocaleString('en-PH')}, Deposit: ₱${Number(contractData.securityDeposit || 0).toLocaleString('en-PH')}, Advance: ${contractData.advanceRent || 0} month(s)`
    ].join(' | ');
  };

  const handleGeneratePDF = async () => {
    setGenerating(true);
    try {
      const element = contractRef.current;

      // Capture the contract as canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

      const baseName =
        contractType === 'property_management'
          ? `Property_Management_Agreement_${(contractData.managerBusinessName || 'Agreement').replace(/\s+/g, '_')}`
          : `Lease_Contract_${(contractData.lesseeName || 'Contract').replace(/\s+/g, '_')}`;
      const fileName = `${baseName}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      alert('PDF generated successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    setSaveError('');
    try {
      const requiredLeaseFields = [
        { key: 'lessorName', label: 'Lessor Full Name' },
        { key: 'lessorAddress', label: 'Lessor Address' },
        { key: 'lesseeName', label: 'Lessee Full Name' },
        { key: 'lesseeAddress', label: 'Lessee Address' },
        { key: 'unitNumber', label: 'Unit Number' },
        { key: 'propertyAddress', label: 'Property Address' },
        { key: 'propertyCity', label: 'Property City' },
        { key: 'leaseStartDate', label: 'Start Date' },
        { key: 'leaseEndDate', label: 'End Date' },
        { key: 'monthlyRent', label: 'Monthly Rent' },
      ];

      const requiredPMAFields = [
        { key: 'clientName', label: 'Owner Name' },
        { key: 'clientAddress', label: 'Owner Address' },
        { key: 'managerName', label: 'Manager Name' },
        { key: 'managerAddress', label: 'Manager Address' },
        { key: 'propertyAddress', label: 'Property Address' },
        { key: 'propertyCity', label: 'Property City' },
        { key: 'leaseStartDate', label: 'Start Date' },
        { key: 'leaseEndDate', label: 'End Date' },
      ];

      const missing = [];
      if (contractType === 'property_management') {
        requiredPMAFields.forEach(({ key, label }) => {
          if (!contractData[key]) missing.push(label);
        });
      } else {
        requiredLeaseFields.forEach(({ key, label }) => {
          if (!contractData[key]) missing.push(label);
        });
      }

      if (missing.length) {
        setSaveError(`Please fill all required fields: ${missing.join(', ')}`);
        return;
      }

      setSaving(true);
      const payload = {
        contract_type: contractType === 'property_management' ? 'property_management' : 'lease',
        contract_number: contractType === 'property_management'
          ? `PM-${(contractData.clientName || 'CLIENT').replace(/\s+/g, '').slice(0, 6).toUpperCase()}-${new Date().toISOString().slice(0, 10)}`
          : `LEASE-${(contractData.lesseeName || 'TENANT').replace(/\s+/g, '').slice(0, 6).toUpperCase()}-${new Date().toISOString().slice(0, 10)}`,
        party_name: contractType === 'property_management'
          ? contractData.clientName || ''
          : contractData.lesseeName || '',
        party_email: contractType === 'property_management' ? contractData.clientAddress || null : contractData.lesseeAddress || null,
        party_phone: contractType === 'property_management' ? contractData.managerPhone || null : contractData.managerPhone || null,
        start_date: contractData.leaseStartDate || null,
        end_date: contractData.leaseEndDate || null,
        value: contractData.monthlyRent ? Number(contractData.monthlyRent) : 0,
        status: 'active',
        description: buildSummaryDescription(),
        payment_terms: contractType === 'property_management'
          ? `Management fee: ${contractData.managementFeePercentage ? `${contractData.managementFeePercentage}%` : ''}${contractData.managementFeeFixed ? ` or ₱${Number(contractData.managementFeeFixed).toLocaleString('en-PH')}` : ''}`
          : `Monthly rent ₱${Number(contractData.monthlyRent || 0).toLocaleString('en-PH')}`,
        renewal_terms: contractType === 'property_management'
          ? `Service duration ${contractData.serviceDuration || 12} months`
          : `Lease duration ${contractData.leaseDuration || 12} months`,
        termination_notice_days: 30,
        auto_renew: false,
        signed_at: contractData.executionDate || null,
        signed_by: contractType === 'property_management'
          ? contractData.managerName || ''
          : contractData.lessorName || '',
      };

      const res = await fetch(`${API_URLS.PROPERTY}/contracts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to save contract');
      }
      onClose();
    } catch (err) {
      setSaveError(err.message || 'Unable to save contract');
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const content = contractRef.current.innerHTML;

    printWindow.document.write(`
      <html>
        <head>
          <title>Lease Contract - ${contractData.lesseeName}</title>
          <style>
            body {
              font-family: 'Times New Roman', serif;
              line-height: 1.8;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
            }
            h1 { text-align: center; font-size: 18px; margin-bottom: 30px; }
            h2 { font-size: 14px; margin-top: 20px; }
            p { text-indent: 40px; text-align: justify; margin: 10px 0; }
            .header { text-align: center; margin-bottom: 30px; }
            .signature-section { margin-top: 60px; }
            .signature-line {
              border-top: 1px solid #000;
              width: 300px;
              margin: 40px auto 5px;
            }
            .clause { margin: 15px 0; }
            @media print {
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {contractType === 'property_management' ? 'Property Management Agreement Generator' : 'Philippine Lease Contract Generator'}
          </Typography>
          <Button onClick={onClose} color="inherit" size="small">
            <CloseIcon />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 3 }}>
          This contract template complies with Philippine laws including the Civil Code of the Philippines (Republic Act No. 386)
          and the Rent Control Act of 2009 (Republic Act No. 9653).
        </Alert>
        {saveError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {saveError}
          </Alert>
        )}

        {/* Contract Data Form */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Contract Information</Typography>
          <Grid container spacing={2}>
            {/* Lessor Information */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Lessor (Property Owner)</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Lessor Full Name"
                value={contractData.lessorName}
                onChange={(e) => setContractData({ ...contractData, lessorName: e.target.value })}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Lessor Citizenship"
                value={contractData.lessorCitizenship}
                onChange={(e) => setContractData({ ...contractData, lessorCitizenship: e.target.value })}
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Lessor Address"
                value={contractData.lessorAddress}
                onChange={(e) => setContractData({ ...contractData, lessorAddress: e.target.value })}
                size="small"
              />
            </Grid>

            {/* Lessee Information */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Lessee (Tenant)</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Lessee Full Name"
                value={contractData.lesseeName}
                onChange={(e) => setContractData({ ...contractData, lesseeName: e.target.value })}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Lessee Citizenship"
                value={contractData.lesseeCitizenship}
                onChange={(e) => setContractData({ ...contractData, lesseeCitizenship: e.target.value })}
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Lessee Address"
                value={contractData.lesseeAddress}
                onChange={(e) => setContractData({ ...contractData, lesseeAddress: e.target.value })}
                size="small"
              />
            </Grid>

            {/* Property Information */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Property Details</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Unit Number"
                value={contractData.unitNumber}
                onChange={(e) => setContractData({ ...contractData, unitNumber: e.target.value })}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Property Address"
                value={contractData.propertyAddress}
                onChange={(e) => setContractData({ ...contractData, propertyAddress: e.target.value })}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                value={contractData.propertyCity}
                onChange={(e) => setContractData({ ...contractData, propertyCity: e.target.value })}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Province"
                value={contractData.propertyProvince}
                onChange={(e) => setContractData({ ...contractData, propertyProvince: e.target.value })}
                size="small"
              />
            </Grid>

            {/* Financial Terms */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Financial Terms</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Monthly Rent (₱)"
                type="number"
                value={contractData.monthlyRent}
                onChange={(e) => setContractData({ ...contractData, monthlyRent: e.target.value })}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Security Deposit (₱)"
                type="number"
                value={contractData.securityDeposit}
                onChange={(e) => setContractData({ ...contractData, securityDeposit: e.target.value })}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Advance Rent (months)"
                type="number"
                value={contractData.advanceRent}
                onChange={(e) => setContractData({ ...contractData, advanceRent: e.target.value })}
                size="small"
              />
            </Grid>

            {/* Lease Duration */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Lease Period</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={contractData.leaseStartDate}
                onChange={(e) => setContractData({ ...contractData, leaseStartDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={contractData.leaseEndDate}
                onChange={(e) => setContractData({ ...contractData, leaseEndDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                select
                label="Duration (months)"
                value={contractData.leaseDuration}
                onChange={(e) => setContractData({ ...contractData, leaseDuration: e.target.value })}
                size="small"
              >
                <MenuItem value="6">6 months</MenuItem>
                <MenuItem value="12">12 months</MenuItem>
                <MenuItem value="24">24 months</MenuItem>
                <MenuItem value="36">36 months</MenuItem>
              </TextField>
            </Grid>

            {/* Special Provisions */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Special Provisions / Additional Terms"
                multiline
                rows={3}
                value={contractData.specialProvisions}
                onChange={(e) => setContractData({ ...contractData, specialProvisions: e.target.value })}
                placeholder="Enter any special provisions or additional terms here..."
                size="small"
              />
            </Grid>
          </Grid>
        </Box>

        {/* Contract Preview */}
        <Box
          ref={contractRef}
          sx={{
            backgroundColor: '#ffffff',
            color: '#000000',
            padding: '40px',
            fontFamily: '"Times New Roman", serif',
            lineHeight: 1.8,
            fontSize: '12pt',
          }}
        >
          <Typography variant="h5" sx={{ textAlign: 'center', fontWeight: 'bold', mb: 4, fontFamily: '"Times New Roman", serif' }}>
            LEASE CONTRACT
          </Typography>

          <Typography sx={{ textAlign: 'center', mb: 3, fontFamily: '"Times New Roman", serif' }}>
            (Compliant with Philippine Law - Civil Code & RA 9653)
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography paragraph sx={{ textIndent: '40px', textAlign: 'justify', fontFamily: '"Times New Roman", serif' }}>
              KNOW ALL MEN BY THESE PRESENTS:
            </Typography>

            <Typography paragraph sx={{ textIndent: '40px', textAlign: 'justify', fontFamily: '"Times New Roman", serif' }}>
              This LEASE CONTRACT is entered into by and between:
            </Typography>

            <Typography paragraph sx={{ textIndent: '40px', textAlign: 'justify', fontFamily: '"Times New Roman", serif' }}>
              <strong>{contractData.lessorName || '[LESSOR NAME]'}</strong>, of legal age, {contractData.lessorCitizenship} citizen,
              with address at {contractData.lessorAddress || '[LESSOR ADDRESS]'}, hereinafter referred to as the <strong>LESSOR</strong>;
            </Typography>

            <Typography paragraph sx={{ textAlign: 'center', fontFamily: '"Times New Roman", serif' }}>
              -and-
            </Typography>

            <Typography paragraph sx={{ textIndent: '40px', textAlign: 'justify', fontFamily: '"Times New Roman", serif' }}>
              <strong>{contractData.lesseeName || '[LESSEE NAME]'}</strong>, of legal age, {contractData.lesseeCitizenship} citizen,
              with address at {contractData.lesseeAddress || '[LESSEE ADDRESS]'}, hereinafter referred to as the <strong>LESSEE</strong>;
            </Typography>

            <Typography paragraph sx={{ textAlign: 'center', fontWeight: 'bold', mt: 3, mb: 2, fontFamily: '"Times New Roman", serif' }}>
              WITNESSETH: That
            </Typography>

            {/* Article I */}
            <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 3, mb: 1, fontFamily: '"Times New Roman", serif', fontSize: '13pt' }}>
              ARTICLE I - PREMISES
            </Typography>
            <Typography paragraph sx={{ textIndent: '40px', textAlign: 'justify', fontFamily: '"Times New Roman", serif' }}>
              The LESSOR hereby leases to the LESSEE the premises located at Unit {contractData.unitNumber || '[UNIT]'},
              {contractData.propertyAddress || '[PROPERTY ADDRESS]'}, {contractData.propertyCity || '[CITY]'},
              {contractData.propertyProvince || '[PROVINCE]'}, Philippines, hereinafter referred to as the <strong>LEASED PREMISES</strong>.
            </Typography>

            {/* Article II */}
            <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 3, mb: 1, fontFamily: '"Times New Roman", serif', fontSize: '13pt' }}>
              ARTICLE II - TERM OF LEASE
            </Typography>
            <Typography paragraph sx={{ textIndent: '40px', textAlign: 'justify', fontFamily: '"Times New Roman", serif' }}>
              The term of this lease shall be for a period of {contractData.leaseDuration || '[DURATION]'} ({contractData.leaseDuration || '[DURATION]'}) months,
              commencing on {contractData.leaseStartDate || '[START DATE]'} and ending on {contractData.leaseEndDate || '[END DATE]'},
              unless sooner terminated as herein provided.
            </Typography>

            {/* Article III */}
            <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 3, mb: 1, fontFamily: '"Times New Roman", serif', fontSize: '13pt' }}>
              ARTICLE III - RENTAL AND PAYMENT TERMS
            </Typography>
            <Typography paragraph sx={{ textIndent: '40px', textAlign: 'justify', fontFamily: '"Times New Roman", serif' }}>
              3.1. The monthly rental for the LEASED PREMISES is <strong>₱{Number(contractData.monthlyRent || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</strong>
              (Philippine Pesos), payable on or before the 5th day of each month.
            </Typography>
            <Typography paragraph sx={{ textIndent: '40px', textAlign: 'justify', fontFamily: '"Times New Roman", serif' }}>
              3.2. The LESSEE shall pay a security deposit of <strong>₱{Number(contractData.securityDeposit || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</strong>
              to guarantee the faithful performance of all obligations under this Contract.
            </Typography>
            <Typography paragraph sx={{ textIndent: '40px', textAlign: 'justify', fontFamily: '"Times New Roman", serif' }}>
              3.3. Advance rental payment of {contractData.advanceRent || '[NUMBER]'} month(s) amounting to
              <strong> ₱{Number((contractData.monthlyRent || 0) * (contractData.advanceRent || 1)).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</strong> shall be paid upon signing of this Contract.
            </Typography>

            {/* Article IV */}
            <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 3, mb: 1, fontFamily: '"Times New Roman", serif', fontSize: '13pt' }}>
              ARTICLE IV - USE OF PREMISES
            </Typography>
            <Typography paragraph sx={{ textIndent: '40px', textAlign: 'justify', fontFamily: '"Times New Roman", serif' }}>
              4.1. The LEASED PREMISES shall be used exclusively for residential purposes and shall not be used for any illegal, immoral, or nuisance-creating activities.
            </Typography>
            <Typography paragraph sx={{ textIndent: '40px', textAlign: 'justify', fontFamily: '"Times New Roman", serif' }}>
              4.2. The LESSEE shall not sublet the LEASED PREMISES or any portion thereof without the prior written consent of the LESSOR.
            </Typography>

            {/* Article V */}
            <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 3, mb: 1, fontFamily: '"Times New Roman", serif', fontSize: '13pt' }}>
              ARTICLE V - MAINTENANCE AND REPAIRS
            </Typography>
            <Typography paragraph sx={{ textIndent: '40px', textAlign: 'justify', fontFamily: '"Times New Roman", serif' }}>
              5.1. The LESSEE shall maintain the LEASED PREMISES in good, clean, and tenantable condition at all times.
            </Typography>
            <Typography paragraph sx={{ textIndent: '40px', textAlign: 'justify', fontFamily: '"Times New Roman", serif' }}>
              5.2. Major repairs and maintenance affecting the structural integrity of the premises shall be the responsibility of the LESSOR.
            </Typography>
            <Typography paragraph sx={{ textIndent: '40px', textAlign: 'justify', fontFamily: '"Times New Roman", serif' }}>
              5.3. Minor repairs and ordinary wear and tear shall be the responsibility of the LESSEE.
            </Typography>

            {/* Article VI */}
            <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 3, mb: 1, fontFamily: '"Times New Roman", serif', fontSize: '13pt' }}>
              ARTICLE VI - UTILITIES AND SERVICES
            </Typography>
            <Typography paragraph sx={{ textIndent: '40px', textAlign: 'justify', fontFamily: '"Times New Roman", serif' }}>
              The LESSEE shall be responsible for the payment of all utilities including but not limited to electricity, water, internet,
              and other services consumed in the LEASED PREMISES during the term of this Contract.
            </Typography>

            {/* Article VII */}
            <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 3, mb: 1, fontFamily: '"Times New Roman", serif', fontSize: '13pt' }}>
              ARTICLE VII - TERMINATION
            </Typography>
            <Typography paragraph sx={{ textIndent: '40px', textAlign: 'justify', fontFamily: '"Times New Roman", serif' }}>
              7.1. This Contract may be terminated by either party upon thirty (30) days prior written notice to the other party.
            </Typography>
            <Typography paragraph sx={{ textIndent: '40px', textAlign: 'justify', fontFamily: '"Times New Roman", serif' }}>
              7.2. The LESSOR may terminate this Contract immediately for just causes including but not limited to: non-payment of rent,
              violation of any terms herein, illegal use of premises, or conduct causing nuisance.
            </Typography>

            {/* Article VIII */}
            <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 3, mb: 1, fontFamily: '"Times New Roman", serif', fontSize: '13pt' }}>
              ARTICLE VIII - RETURN OF SECURITY DEPOSIT
            </Typography>
            <Typography paragraph sx={{ textIndent: '40px', textAlign: 'justify', fontFamily: '"Times New Roman", serif' }}>
              Upon termination of this Contract and surrender of the premises in good condition, normal wear and tear excepted,
              the security deposit shall be returned to the LESSEE within thirty (30) days, less any deductions for unpaid rent or damages.
            </Typography>

            {/* Article IX */}
            <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 3, mb: 1, fontFamily: '"Times New Roman", serif', fontSize: '13pt' }}>
              ARTICLE IX - GOVERNING LAW
            </Typography>
            <Typography paragraph sx={{ textIndent: '40px', textAlign: 'justify', fontFamily: '"Times New Roman", serif' }}>
              This Contract shall be governed by and construed in accordance with the laws of the Republic of the Philippines,
              particularly the Civil Code of the Philippines (Republic Act No. 386) and the Rent Control Act of 2009 (Republic Act No. 9653).
            </Typography>

            {/* Special Provisions */}
            {contractData.specialProvisions && (
              <>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 3, mb: 1, fontFamily: '"Times New Roman", serif', fontSize: '13pt' }}>
                  ARTICLE X - SPECIAL PROVISIONS
                </Typography>
                <Typography paragraph sx={{ textIndent: '40px', textAlign: 'justify', fontFamily: '"Times New Roman", serif' }}>
                  {contractData.specialProvisions}
                </Typography>
              </>
            )}

            {/* Signature Section */}
            <Box sx={{ mt: 6 }}>
              <Typography paragraph sx={{ textIndent: '40px', textAlign: 'justify', fontFamily: '"Times New Roman", serif' }}>
                IN WITNESS WHEREOF, the parties have hereunto set their hands this {contractData.executionDate || '[DATE]'} at
                {contractData.executionPlace || '[PLACE]'}.
              </Typography>

              <Grid container spacing={8} sx={{ mt: 6 }}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ borderTop: '1px solid #000', width: '100%', mb: 1, mt: 8 }} />
                    <Typography sx={{ fontWeight: 'bold', fontFamily: '"Times New Roman", serif' }}>
                      {contractData.lessorName || '[LESSOR NAME]'}
                    </Typography>
                    <Typography sx={{ fontFamily: '"Times New Roman", serif' }}>LESSOR</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ borderTop: '1px solid #000', width: '100%', mb: 1, mt: 8 }} />
                    <Typography sx={{ fontWeight: 'bold', fontFamily: '"Times New Roman", serif' }}>
                      {contractData.lesseeName || '[LESSEE NAME]'}
                    </Typography>
                    <Typography sx={{ fontFamily: '"Times New Roman", serif' }}>LESSEE</Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ mt: 8 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, fontFamily: '"Times New Roman", serif', fontSize: '13pt' }}>
                  SIGNED IN THE PRESENCE OF:
                </Typography>
                <Grid container spacing={8} sx={{ mt: 2 }}>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Box sx={{ borderTop: '1px solid #000', width: '100%', mb: 1, mt: 8 }} />
                      <Typography sx={{ fontFamily: '"Times New Roman", serif' }}>Witness #1</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Box sx={{ borderTop: '1px solid #000', width: '100%', mb: 1, mt: 8 }} />
                      <Typography sx={{ fontFamily: '"Times New Roman", serif' }}>Witness #2</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={generating}>
          Close
        </Button>
        <Button
          variant="outlined"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
          disabled={generating}
        >
          Print
        </Button>
        <Button
          variant="contained"
          startIcon={<PdfIcon />}
          onClick={handleGeneratePDF}
          disabled={generating}
        >
          {generating ? 'Generating PDF...' : 'Download PDF'}
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Save to database'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContractTemplate;
