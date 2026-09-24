import axios from 'axios';

// API URL - will connect to Monity World backend
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://monityworld.win';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(`[API Error] ${error.response.status}:`, error.response.data);
    } else if (error.request) {
      console.error('[API Error] No response received:', error.message);
    } else {
      console.error('[API Error]:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;

// Wallet APIs
export const walletApi = {
  getWallets: () => api.get('/wallets'),
  addWallet: (currency: string) => api.post('/wallets/add', { currency }),
  deleteWallet: (currency: string, convertTo?: string) => 
    api.delete('/wallets', { data: { currency, convert_to: convertTo } }),
};

// Transaction APIs
export const transactionApi = {
  getHistory: (page = 1, limit = 20) => 
    api.get(`/transactions/history?page=${page}&limit=${limit}`),
  transfer: (data: {
    receiver_phone?: string;
    receiver_account?: string;
    amount: number;
    currency: string;
    target_currency?: string;
    description?: string;
  }) => api.post('/transactions/transfer', data),
  recharge: (amount: number, currency: string, method: string) =>
    api.post('/transactions/recharge', { amount, currency, method }),
  withdraw: (amount: number, currency: string, method: string, destination: string) =>
    api.post('/transactions/withdraw', { amount, currency, method, destination }),
};

// Virtual Cards APIs
export const cardApi = {
  getCards: () => api.get('/virtual-cards'),
  createCard: (data: {
    name: string;
    currency: string;
    limit: number;
    can_send?: boolean;
    can_receive?: boolean;
  }) => api.post('/virtual-cards', data),
  updateCard: (cardId: string, data: any) => api.patch(`/virtual-cards/${cardId}`, data),
  rechargeCard: (cardId: string, amount: number) =>
    api.post(`/virtual-cards/${cardId}/recharge`, { amount }),
  getCardByNFC: (nfcSerial: string) => api.get(`/cards/nfc/${nfcSerial}`),
  getCardByBarcode: (barcode: string) => api.get(`/cards/barcode/${barcode}`),
};

// Savings APIs
export const savingsApi = {
  getSavings: () => api.get('/savings'),
  createSavings: (data: any) => api.post('/savings', data),
  depositSavings: (savingsId: string, amount: number) =>
    api.post(`/savings/${savingsId}/deposit`, { amount }),
  withdrawSavings: (savingsId: string, amount: number) =>
    api.post(`/savings/${savingsId}/withdraw`, { amount }),
};

// Groups (Cotisation) APIs
export const groupApi = {
  getGroups: () => api.get('/groups'),
  createGroup: (data: any) => api.post('/groups', data),
  joinGroup: (inviteCode: string) => api.post('/groups/join', { invite_code: inviteCode }),
  contributeToGroup: (groupId: string, amount: number) =>
    api.post(`/groups/${groupId}/contribute`, { amount }),
};

// Payment Links APIs
export const paymentLinkApi = {
  getLinks: () => api.get('/payment-links'),
  createLink: (data: any) => api.post('/payment-links', data),
  payLink: (linkCode: string, password: string) =>
    api.post(`/payment-links/${linkCode}/pay`, { password }),
};

// User/Profile APIs
export const userApi = {
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data: any) => api.patch('/auth/profile', data),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { current_password: currentPassword, new_password: newPassword }),
  toggle2FA: (enable: boolean) => api.post('/auth/toggle-2fa', { enable }),
};

// Countries & Currencies APIs
export const configApi = {
  getCountries: () => api.get('/countries'),
  getCurrencies: () => api.get('/currencies'),
};
