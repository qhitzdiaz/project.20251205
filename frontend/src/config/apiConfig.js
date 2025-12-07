// Dynamic API URL configuration
// Allows accessing from both localhost and homelab network

const getApiBaseUrl = () => {
  const hostname = window.location.hostname;

  // If accessing via localhost, use localhost for APIs
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'localhost';
  }

  // If accessing via IP address (homelab), use the same IP for APIs
  return hostname;
};

const baseHost = getApiBaseUrl();

export const API_URLS = {
  AUTH: `http://${baseHost}:5010/api`,
  MEDIA: `http://${baseHost}:5011/api`,
  CLOUD: `http://${baseHost}:5012/api`,
  DENTAL: `http://${baseHost}:5013/api`,
  SUPPLY: `http://${baseHost}:5060/api`,
};

// Backwards compatibility
export const API_URL = API_URLS.AUTH;
