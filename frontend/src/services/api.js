const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Get auth token from localStorage
function getAuthToken() {
  return localStorage.getItem('authToken');
}

// Set auth token
function setAuthToken(token) {
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
}

// API request helper
async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Token expired or invalid
    setAuthToken(null);
    throw new Error('Authentication required');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// Auth API
export const authAPI = {
  register: async (email, password) => {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  login: async (email, password) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  logout: () => {
    setAuthToken(null);
  },

  getMe: () => apiRequest('/auth/me'),

  getTikTokAuthUrl: (account = 'primary') => {
    return apiRequest(`/auth/tiktok/login?account=${account}`);
  },

  getTikTokStatus: (account = 'primary') => {
    return apiRequest(`/auth/tiktok/status?account=${account}`);
  },

  disconnectTikTok: (account = 'primary') => {
    return apiRequest(`/auth/tiktok/disconnect?account=${account}`, {
      method: 'DELETE',
    });
  },
};

// Posts API
export const postsAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.platform) params.append('platform', filters.platform);
    const query = params.toString();
    return apiRequest(`/posts${query ? `?${query}` : ''}`);
  },

  getById: (id) => apiRequest(`/posts/${id}`),

  create: async (postData) => {
    return apiRequest('/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  },

  update: (id, postData) => {
    return apiRequest(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
    });
  },

  delete: (id) => {
    return apiRequest(`/posts/${id}`, {
      method: 'DELETE',
    });
  },
};

// Upload API
export const uploadAPI = {
  uploadVideo: async (file, account = 'primary', title = 'Untitled') => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const formData = new FormData();
    formData.append('video', file);
    formData.append('account', account);
    formData.append('title', title);

    const response = await fetch(`${API_BASE_URL}/upload/video`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || 'Upload failed');
    }

    return response.json();
  },

  uploadAndPublish: async (file, account = 'primary', title = 'Untitled', caption = '') => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const formData = new FormData();
    formData.append('video', file);
    formData.append('account', account);
    formData.append('title', title);
    formData.append('caption', caption);

    const response = await fetch(`${API_BASE_URL}/upload/video/publish`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload and publish failed' }));
      throw new Error(error.error || 'Upload and publish failed');
    }

    return response.json();
  },

  deleteVideo: (filename) => {
    return apiRequest(`/upload/video/${filename}`, {
      method: 'DELETE',
    });
  },
};

export { getAuthToken, setAuthToken };

