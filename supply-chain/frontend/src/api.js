import axios from 'axios';

const host = window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname;
export const API_BASE = `http://${host}:5060/api`;

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

export const fetchDashboard = () => api.get('/dashboard').then((res) => res.data);
export const fetchProducts = () => api.get('/products').then((res) => res.data);
export const fetchSuppliers = () => api.get('/suppliers').then((res) => res.data);
export const fetchPurchaseOrders = () => api.get('/purchase-orders').then((res) => res.data);
export const fetchShipments = () => api.get('/shipments').then((res) => res.data);
export const createProduct = (payload) => api.post('/products', payload).then((res) => res.data);
export const createSupplier = (payload) => api.post('/suppliers', payload).then((res) => res.data);
export const createPurchaseOrder = (payload) => api.post('/purchase-orders', payload).then((res) => res.data);
export const recordMovement = (payload) => api.post('/inventory', payload).then((res) => res.data);
