/**
 * API utility with automatic token injection
 * All API calls made through this utility automatically include the JWT token
 */

export const apiFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return response;
};

/**
 * GET request with auto token injection
 */
export const apiGet = async (url) => {
  const response = await apiFetch(url, { method: 'GET' });
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

/**
 * POST request with auto token injection
 */
export const apiPost = async (url, data) => {
  const response = await apiFetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

/**
 * PUT request with auto token injection
 */
export const apiPut = async (url, data) => {
  const response = await apiFetch(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

/**
 * DELETE request with auto token injection
 */
export const apiDelete = async (url) => {
  const response = await apiFetch(url, { method: 'DELETE' });
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

/**
 * Generic fetch wrapper that doesn't throw on non-ok responses
 * Useful when you want to handle responses manually
 */
export const apiRequest = apiFetch;
