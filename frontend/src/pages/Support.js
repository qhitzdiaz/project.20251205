import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  Paper,
  Divider,
} from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';

function Support() {
  const contactInfo = [
    {
      icon: <EmailIcon sx={{ fontSize: 40 }} />,
      title: 'Email',
      details: 'support@qhitz.com',
      subdetails: 'We respond within 24 hours'
    },
    {
      icon: <PhoneIcon sx={{ fontSize: 40 }} />,
      title: 'Phone',
      details: '(555) 123-4567',
      subdetails: 'Mon-Fri, 9AM-5PM EST'
    },
    {
      icon: <LocationIcon sx={{ fontSize: 40 }} />,
      title: 'Address',
      details: '123 Business Street',
      subdetails: 'City, State 12345'
    },
    {
      icon: <TimeIcon sx={{ fontSize: 40 }} />,
      title: 'Business Hours',
      details: 'Monday - Friday',
      subdetails: '9:00 AM - 5:00 PM EST'
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h2" gutterBottom sx={{ fontWeight: 700 }}>
          Support
        </Typography>
        <Typography variant="h5" color="text.secondary">
          We're here to help you succeed
        </Typography>
      </Box>

      {/* Contact Info Cards */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {contactInfo.map((info, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card elevation={3} sx={{ textAlign: 'center', p: 3, height: '100%' }}>
              <Box sx={{ color: 'primary.main', mb: 2 }}>
                {info.icon}
              </Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                {info.title}
              </Typography>
              <Typography variant="body1" gutterBottom>
                {info.details}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {info.subdetails}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 4, height: '100%' }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              How to reach us
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Choose the channel that works best for you. We respond to email within 24 hours and phone for urgent issues.
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2 }}>
              Email
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              support@qhitz.com
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Phone
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              (555) 123-4567 — Mon–Fri, 9AM–5PM EST. For premium/enterprise customers, 24/7 hotline below.
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Documentation & FAQ
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Check the docs first for setup guides, troubleshooting, and release notes.
            </Typography>
          </Paper>
        </Grid>

        {/* Additional Support Options */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Support Plans
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" color="primary" gutterBottom>
                Free Support
              </Typography>
              <Typography variant="body2" paragraph>
                • Email support<br />
                • 24-48 hour response time<br />
                • Community forum access<br />
                • Documentation & FAQs
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" color="secondary" gutterBottom>
                Premium Support
              </Typography>
              <Typography variant="body2" paragraph>
                • Priority email & phone support<br />
                • 4-hour response time<br />
                • Dedicated account manager<br />
                • Custom training sessions<br />
                • 24/7 emergency support
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" color="success.main" gutterBottom>
                Enterprise Support
              </Typography>
              <Typography variant="body2">
                • All Premium features<br />
                • 1-hour response time<br />
                • On-site support available<br />
                • Custom development<br />
                • SLA guarantees<br />
                • Dedicated infrastructure
              </Typography>
            </Box>
          </Paper>

          <Paper elevation={3} sx={{ p: 4, bgcolor: 'primary.main', color: 'white' }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Need Immediate Help?
            </Typography>
            <Typography variant="body1" paragraph>
              For urgent issues, please call our support hotline:
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
              (555) 123-4567
            </Typography>
            <Typography variant="body2">
              Available 24/7 for Premium and Enterprise customers
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Support;
