const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

class ApiClient {
  constructor() {
    this.base = API_BASE;
  }

  getToken() {
    return localStorage.getItem('access_token');
  }

  setTokens(access, refresh) {
    localStorage.setItem('access_token', access);
    if (refresh) localStorage.setItem('refresh_token', refresh);
  }

  clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  async request(path, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    const token = this.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${this.base}${path}`, { ...options, headers });

    if (res.status === 401 && !path.includes('/auth/')) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        headers.Authorization = `Bearer ${this.getToken()}`;
        const retry = await fetch(`${this.base}${path}`, { ...options, headers });
        if (!retry.ok) throw await this._error(retry);
        return retry.status === 204 ? null : retry.json();
      }
      this.clearTokens();
      window.location.href = '/login';
      throw new Error('Session expired');
    }

    if (!res.ok) throw await this._error(res);
    return res.status === 204 ? null : res.json();
  }

  async _error(res) {
    const data = await res.json().catch(() => ({}));
    let errMsg = data.detail || data.error;
    if (!errMsg && typeof data === 'object' && data !== null) {
      const firstKey = Object.keys(data)[0];
      if (firstKey) {
        const val = data[firstKey];
        errMsg = Array.isArray(val) ? val[0] : val;
      }
    }
    const err = new Error(errMsg || 'Request failed');
    err.data = data;
    err.status = res.status;
    return err;
  }

  async refreshToken() {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) return false;
    try {
      const data = await fetch(`${this.base}/auth/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      }).then((r) => r.json());
      if (data.access) {
        this.setTokens(data.access, refresh);
        return true;
      }
    } catch {
      return false;
    }
    return false;
  }

  login(username, password) {
    return this.request('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  register(data) {
    return this.request('/auth/register/', { method: 'POST', body: JSON.stringify(data) });
  }

  me() {
    return this.request('/auth/me/');
  }

  getFeaturedProducts() {
    return this.request('/products/featured/');
  }

  getProducts(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/products/${qs ? `?${qs}` : ''}`);
  }

  getProduct(id) {
    return this.request(`/products/${id}/`);
  }

  approveProduct(id) {
    return this.request(`/products/${id}/approve/`, { method: 'POST' });
  }

  rejectProduct(id, reason) {
    return this.request(`/products/${id}/reject/`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }


  getMyProducts() {
    return this.request('/products/mine/');
  }

  createProduct(data) {
    return this.request('/products/', { method: 'POST', body: JSON.stringify(data) });
  }

  updateProduct(id, data) {
    return this.request(`/products/${id}/`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  deleteProduct(id) {
    return this.request(`/products/${id}/`, { method: 'DELETE' });
  }

  getWallet() {
    return this.request('/wallet/');
  }

  getWalletTransactions() {
    return this.request('/wallet/transactions/');
  }

  depositFunds(amount, method, phoneNumber = '') {
    return this.request('/wallet/deposit/', {
      method: 'POST',
      body: JSON.stringify({ amount, method, phone_number: phoneNumber }),
    });
  }

  withdrawFunds(amount, method, target) {
    return this.request('/wallet/withdraw/', {
      method: 'POST',
      body: JSON.stringify({ amount, method, target }),
    });
  }


  getCategories() {
    return this.request('/categories/');
  }

  getOrders() {
    return this.request('/orders/');
  }

  createOrder(data) {
    return this.request('/orders/', { method: 'POST', body: JSON.stringify(data) });
  }

  acceptOrder(id) {
    return this.request(`/orders/${id}/accept/`, { method: 'POST' });
  }

  rejectOrder(id) {
    return this.request(`/orders/${id}/reject/`, { method: 'POST' });
  }

  markOrderReady(id) {
    return this.request(`/orders/${id}/mark_ready/`, { method: 'POST' });
  }

  updateOrderStage(id, stage) {
    return this.request(`/orders/${id}/update_stage/`, {
      method: 'POST',
      body: JSON.stringify({ stage }),
    });
  }

  payOrder(id, phone) {
    return this.request(`/orders/${id}/pay/`, {
      method: 'POST',
      body: JSON.stringify({ phone_number: phone }),
    });
  }

  simulateMpesaCallback(id) {
    return this.request(`/orders/${id}/simulate_mpesa_callback/`, { method: 'POST' });
  }

  simulateFlutterwaveCallback(id) {
    return this.request(`/orders/${id}/simulate_flutterwave_callback/`, { method: 'POST' });
  }

  updateOrder(id, data) {
    return this.request(`/orders/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  getConversations() {
    return this.request('/conversations/');
  }

  startConversation(farmerId, productId) {
    return this.request('/conversations/', {
      method: 'POST',
      body: JSON.stringify({ farmer_id: farmerId, product_id: productId }),
    });
  }

  sendMessage(convId, content) {
    return this.request(`/conversations/${convId}/send_message/`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  getDeliveries(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/deliveries/${qs ? `?${qs}` : ''}`);
  }

  acceptDelivery(id) {
    return this.request(`/deliveries/${id}/accept/`, { method: 'POST' });
  }

  updateDeliveryStatus(id, status) {
    return this.request(`/deliveries/${id}/update_status/`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  }

  predictPrice(crop, county, weeks = 3) {
    return this.request(`/ai/predict/?crop=${crop}&county=${county}&weeks=${weeks}`);
  }

  getAdvisory(crop, county) {
    return this.request(`/ai/advisory/?crop=${crop}&county=${county}`);
  }

  getWeather(county) {
    return this.request(`/ai/weather/?county=${county}`);
  }

  forgotPassword(email) {
    return this.request('/auth/forgot-password/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  verifyOtp(email, otp) {
    return this.request('/auth/verify-otp/', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  }

  resetPassword(email, otp, password) {
    return this.request('/auth/reset-password/', {
      method: 'POST',
      body: JSON.stringify({ email, otp, password }),
    });
  }

  getPredictions() {
    return this.request('/predictions/');
  }

  getDemand() {
    return this.request('/demand/');
  }

  getDashboardStats() {
    return this.request('/dashboard/stats/');
  }

  getUsers() {
    return this.request('/users/');
  }

  toggleUserActive(id) {
    return this.request(`/users/${id}/toggle_active/`, { method: 'POST' });
  }

  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    const headers = {};
    const token = this.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${this.base}/upload/`, {
      method: 'POST',
      headers,
      body: formData
    });

    if (!res.ok) throw await this._error(res);
    return res.json();
  }
}

export const api = new ApiClient();
export default api;

