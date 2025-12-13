// API URL configuration
// Uses environment variables OR constructs URLs from current origin

// Get base URL - use environment vars if set, otherwise use relative paths through reverse proxy
const getApiBaseUrl = () => {
  // If environment variables are set, use them (for external access)
  if (process.env.REACT_APP_AUTH_API_URL) {
    return process.env.REACT_APP_AUTH_API_URL.replace('/auth', '').replace('/api', '');
  }
  // Otherwise use current host (works for both localhost and network access)
  // This allows the reverse proxy on port 80 to handle routing
  return window.location.origin;
};

const API_BASE = getApiBaseUrl();

// Service base URLs - use these to construct API paths
export const API_URLS = {
  AUTH_BASE: process.env.REACT_APP_AUTH_API_URL || `${API_BASE}/api/auth`,
  MEDIA_BASE: process.env.REACT_APP_MEDIA_API_URL || `${API_BASE}/api/media`,
  CLOUD_BASE: process.env.REACT_APP_CLOUD_API_URL || `${API_BASE}/api/cloud`,
  PROPERTY_BASE: process.env.REACT_APP_PROPERTY_API_URL || `${API_BASE}/api/property`,
  SUPPLY_BASE: process.env.REACT_APP_SUPPLY_API_URL || `${API_BASE}/api/supply`,
  SERBISYO_BASE: process.env.REACT_APP_SERBISYO_API_URL || `${API_BASE}/api/serbisyo`,
};

// Backwards compatibility - keep AUTH for old code
export const API_URL = API_URLS.AUTH_BASE;
