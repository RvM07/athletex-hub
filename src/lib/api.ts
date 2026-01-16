const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function for API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('athletex_token');
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

// Auth API
export const authAPI = {
  register: async (userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    plan?: string;
  }) => {
    const data = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (data.token) {
      localStorage.setItem('athletex_token', data.token);
      localStorage.setItem('athletex_user', JSON.stringify(data.user));
    }
    return data;
  },

  login: async (credentials: { email: string; password: string }) => {
    const data = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (data.token) {
      localStorage.setItem('athletex_token', data.token);
      localStorage.setItem('athletex_user', JSON.stringify(data.user));
    }
    return data;
  },

  logout: () => {
    localStorage.removeItem('athletex_token');
    localStorage.removeItem('athletex_user');
  },

  getCurrentUser: async () => {
    return apiCall('/auth/me');
  },

  getStoredUser: () => {
    const user = localStorage.getItem('athletex_user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('athletex_token');
  },
};

// Bookings API
export const bookingsAPI = {
  create: async (bookingData: {
    className: string;
    date: string;
    time: string;
    trainer?: string;
    notes?: string;
  }) => {
    return apiCall('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },

  getMyBookings: async () => {
    return apiCall('/bookings/my-bookings');
  },

  cancel: async (bookingId: string) => {
    return apiCall(`/bookings/${bookingId}/cancel`, {
      method: 'PATCH',
    });
  },
};

// Contact API
export const contactAPI = {
  submit: async (contactData: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }) => {
    return apiCall('/contact', {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  },
};

// Membership API
export const membershipAPI = {
  getPlans: async () => {
    return apiCall('/memberships/plans');
  },

  subscribe: async (planId: string) => {
    return apiCall('/memberships/subscribe', {
      method: 'POST',
      body: JSON.stringify({ planId }),
    });
  },

  getStatus: async () => {
    return apiCall('/memberships/status');
  },
};

export default {
  auth: authAPI,
  bookings: bookingsAPI,
  contact: contactAPI,
  membership: membershipAPI,
};
