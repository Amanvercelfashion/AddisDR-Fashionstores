import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

api.interceptors.response.use(
  res => res.data,
  err => {
    const msg = err?.response?.data?.error || err.message || 'Something went wrong';
    return Promise.reject(new Error(msg));
  }
);

// ── Business context helper ───────────────────────────────────────────────────
// Pass business_id via header for all tenant-scoped requests
function bizHeaders(businessId) {
  return { headers: { 'x-business-id': String(businessId) } };
}

// ── Business (public info) ────────────────────────────────────────────────────
export const getBusiness = (businessId) =>
  api.get('/business', bizHeaders(businessId));

export const getBusinessBySubdomain = (subdomain) =>
  api.get(`/business/by-subdomain/${subdomain}`);

// ── Categories ────────────────────────────────────────────────────────────────
export const getCategories = (businessId) =>
  api.get('/categories', bizHeaders(businessId));

export const createCategory = (businessId, data) =>
  api.post('/categories', data, bizHeaders(businessId));

export const updateCategory = (businessId, id, data) =>
  api.put(`/categories/${id}`, data, bizHeaders(businessId));

export const deleteCategory = (businessId, id) =>
  api.delete(`/categories/${id}`, bizHeaders(businessId));

// ── Products ──────────────────────────────────────────────────────────────────
export const getProducts = (businessId, params) =>
  api.get('/products', { ...bizHeaders(businessId), params });

export const getProductsAdmin = (businessId) =>
  api.get('/products/admin', bizHeaders(businessId));

export const getProductQuestions = (businessId, id) =>
  api.get(`/products/${id}/questions`, bizHeaders(businessId));

export const createProduct = (businessId, formData) =>
  api.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data', 'x-business-id': String(businessId) }
  });

export const updateProduct = (businessId, id, formData) =>
  api.put(`/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data', 'x-business-id': String(businessId) }
  });

export const toggleVisibility = (businessId, id) =>
  api.patch(`/products/${id}/visibility`, {}, bizHeaders(businessId));

export const deleteProduct = (businessId, id) =>
  api.delete(`/products/${id}`, bizHeaders(businessId));

export const addQuestion = (businessId, productId, data) =>
  api.post(`/products/${productId}/questions`, data, bizHeaders(businessId));

export const deleteQuestion = (businessId, qid) =>
  api.delete(`/products/questions/${qid}`, bizHeaders(businessId));

// ── Orders ────────────────────────────────────────────────────────────────────
export const submitOrder = (businessId, data) =>
  api.post('/orders', data, bizHeaders(businessId));

export const getOrders = (businessId) =>
  api.get('/orders', bizHeaders(businessId));

export const getOrder = (businessId, id) =>
  api.get(`/orders/${id}`, bizHeaders(businessId));

// ── Analytics ─────────────────────────────────────────────────────────────────
export const getAnalyticsOverview = (businessId) =>
  api.get('/analytics/overview', bizHeaders(businessId));

export const getTopProducts = (businessId) =>
  api.get('/analytics/top-products', bizHeaders(businessId));

export const getDailyChart = (businessId) =>
  api.get('/analytics/daily-chart', bizHeaders(businessId));

// ── Super Admin ───────────────────────────────────────────────────────────────
const superAdminApi = axios.create({ baseURL: '/api/superadmin', timeout: 15000 });
superAdminApi.interceptors.response.use(
  res => res.data,
  err => {
    const msg = err?.response?.data?.error || err.message || 'Something went wrong';
    return Promise.reject(new Error(msg));
  }
);

function saHeaders(token) {
  return { headers: { 'x-super-admin': token } };
}

export const superAdminLogin = (username, password) =>
  superAdminApi.post('/login', { username, password });

export const saGetStats = (token) =>
  superAdminApi.get('/stats', saHeaders(token));

export const saGetBusinesses = (token) =>
  superAdminApi.get('/businesses', saHeaders(token));

export const saGetBusiness = (token, id) =>
  superAdminApi.get(`/businesses/${id}`, saHeaders(token));

export const saCreateBusiness = (token, formData) =>
  superAdminApi.post('/businesses', formData, {
    headers: { 'Content-Type': 'multipart/form-data', 'x-super-admin': token }
  });

export const saUpdateBusiness = (token, id, formData) =>
  superAdminApi.put(`/businesses/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data', 'x-super-admin': token }
  });

export const saToggleStatus = (token, id, status) =>
  superAdminApi.patch(`/businesses/${id}/status`, { status }, saHeaders(token));

export const saSetAdminPassword = (token, id, password) =>
  superAdminApi.patch(`/businesses/${id}/admin-password`, { password }, saHeaders(token));

export const saDeleteBusiness = (token, id) =>
  superAdminApi.delete(`/businesses/${id}`, saHeaders(token));
