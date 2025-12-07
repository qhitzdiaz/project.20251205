/**
 * Logo Configuration for Compleat Smile Dental Aesthetic
 *
 * This file contains all logo-related configuration including
 * paths, sizes, and usage guidelines for the clinic's branding.
 */

import clinicLogo from '../images/Logo.jpg';

/**
 * Logo Configuration Object
 */
export const LOGO_CONFIG = {
  // Logo Image Path
  image: clinicLogo,

  // Alt Text for Accessibility
  altText: 'Compleat Smile Dental Aesthetic',

  // Clinic Information
  clinic: {
    fullName: 'Compleat Smile Dental Aesthetic',
    shortName: 'Compleat Smile Dental',
    tagline: 'Practice Management System',
  },

  // Logo Sizes for Different Contexts
  sizes: {
    header: {
      height: '50px',
      mobile: '40px',
    },
    page: {
      height: '80px',
      mobile: '60px',
    },
    card: {
      height: '60px',
      mobile: '50px',
    },
    icon: {
      height: '32px',
      mobile: '28px',
    },
  },

  // Styling Guidelines
  style: {
    borderRadius: '8px',
    objectFit: 'contain',
  },

  // Theme-specific Configurations
  theme: {
    light: {
      backgroundColor: 'transparent',
      shadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
    dark: {
      backgroundColor: 'transparent',
      shadow: '0 2px 8px rgba(255, 255, 255, 0.1)',
    },
  },
};

/**
 * Helper function to get logo with specific size
 * @param {string} context - Context where logo is used ('header', 'page', 'card', 'icon')
 * @param {boolean} isMobile - Whether it's mobile view
 * @returns {object} Logo configuration object
 */
export const getLogoConfig = (context = 'header', isMobile = false) => {
  const size = LOGO_CONFIG.sizes[context];
  const height = isMobile ? size.mobile : size.height;

  return {
    src: LOGO_CONFIG.image,
    alt: LOGO_CONFIG.altText,
    style: {
      height,
      width: 'auto',
      ...LOGO_CONFIG.style,
    },
  };
};

/**
 * Get clinic name based on context
 * @param {boolean} short - Whether to use short name
 * @returns {string} Clinic name
 */
export const getClinicName = (short = false) => {
  return short ? LOGO_CONFIG.clinic.shortName : LOGO_CONFIG.clinic.fullName;
};

export default LOGO_CONFIG;
