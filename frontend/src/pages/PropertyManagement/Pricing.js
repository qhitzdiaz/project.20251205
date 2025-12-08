import React from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/CheckCircle';

const plans = [
  {
    name: 'Starter',
    price: '₱0',
    cadence: 'per month',
    features: ['Up to 5 properties', 'Basic maintenance tracking', 'Email support'],
    cta: 'Choose Starter',
    highlighted: false,
  },
  {
    name: 'Growth',
    price: '₱4,500',
    cadence: 'per month',
    features: ['Up to 50 properties', 'Invoices & payments', 'Priority support', 'Staff & tasks'],
    cta: 'Choose Growth',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    cadence: 'contact us',
    features: ['Unlimited properties', 'Custom workflows', 'Dedicated CSM', 'SLA & SSO'],
    cta: 'Talk to Sales',
    highlighted: false,
  },
];

const Pricing = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

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
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" sx={{ fontWeight: 800, color: isDark ? 'white' : theme.palette.text.primary }}>
            Pricing
          </Typography>
          <Typography variant="body1" sx={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)', mt: 1 }}>
            Pick the plan that matches your portfolio size and billing needs.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {plans.map((plan) => (
            <Grid item xs={12} md={4} key={plan.name}>
              <Card
                elevation={plan.highlighted ? 6 : isDark ? 0 : 2}
                sx={{
                  height: '100%',
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'white',
                  border: plan.highlighted
                    ? `2px solid ${theme.palette.primary.main}`
                    : isDark
                      ? '1px solid rgba(255,255,255,0.08)'
                      : 'none',
                }}
              >
                <CardContent>
                  <Typography variant="overline" sx={{ color: isDark ? '#90caf9' : theme.palette.primary.main }}>
                    {plan.name}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>
                    {plan.price}
                  </Typography>
                  <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
                    {plan.cadence}
                  </Typography>

                  <List dense sx={{ mt: 2 }}>
                    {plan.features.map((feat) => (
                      <ListItem key={feat} disableGutters>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <CheckIcon fontSize="small" color="success" />
                        </ListItemIcon>
                        <ListItemText primary={feat} />
                      </ListItem>
                    ))}
                  </List>

                  <Button
                    fullWidth
                    variant={plan.highlighted ? 'contained' : 'outlined'}
                    sx={{ mt: 2 }}
                    color="primary"
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Pricing;
