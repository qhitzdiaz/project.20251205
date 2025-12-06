import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Grid,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Divider,
  Box,
} from '@mui/material';

const steps = ['Personal Information', 'Emergency Contact & Insurance', 'Medical History', 'Dental History', 'Consent & Signature'];

export default function PatientRegistrationDialog({ open, onClose, patientForm, setPatientForm, onSubmit, loading }) {
  const [activeStep, setActiveStep] = React.useState(0);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = () => {
    onSubmit();
    setActiveStep(0);
  };

  const handleClose = () => {
    setActiveStep(0);
    onClose();
  };

  const handleMedicalConditionChange = (condition) => {
    setPatientForm({
      ...patientForm,
      medical_conditions: {
        ...patientForm.medical_conditions,
        [condition]: !patientForm.medical_conditions[condition]
      }
    });
  };

  const handleDentalConcernChange = (concern) => {
    setPatientForm({
      ...patientForm,
      dental_concerns: {
        ...patientForm.dental_concerns,
        [concern]: !patientForm.dental_concerns[concern]
      }
    });
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        // Personal Information
        return (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Personal Information</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                required
                label="First Name"
                value={patientForm.first_name}
                onChange={(e) => setPatientForm({...patientForm, first_name: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Middle Name"
                value={patientForm.middle_name}
                onChange={(e) => setPatientForm({...patientForm, middle_name: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                required
                label="Last Name"
                value={patientForm.last_name}
                onChange={(e) => setPatientForm({...patientForm, last_name: e.target.value})}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Preferred Name"
                value={patientForm.preferred_name}
                onChange={(e) => setPatientForm({...patientForm, preferred_name: e.target.value})}
                helperText="What would you like us to call you?"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Date of Birth"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={patientForm.date_of_birth}
                onChange={(e) => setPatientForm({...patientForm, date_of_birth: e.target.value})}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={patientForm.gender}
                  label="Gender"
                  onChange={(e) => setPatientForm({...patientForm, gender: e.target.value})}
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                  <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Marital Status</InputLabel>
                <Select
                  value={patientForm.marital_status}
                  label="Marital Status"
                  onChange={(e) => setPatientForm({...patientForm, marital_status: e.target.value})}
                >
                  <MenuItem value="Single">Single</MenuItem>
                  <MenuItem value="Married">Married</MenuItem>
                  <MenuItem value="Divorced">Divorced</MenuItem>
                  <MenuItem value="Widowed">Widowed</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Contact Information</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Email"
                type="email"
                value={patientForm.email}
                onChange={(e) => setPatientForm({...patientForm, email: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Phone Number"
                value={patientForm.phone}
                onChange={(e) => setPatientForm({...patientForm, phone: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Alternate Phone"
                value={patientForm.alternate_phone}
                onChange={(e) => setPatientForm({...patientForm, alternate_phone: e.target.value})}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Address</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Street Address"
                value={patientForm.street_address}
                onChange={(e) => setPatientForm({...patientForm, street_address: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                required
                label="City"
                value={patientForm.city}
                onChange={(e) => setPatientForm({...patientForm, city: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                required
                label="State/Province"
                value={patientForm.state}
                onChange={(e) => setPatientForm({...patientForm, state: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                required
                label="ZIP/Postal Code"
                value={patientForm.zip_code}
                onChange={(e) => setPatientForm({...patientForm, zip_code: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Country"
                value={patientForm.country}
                onChange={(e) => setPatientForm({...patientForm, country: e.target.value})}
              />
            </Grid>
          </Grid>
        );

      case 1:
        // Emergency Contact & Insurance
        return (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Emergency Contact</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Emergency Contact Name"
                value={patientForm.emergency_contact_name}
                onChange={(e) => setPatientForm({...patientForm, emergency_contact_name: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Relationship"
                value={patientForm.emergency_contact_relationship}
                onChange={(e) => setPatientForm({...patientForm, emergency_contact_relationship: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Emergency Contact Phone"
                value={patientForm.emergency_contact_phone}
                onChange={(e) => setPatientForm({...patientForm, emergency_contact_phone: e.target.value})}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Insurance Information</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Insurance Provider"
                value={patientForm.insurance_provider}
                onChange={(e) => setPatientForm({...patientForm, insurance_provider: e.target.value})}
                helperText="Leave blank if self-pay"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Policy Number"
                value={patientForm.insurance_policy_number}
                onChange={(e) => setPatientForm({...patientForm, insurance_policy_number: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Group Number"
                value={patientForm.insurance_group_number}
                onChange={(e) => setPatientForm({...patientForm, insurance_group_number: e.target.value})}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Policy Holder Information (if different from patient)</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Policy Holder Name"
                value={patientForm.policy_holder_name}
                onChange={(e) => setPatientForm({...patientForm, policy_holder_name: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Policy Holder Date of Birth"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={patientForm.policy_holder_dob}
                onChange={(e) => setPatientForm({...patientForm, policy_holder_dob: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Relationship to Patient"
                value={patientForm.policy_holder_relationship}
                onChange={(e) => setPatientForm({...patientForm, policy_holder_relationship: e.target.value})}
              />
            </Grid>
          </Grid>
        );

      case 2:
        // Medical History
        return (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Medical History</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Primary Physician Name"
                value={patientForm.physician_name}
                onChange={(e) => setPatientForm({...patientForm, physician_name: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Physician Phone"
                value={patientForm.physician_phone}
                onChange={(e) => setPatientForm({...patientForm, physician_phone: e.target.value})}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Current Medications"
                value={patientForm.current_medications}
                onChange={(e) => setPatientForm({...patientForm, current_medications: e.target.value})}
                helperText="List all medications you are currently taking"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Allergies"
                value={patientForm.allergies}
                onChange={(e) => setPatientForm({...patientForm, allergies: e.target.value})}
                helperText="Include drug allergies, food allergies, etc."
              />
            </Grid>

            <Grid item xs={12}>
              <FormLabel component="legend" sx={{ mt: 2, mb: 1 }}>Do you have or have you had any of the following?</FormLabel>
              <FormGroup>
                <Grid container spacing={1}>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={<Checkbox checked={patientForm.medical_conditions.heart_disease} onChange={() => handleMedicalConditionChange('heart_disease')} />}
                      label="Heart Disease"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={<Checkbox checked={patientForm.medical_conditions.high_blood_pressure} onChange={() => handleMedicalConditionChange('high_blood_pressure')} />}
                      label="High Blood Pressure"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={<Checkbox checked={patientForm.medical_conditions.diabetes} onChange={() => handleMedicalConditionChange('diabetes')} />}
                      label="Diabetes"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={<Checkbox checked={patientForm.medical_conditions.asthma} onChange={() => handleMedicalConditionChange('asthma')} />}
                      label="Asthma"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={<Checkbox checked={patientForm.medical_conditions.arthritis} onChange={() => handleMedicalConditionChange('arthritis')} />}
                      label="Arthritis"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={<Checkbox checked={patientForm.medical_conditions.bleeding_disorder} onChange={() => handleMedicalConditionChange('bleeding_disorder')} />}
                      label="Bleeding Disorder"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={<Checkbox checked={patientForm.medical_conditions.cancer} onChange={() => handleMedicalConditionChange('cancer')} />}
                      label="Cancer"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={<Checkbox checked={patientForm.medical_conditions.hepatitis} onChange={() => handleMedicalConditionChange('hepatitis')} />}
                      label="Hepatitis"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={<Checkbox checked={patientForm.medical_conditions.hiv_aids} onChange={() => handleMedicalConditionChange('hiv_aids')} />}
                      label="HIV/AIDS"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={<Checkbox checked={patientForm.medical_conditions.kidney_disease} onChange={() => handleMedicalConditionChange('kidney_disease')} />}
                      label="Kidney Disease"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={<Checkbox checked={patientForm.medical_conditions.liver_disease} onChange={() => handleMedicalConditionChange('liver_disease')} />}
                      label="Liver Disease"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={<Checkbox checked={patientForm.medical_conditions.stroke} onChange={() => handleMedicalConditionChange('stroke')} />}
                      label="Stroke"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={<Checkbox checked={patientForm.medical_conditions.thyroid_problem} onChange={() => handleMedicalConditionChange('thyroid_problem')} />}
                      label="Thyroid Problem"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={<Checkbox checked={patientForm.medical_conditions.tuberculosis} onChange={() => handleMedicalConditionChange('tuberculosis')} />}
                      label="Tuberculosis"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={<Checkbox checked={patientForm.medical_conditions.other} onChange={() => handleMedicalConditionChange('other')} />}
                      label="Other"
                    />
                  </Grid>
                </Grid>
              </FormGroup>
            </Grid>

            {patientForm.medical_conditions.other && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Please specify other medical conditions"
                  value={patientForm.medical_conditions_other}
                  onChange={(e) => setPatientForm({...patientForm, medical_conditions_other: e.target.value})}
                />
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <FormControl component="fieldset" sx={{ mt: 2 }}>
                <FormLabel component="legend">Are you pregnant?</FormLabel>
                <RadioGroup
                  row
                  value={patientForm.pregnant}
                  onChange={(e) => setPatientForm({...patientForm, pregnant: e.target.value})}
                >
                  <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                  <FormControlLabel value="n/a" control={<Radio />} label="N/A" />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl component="fieldset" sx={{ mt: 2 }}>
                <FormLabel component="legend">Are you nursing?</FormLabel>
                <RadioGroup
                  row
                  value={patientForm.nursing}
                  onChange={(e) => setPatientForm({...patientForm, nursing: e.target.value})}
                >
                  <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                  <FormControlLabel value="n/a" control={<Radio />} label="N/A" />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl component="fieldset" sx={{ mt: 2 }}>
                <FormLabel component="legend">Do you use tobacco?</FormLabel>
                <RadioGroup
                  row
                  value={patientForm.tobacco_use}
                  onChange={(e) => setPatientForm({...patientForm, tobacco_use: e.target.value})}
                >
                  <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl component="fieldset" sx={{ mt: 2 }}>
                <FormLabel component="legend">Do you consume alcohol?</FormLabel>
                <RadioGroup
                  row
                  value={patientForm.alcohol_use}
                  onChange={(e) => setPatientForm({...patientForm, alcohol_use: e.target.value})}
                >
                  <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 3:
        // Dental History
        return (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Dental History</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Previous Dentist Name"
                value={patientForm.previous_dentist_name}
                onChange={(e) => setPatientForm({...patientForm, previous_dentist_name: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Previous Dentist Phone"
                value={patientForm.previous_dentist_phone}
                onChange={(e) => setPatientForm({...patientForm, previous_dentist_phone: e.target.value})}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Last Dental Visit"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={patientForm.last_dental_visit}
                onChange={(e) => setPatientForm({...patientForm, last_dental_visit: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Last Cleaning"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={patientForm.last_cleaning}
                onChange={(e) => setPatientForm({...patientForm, last_cleaning: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Last X-Rays"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={patientForm.last_xrays}
                onChange={(e) => setPatientForm({...patientForm, last_xrays: e.target.value})}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Chief Complaint / Reason for Visit"
                value={patientForm.chief_complaint}
                onChange={(e) => setPatientForm({...patientForm, chief_complaint: e.target.value})}
                helperText="What brings you to our office today?"
              />
            </Grid>

            <Grid item xs={12}>
              <FormLabel component="legend" sx={{ mt: 2, mb: 1 }}>Do you experience any of the following?</FormLabel>
              <FormGroup>
                <Grid container spacing={1}>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={<Checkbox checked={patientForm.dental_concerns.bleeding_gums} onChange={() => handleDentalConcernChange('bleeding_gums')} />}
                      label="Bleeding Gums"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={<Checkbox checked={patientForm.dental_concerns.sensitivity} onChange={() => handleDentalConcernChange('sensitivity')} />}
                      label="Tooth Sensitivity"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={<Checkbox checked={patientForm.dental_concerns.jaw_pain} onChange={() => handleDentalConcernChange('jaw_pain')} />}
                      label="Jaw Pain/TMJ"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={<Checkbox checked={patientForm.dental_concerns.grinding_teeth} onChange={() => handleDentalConcernChange('grinding_teeth')} />}
                      label="Grinding/Clenching Teeth"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={<Checkbox checked={patientForm.dental_concerns.bad_breath} onChange={() => handleDentalConcernChange('bad_breath')} />}
                      label="Bad Breath"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={<Checkbox checked={patientForm.dental_concerns.clicking_jaw} onChange={() => handleDentalConcernChange('clicking_jaw')} />}
                      label="Clicking/Popping Jaw"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={<Checkbox checked={patientForm.dental_concerns.loose_teeth} onChange={() => handleDentalConcernChange('loose_teeth')} />}
                      label="Loose Teeth"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={<Checkbox checked={patientForm.dental_concerns.dry_mouth} onChange={() => handleDentalConcernChange('dry_mouth')} />}
                      label="Dry Mouth"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={<Checkbox checked={patientForm.dental_concerns.sores_in_mouth} onChange={() => handleDentalConcernChange('sores_in_mouth')} />}
                      label="Sores in Mouth"
                    />
                  </Grid>
                </Grid>
              </FormGroup>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Other Dental Concerns"
                value={patientForm.dental_concerns_other}
                onChange={(e) => setPatientForm({...patientForm, dental_concerns_other: e.target.value})}
              />
            </Grid>
          </Grid>
        );

      case 4:
        // Consent & Signature
        return (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Consent & Authorization</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>Treatment Consent</Typography>
                <Typography variant="body2" paragraph>
                  I consent to the dental treatment and procedures that may be performed by the dentist and dental staff at this practice.
                  I understand that I will be informed of the treatment plan and associated costs before any work begins.
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={patientForm.consent_treatment}
                      onChange={(e) => setPatientForm({...patientForm, consent_treatment: e.target.checked})}
                      required
                    />
                  }
                  label={<Typography variant="body2" sx={{ fontWeight: 'bold' }}>I agree to the treatment consent *</Typography>}
                />
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>Privacy Policy & HIPAA Authorization</Typography>
                <Typography variant="body2" paragraph>
                  I acknowledge that I have received and reviewed the Notice of Privacy Practices. I authorize the use and disclosure
                  of my protected health information for treatment, payment, and healthcare operations as described in the Notice.
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={patientForm.consent_privacy}
                      onChange={(e) => setPatientForm({...patientForm, consent_privacy: e.target.checked})}
                      required
                    />
                  }
                  label={<Typography variant="body2" sx={{ fontWeight: 'bold' }}>I agree to the privacy policy *</Typography>}
                />
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2, fontWeight: 'bold' }}>Patient Signature *</Typography>
              <TextField
                fullWidth
                required
                label="Type your full name as signature"
                value={patientForm.signature}
                onChange={(e) => setPatientForm({...patientForm, signature: e.target.value})}
                helperText="By typing your name, you are providing your electronic signature"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={patientForm.signature_date}
                onChange={(e) => setPatientForm({...patientForm, signature_date: e.target.value})}
              />
            </Grid>

            <Grid item xs={12}>
              <Alert severity="info" sx={{ mt: 2 }}>
                Please review all information carefully before submitting. You can use the "Back" button to make any changes to previous sections.
              </Alert>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        New Patient Registration
      </DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 2 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ minHeight: 400 }}>
          {renderStepContent(activeStep)}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Box sx={{ flex: '1 1 auto' }} />
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
        >
          Back
        </Button>
        {activeStep === steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || !patientForm.consent_treatment || !patientForm.consent_privacy || !patientForm.signature}
          >
            Submit Registration
          </Button>
        ) : (
          <Button variant="contained" onClick={handleNext}>
            Next
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
