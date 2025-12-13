// API URL configuration
// Uses environment variables OR constructs URLs from current origin

// Get base URL - use environment vars if set, otherwise use relative paths through reverse proxy
const getApiBaseUrl = () => {
  // If environment variables are set, use them (for external access)
  if (process.env.REACT_APP_AUTH_API_URL) {
    return process.env.REACT_APP_AUTH_API_URL.replace('/api', '');
  }
  // Otherwise use current host (works for both localhost and network access)
  // This allows the reverse proxy on port 80 to handle routing
  return window.location.origin;
};

const API_BASE = getApiBaseUrl();

export const API_URLS = {
  AUTH: process.env.REACT_APP_AUTH_API_URL || `${API_BASE}/api/auth`,
  MEDIA: process.env.REACT_APP_MEDIA_API_URL || `${API_BASE}/api/media`,
  CLOUD: process.env.REACT_APP_CLOUD_API_URL || `${API_BASE}/api/cloud`,
  PROPERTY: process.env.REACT_APP_PROPERTY_API_URL || `${API_BASE}/api/property`,
  SUPPLY: process.env.REACT_APP_SUPPLY_API_URL || `${API_BASE}/api/supply`,
  SERBISYO: process.env.REACT_APP_SERBISYO_API_URL || `${API_BASE}/api/serbisyo`,
};

// Backwards compatibility
export const API_URL = API_URLS.AUTH;
