import React from 'react';
import {
  Container,
  Typography,
  Box,
} from '@mui/material';

function AboutUs() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography variant="h2" gutterBottom sx={{ fontWeight: 700 }}>
          About Us
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Empowering businesses with integrated management solutions
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto', mt: 3 }}>
          Founded in 2024, Qhitz has become a leading provider of comprehensive business management 
          software. Our platform combines media management, cloud file storage, and operational tools 
          into one seamless solution.
        </Typography>
      </Box>

      {/* Contact CTA */}
      <Box sx={{ textAlign: 'center', mt: 8 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          Ready to Transform Your Business?
        </Typography>
      </Box>
    </Container>
  );
}

export default AboutUs;
