import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Snackbar,
  Alert,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormGroup,
  Checkbox,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { API_URLS } from '../config/apiConfig';

const API_URL = API_URLS.DENTAL;

const paymentMethods = ['Cash', 'Cheque', 'Credit Card', 'Insurance', 'Other'];
const financialResponsibleOptions = ['Self', 'Spouse', 'Parent/Guardian', 'Other'];
const dentalSensitivityOptions = ['Cold', 'Sweets', 'Heat', 'Other', 'NONE'];
const priorTreatmentsOptions = ['Bridgework', 'Crown/caps', 'Full/Partial Dentures', 'Root Canal', 'Orthodontic', 'Periodontal (Gums),', 'NONE'];
const medicalConditions = [
  'NONE', 'AIDS', 'Anemia', 'Angina', 'Anorexia Nervosa', 'Artificial heart valve', 'Arthritis/Rheumatism', 'Artificial Joints (hips, knees)',
  'Asthma', 'Blood Disorders', 'Bronchitis', 'Bulimia', 'Cancer', 'Circulation Problems', 'Congenital Heart Lesions', 'Cortisone/Steroid Treatment',
  'Diabetes', 'Drug/Alcohol Dependence', 'Emphysema', 'Epilepsy', 'Glandular Disorders', 'Glaucoma', 'Head/Neck Injuries', 'Heart Disease/Attack',
  'Heart Murmur', 'Heart Pacemaker/Surgery', 'Heart Rhythm Disorder', 'Hepatitis A/B/C', 'Herpes', 'H.I.V. Positive', 'Hodgkin’s Disease',
  'Hyper/Hypo Glycemia', 'Hypertension', 'Jaundice', 'Kidney Disease', 'Liver Disease', 'Leukemia', 'Lung Disease', 'Malignant Hypothermia',
  'Mental/Nervous Disorder', 'Mitral Valve Prolapse', 'Organ Transplant/Implant', 'Psychiatric Disorders', 'Radiation/Chemotherapy',
  'Rheumatic/Scarlet Fever', 'Sickle Cell Disease', 'Sinus Trouble', 'Stomach/Intestinal Problems', 'Stroke', 'Thyroid Disease',
  'Tuberculosis', 'Ulcers', 'Venereal Disease', 'Other'
];
const childrenIllnesses = ['Chicken Pox', 'Mumps', 'Tonsillitis', 'Measles', 'Strep Throat', 'NONE'];

const initialForm = {
  // Patient info
  guardian_responsible: '',
  full_name: '',
  sex: '',
  address: '',
  city: '',
  province: '',
  postal_code: '',
  date_of_birth: '',
  home_phone: '',
  cell_phone: '',
  email: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
  family_doctor: '',
  family_doctor_phone: '',
  referring_doctor: '',
  referring_doctor_phone: '',

  // Financial
  payment_method: '',
  financial_responsible: '',

  // Dental history
  dental_history: {
    reason_for_visit: '',
    dentist_frequency: '',
    last_dental_visit: '',
    last_xray: '',
    brush_frequency: '',
    floss: '',
    mouthwash: '',
    sensitivity: [],
    gums_bleed: [],
    gums_swollen: '',
    bad_breath: '',
    jaw_noise: '',
    grind_teeth: '',
    food_catch: '',
    had_anesthesia: '',
    dental_problems: '',
    prior_treatments: [],
    satisfied_teeth: ''
  },

  // Medical history
  medical_history: {
    under_physician: '',
    hospitalized: '',
    taking_meds: '',
    meds_warning: '',
    prolonged_drugs: '',
    allergies: '',
    bleeding_issue: '',
    smoke: '',
    fainted: '',
    conditions: [],
    children_illnesses: []
  },

  // Consent
  consent: {
    general_release: false,
    medical_dental_consent: false,
    benefits_consent: false,
    privacy_consent: false,
    signature_name: '',
    guardian_consent_name: ''
  }
};

export default function NewPatientForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [showSummary, setShowSummary] = useState(false);
  const [closeDialog, setCloseDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Track changes to the form
  useEffect(() => {
    const formHasData = JSON.stringify(form) !== JSON.stringify(initialForm);
    setHasChanges(formHasData);
  }, [form]);

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleNestedChange = (section, field) => (e) => {
    setForm({ ...form, [section]: { ...form[section], [field]: e.target.value } });
  };

  const handleCheckboxGroup = (section, field, option) => (e) => {
    const current = form[section][field] || [];
    const next = e.target.checked
      ? [...current, option]
      : current.filter((item) => item !== option);
    setForm({ ...form, [section]: { ...form[section], [field]: next } });
  };

  const handleClose = () => {
    if (hasChanges) {
      setCloseDialog(true);
    } else {
      navigate('/dental');
    }
  };

  const handleCloseWithoutSaving = () => {
    setCloseDialog(false);
    navigate('/dental');
  };

  const handleSaveAndClose = async () => {
    await handleSubmit();
    setCloseDialog(false);
    navigate('/dental');
  };

  const handleSubmit = async (continueEditing = false) => {
    // Basic required checks mirroring the provided form
    const missing = [];
    if (!form.full_name) missing.push('Full Name');
    if (!form.sex) missing.push('Sex');
    if (!form.address || !form.city || !form.province || !form.postal_code) missing.push('Address / City / Province / Postal Code');
    if (!form.date_of_birth) missing.push('Date of Birth');
    if (!form.cell_phone) missing.push('Cell No.');
    if (!form.email) missing.push('Email Address');
    if (!form.emergency_contact_name || !form.emergency_contact_phone) missing.push('Emergency Contact + Phone');
    if (!form.payment_method) missing.push('Method of Payment');
    if (!form.financial_responsible) missing.push('Financial responsibility');
    if (!form.consent.signature_name || !form.consent.general_release || !form.consent.medical_dental_consent || !form.consent.benefits_consent || !form.consent.privacy_consent) {
      missing.push('Consents / Signature');
    }

    if (missing.length) {
      setSnackbar({ open: true, message: `Please complete required fields: ${missing.join(', ')}`, severity: 'warning' });
      return false;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/dental/new-patient-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (response.ok) {
        setSnackbar({ open: true, message: 'Thanks! We received your request and will contact you soon.', severity: 'success' });
        if (continueEditing) {
          // Reset form for next patient
          setForm(initialForm);
          setShowSummary(false);
          window.scrollTo(0, 0);
        } else {
          setShowSummary(true);
        }
        setLoading(false);
        return true;
      } else {
        setSnackbar({ open: true, message: data.message || 'Submission failed', severity: 'error' });
        setLoading(false);
        return false;
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Unable to submit right now. Please try again.', severity: 'error' });
      setLoading(false);
      return false;
    }
  };

  const handleSaveAndContinue = async () => {
    await handleSubmit(true);
  };

  return (
    <Box sx={{ py: 8, backgroundColor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="md">
        <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, boxShadow: 6, position: 'relative' }}>
          {/* Close Button */}
          <IconButton
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 16,
              top: 16,
              color: 'text.secondary',
              '&:hover': { color: 'error.main' }
            }}
          >
            <CloseIcon />
          </IconButton>

          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, pr: 6 }}>
            New Patient Form
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Provide your details and our team will reach out to confirm your first visit.
          </Typography>

          {/* Patient Information */}
          <Typography variant="h6" sx={{ mt: 3, mb: 2, fontWeight: 700 }}>Patient Information</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">A parent or guardian will be responsible for decisions on my treatment.</Typography>
              <RadioGroup row value={form.guardian_responsible} onChange={handleChange('guardian_responsible')}>
                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="no" control={<Radio />} label="No" />
              </RadioGroup>
            </Grid>

            <Grid item xs={12} md={9}>
              <TextField label="Full Name *" fullWidth value={form.full_name} onChange={handleChange('full_name')} required />
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" sx={{ mb: 0.5 }}>Sex *</Typography>
              <RadioGroup row value={form.sex} onChange={handleChange('sex')}>
                <FormControlLabel value="male" control={<Radio />} label="Male" />
                <FormControlLabel value="female" control={<Radio />} label="Female" />
              </RadioGroup>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField label="Address *" fullWidth value={form.address} onChange={handleChange('address')} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="City *" fullWidth value={form.city} onChange={handleChange('city')} />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField label="Prov. *" fullWidth value={form.province} onChange={handleChange('province')} />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField label="Postal Code *" fullWidth value={form.postal_code} onChange={handleChange('postal_code')} />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField label="Date of Birth *" type="date" InputLabelProps={{ shrink: true }} fullWidth value={form.date_of_birth} onChange={handleChange('date_of_birth')} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="Home Telephone No." fullWidth value={form.home_phone} onChange={handleChange('home_phone')} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="Cell No. *" fullWidth value={form.cell_phone} onChange={handleChange('cell_phone')} />
            </Grid>

            <Grid item xs={12}>
              <TextField label="Email Address *" type="email" fullWidth value={form.email} onChange={handleChange('email')} />
            </Grid>

            <Grid item xs={12} md={8}>
              <TextField label="Emergency Contact *" fullWidth value={form.emergency_contact_name} onChange={handleChange('emergency_contact_name')} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="Telephone No. *" fullWidth value={form.emergency_contact_phone} onChange={handleChange('emergency_contact_phone')} />
            </Grid>

            <Grid item xs={12} md={8}>
              <TextField label="Family Doctor" fullWidth value={form.family_doctor} onChange={handleChange('family_doctor')} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="Telephone No." fullWidth value={form.family_doctor_phone} onChange={handleChange('family_doctor_phone')} />
            </Grid>

            <Grid item xs={12} md={8}>
              <TextField label="Referring Doctor" fullWidth value={form.referring_doctor} onChange={handleChange('referring_doctor')} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="Telephone No." fullWidth value={form.referring_doctor_phone} onChange={handleChange('referring_doctor_phone')} />
            </Grid>
          </Grid>

          {/* Financial */}
          <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 700 }}>Financial Information</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>Method of Payment *</Typography>
          <RadioGroup row value={form.payment_method} onChange={handleChange('payment_method')}>
            {paymentMethods.map((m) => (
              <FormControlLabel key={m} value={m} control={<Radio />} label={m} />
            ))}
          </RadioGroup>

          <Typography variant="body2" sx={{ mt: 2, mb: 1 }}>Person responsible for financial matters *</Typography>
          <RadioGroup row value={form.financial_responsible} onChange={handleChange('financial_responsible')}>
            {financialResponsibleOptions.map((o) => (
              <FormControlLabel key={o} value={o} control={<Radio />} label={o} />
            ))}
          </RadioGroup>

          {/* Dental History */}
          <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 700 }}>Dental History</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="body2">1. What is the reason for today’s visit? *</Typography>
              <RadioGroup row value={form.dental_history.reason_for_visit} onChange={handleNestedChange('dental_history', 'reason_for_visit')}>
                <FormControlLabel value="Emergency" control={<Radio />} label="Emergency" />
                <FormControlLabel value="Examination" control={<Radio />} label="Examination" />
                <FormControlLabel value="Other" control={<Radio />} label="Other" />
              </RadioGroup>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2">2. How frequently do you see a dentist? *</Typography>
              <RadioGroup row value={form.dental_history.dentist_frequency} onChange={handleNestedChange('dental_history', 'dentist_frequency')}>
                <FormControlLabel value="3-6 months" control={<Radio />} label="3-6 months" />
                <FormControlLabel value="Annually" control={<Radio />} label="Annually" />
                <FormControlLabel value="Other" control={<Radio />} label="Other" />
              </RadioGroup>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="3. When was your last dental visit? *" fullWidth value={form.dental_history.last_dental_visit} onChange={handleNestedChange('dental_history', 'last_dental_visit')} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Last X-ray? *" fullWidth value={form.dental_history.last_xray} onChange={handleNestedChange('dental_history', 'last_xray')} />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2">How often do you brush your teeth? *</Typography>
              <RadioGroup value={form.dental_history.brush_frequency} onChange={handleNestedChange('dental_history', 'brush_frequency')}>
                <FormControlLabel value="Once a day" control={<Radio />} label="Once a day" />
                <FormControlLabel value="Twice a day" control={<Radio />} label="Twice a day" />
                <FormControlLabel value="3 times a day" control={<Radio />} label="3 times a day" />
                <FormControlLabel value="Other" control={<Radio />} label="Other" />
              </RadioGroup>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="body2">Do you floss? *</Typography>
              <RadioGroup row value={form.dental_history.floss} onChange={handleNestedChange('dental_history', 'floss')}>
                <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="No" control={<Radio />} label="No" />
              </RadioGroup>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2">Do you use Anti-Bacterial Rinse (Mouthwash)? *</Typography>
              <RadioGroup row value={form.dental_history.mouthwash} onChange={handleNestedChange('dental_history', 'mouthwash')}>
                <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="No" control={<Radio />} label="No" />
              </RadioGroup>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2">5. Are your teeth sensitive to *</Typography>
              <FormGroup row>
                {dentalSensitivityOptions.map((opt) => (
                  <FormControlLabel
                    key={opt}
                    control={<Checkbox checked={form.dental_history.sensitivity.includes(opt)} onChange={handleCheckboxGroup('dental_history', 'sensitivity', opt)} />}
                    label={opt}
                  />
                ))}
              </FormGroup>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2">6. Do your gums bleed when *</Typography>
              <FormGroup row>
                {['Brushing', 'Flossing', 'Never'].map((opt) => (
                  <FormControlLabel
                    key={opt}
                    control={<Checkbox checked={form.dental_history.gums_bleed.includes(opt)} onChange={handleCheckboxGroup('dental_history', 'gums_bleed', opt)} />}
                    label={opt}
                  />
                ))}
              </FormGroup>
            </Grid>

            {[
              ['gums_swollen', 'Do your gums feel swollen or tender?'],
              ['bad_breath', 'Do you have bad breath or a bad taste in your mouth?'],
              ['jaw_noise', 'Do your jaws crack, pop, or grate when you open widely?'],
              ['grind_teeth', 'Do you grind or clench your teeth?'],
              ['food_catch', 'Does food catch between your teeth?'],
              ['had_anesthesia', 'Have you ever had local anesthesia (freezing)?'],
              ['dental_problems', 'Have you ever had any problems with previous dental treatments?'],
              ['satisfied_teeth', 'Are you satisfied with your teeth?'],
            ].map(([field, label]) => (
              <Grid item xs={12} md={6} key={field}>
                <Typography variant="body2">{label}</Typography>
                <RadioGroup row value={form.dental_history[field]} onChange={handleNestedChange('dental_history', field)}>
                  <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
                  <FormControlLabel value="No" control={<Radio />} label="No" />
                </RadioGroup>
              </Grid>
            ))}

            <Grid item xs={12}>
              <Typography variant="body2">14. Have you ever had any of the following *</Typography>
              <FormGroup row>
                {priorTreatmentsOptions.map((opt) => (
                  <FormControlLabel
                    key={opt}
                    control={<Checkbox checked={form.dental_history.prior_treatments.includes(opt)} onChange={handleCheckboxGroup('dental_history', 'prior_treatments', opt)} />}
                    label={opt}
                  />
                ))}
              </FormGroup>
            </Grid>
          </Grid>

          {/* Medical History */}
          <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 700 }}>Medical History</Typography>
          <Grid container spacing={2}>
            {[
              ['under_physician', 'Are you presently under the care of a physician?'],
              ['hospitalized', 'Have you ever been hospitalized?'],
              ['taking_meds', 'Are you taking any drugs or medication at this time?'],
              ['meds_warning', 'Have you ever been warned against using any other medications?'],
              ['prolonged_drugs', 'Have you ever taken prolonged medical or non-medical drugs?'],
              ['allergies', 'Do you suffer from any allergies?'],
              ['bleeding_issue', 'Do you bruise easily or have prolonged bleeding?'],
              ['smoke', 'Do you smoke?'],
              ['fainted', 'Have you ever fainted, had shortness of breath or chest pains?'],
            ].map(([field, label]) => (
              <Grid item xs={12} md={6} key={field}>
                <Typography variant="body2">{label} *</Typography>
                <RadioGroup row value={form.medical_history[field]} onChange={handleNestedChange('medical_history', field)}>
                  <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
                  <FormControlLabel value="No" control={<Radio />} label="No" />
                </RadioGroup>
              </Grid>
            ))}

            <Grid item xs={12}>
              <Typography variant="body2">12. Do you have or have you had any of the following? *</Typography>
              <FormGroup row>
                {medicalConditions.map((opt) => (
                  <FormControlLabel
                    key={opt}
                    control={<Checkbox checked={form.medical_history.conditions.includes(opt)} onChange={handleCheckboxGroup('medical_history', 'conditions', opt)} />}
                    label={opt}
                  />
                ))}
              </FormGroup>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2">13. CHILDREN: Have you recently had any of the following (appropriate date)?</Typography>
              <FormGroup row>
                {childrenIllnesses.map((opt) => (
                  <FormControlLabel
                    key={opt}
                    control={<Checkbox checked={form.medical_history.children_illnesses.includes(opt)} onChange={handleCheckboxGroup('medical_history', 'children_illnesses', opt)} />}
                    label={opt}
                  />
                ))}
              </FormGroup>
            </Grid>
          </Grid>

          {/* Consent */}
          <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 700 }}>Informed Consent</Typography>
          <FormGroup>
            <FormControlLabel
              control={<Checkbox checked={form.consent.general_release} onChange={(e) => setForm({ ...form, consent: { ...form.consent, general_release: e.target.checked } })} />}
              label="I understand and agree to the above (General Release). *"
            />
            <FormControlLabel
              control={<Checkbox checked={form.consent.medical_dental_consent} onChange={(e) => setForm({ ...form, consent: { ...form.consent, medical_dental_consent: e.target.checked } })} />}
              label="I understand and agree to the above (Medical/Dental Informed Consent). *"
            />
            <FormControlLabel
              control={<Checkbox checked={form.consent.benefits_consent} onChange={(e) => setForm({ ...form, consent: { ...form.consent, benefits_consent: e.target.checked } })} />}
              label="I understand and agree to the above (Signature on File / Benefits). *"
            />
            <FormControlLabel
              control={<Checkbox checked={form.consent.privacy_consent} onChange={(e) => setForm({ ...form, consent: { ...form.consent, privacy_consent: e.target.checked } })} />}
              label="I understand and agree to the above (Patient & Guardian Consent). *"
            />
          </FormGroup>

          <TextField
            label="Name (signature) *"
            fullWidth
            sx={{ mt: 2 }}
            value={form.consent.signature_name}
            onChange={(e) => setForm({ ...form, consent: { ...form.consent, signature_name: e.target.value } })}
          />
          <TextField
            label="Patient/Guardian Consent Name"
            fullWidth
            sx={{ mt: 2 }}
            value={form.consent.guardian_consent_name}
            onChange={(e) => setForm({ ...form, consent: { ...form.consent, guardian_consent_name: e.target.value } })}
          />

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="contained" onClick={() => handleSubmit(false)} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit'}
            </Button>
            <Button variant="contained" color="success" onClick={handleSaveAndContinue} disabled={loading}>
              {loading ? 'Saving...' : 'Save & Continue'}
            </Button>
            <Button variant="outlined" onClick={() => setForm(initialForm)} disabled={loading}>
              Clear
            </Button>
            <Button variant="text" onClick={() => window.print()} disabled={loading}>
              Print / Save as PDF
            </Button>
          </Box>
        </Paper>

        {showSummary && (
          <Paper sx={{ p: { xs: 3, md: 5 }, mt: 4, borderRadius: 3, boxShadow: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
              Printable Summary
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              A condensed view of your responses for printing or PDF export.
            </Typography>

            <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 700 }}>Patient Information</Typography>
            <Grid container spacing={1}>
              {[
                ['Full Name', form.full_name],
                ['Sex', form.sex],
                ['Address', `${form.address} ${form.city} ${form.province} ${form.postal_code}`.trim()],
                ['Date of Birth', form.date_of_birth],
                ['Home Phone', form.home_phone],
                ['Cell Phone', form.cell_phone],
                ['Email', form.email],
                ['Emergency Contact', `${form.emergency_contact_name} (${form.emergency_contact_phone})`],
                ['Family Doctor', `${form.family_doctor} (${form.family_doctor_phone})`],
                ['Referring Doctor', `${form.referring_doctor} (${form.referring_doctor_phone})`],
              ].map(([label, value]) => (
                value ? (
                  <Grid item xs={12} sm={6} key={label}>
                    <Typography variant="body2"><strong>{label}:</strong> {value}</Typography>
                  </Grid>
                ) : null
              ))}
            </Grid>

            <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 700 }}>Financial</Typography>
            <Typography variant="body2">Method of Payment: {form.payment_method || '—'}</Typography>
            <Typography variant="body2">Financial Responsible: {form.financial_responsible || '—'}</Typography>

            <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 700 }}>Dental History</Typography>
            <Typography variant="body2">Reason for visit: {form.dental_history.reason_for_visit || '—'}</Typography>
            <Typography variant="body2">Dentist frequency: {form.dental_history.dentist_frequency || '—'}</Typography>
            <Typography variant="body2">Last visit: {form.dental_history.last_dental_visit || '—'}</Typography>
            <Typography variant="body2">Last X-ray: {form.dental_history.last_xray || '—'}</Typography>
            <Typography variant="body2">Brush frequency: {form.dental_history.brush_frequency || '—'}</Typography>
            <Typography variant="body2">Floss: {form.dental_history.floss || '—'}</Typography>
            <Typography variant="body2">Mouthwash: {form.dental_history.mouthwash || '—'}</Typography>
            <Typography variant="body2">Sensitivity: {(form.dental_history.sensitivity || []).join(', ') || '—'}</Typography>
            <Typography variant="body2">Gums bleed: {(form.dental_history.gums_bleed || []).join(', ') || '—'}</Typography>
            <Typography variant="body2">Gums swollen: {form.dental_history.gums_swollen || '—'}</Typography>
            <Typography variant="body2">Bad breath: {form.dental_history.bad_breath || '—'}</Typography>
            <Typography variant="body2">Jaw noise: {form.dental_history.jaw_noise || '—'}</Typography>
            <Typography variant="body2">Grind teeth: {form.dental_history.grind_teeth || '—'}</Typography>
            <Typography variant="body2">Food catch: {form.dental_history.food_catch || '—'}</Typography>
            <Typography variant="body2">Had anesthesia: {form.dental_history.had_anesthesia || '—'}</Typography>
            <Typography variant="body2">Dental problems: {form.dental_history.dental_problems || '—'}</Typography>
            <Typography variant="body2">Prior treatments: {(form.dental_history.prior_treatments || []).join(', ') || '—'}</Typography>
            <Typography variant="body2">Satisfied with teeth: {form.dental_history.satisfied_teeth || '—'}</Typography>

            <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 700 }}>Medical History</Typography>
            {[
              ['Under physician', form.medical_history.under_physician],
              ['Hospitalized', form.medical_history.hospitalized],
              ['Taking meds', form.medical_history.taking_meds],
              ['Med warnings', form.medical_history.meds_warning],
              ['Prolonged drugs', form.medical_history.prolonged_drugs],
              ['Allergies', form.medical_history.allergies],
              ['Bleeding issues', form.medical_history.bleeding_issue],
              ['Smoke', form.medical_history.smoke],
              ['Fainted/chest pain', form.medical_history.fainted],
            ].map(([label, value]) => (
              <Typography key={label} variant="body2">{label}: {value || '—'}</Typography>
            ))}
            <Typography variant="body2">Conditions: {(form.medical_history.conditions || []).join(', ') || '—'}</Typography>
            <Typography variant="body2">Children illnesses: {(form.medical_history.children_illnesses || []).join(', ') || '—'}</Typography>

            <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 700 }}>Consent</Typography>
            <Typography variant="body2">General Release: {form.consent.general_release ? 'Yes' : 'No'}</Typography>
            <Typography variant="body2">Medical/Dental Consent: {form.consent.medical_dental_consent ? 'Yes' : 'No'}</Typography>
            <Typography variant="body2">Benefits/Signature on file: {form.consent.benefits_consent ? 'Yes' : 'No'}</Typography>
            <Typography variant="body2">Privacy Consent: {form.consent.privacy_consent ? 'Yes' : 'No'}</Typography>
            <Typography variant="body2">Signature Name: {form.consent.signature_name || '—'}</Typography>
            <Typography variant="body2">Guardian Consent Name: {form.consent.guardian_consent_name || '—'}</Typography>

            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button variant="contained" onClick={() => window.print()}>Print / Save Summary</Button>
              <Button variant="outlined" onClick={() => setShowSummary(false)}>Hide Summary</Button>
            </Box>
          </Paper>
        )}
      </Container>

      {/* Close Confirmation Dialog */}
      <Dialog open={closeDialog} onClose={() => setCloseDialog(false)}>
        <DialogTitle>Save Changes?</DialogTitle>
        <DialogContent>
          <Typography>
            You have unsaved changes. Would you like to save your progress before closing?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCloseDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleCloseWithoutSaving} color="error">
            Don't Save
          </Button>
          <Button onClick={handleSaveAndClose} variant="contained" color="primary">
            Save & Close
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
