// API Configuration
const API_PORT = import.meta.env.VITE_API_PORT || '5002';
const API_HOST = import.meta.env.VITE_API_HOST || 'localhost';

export const API_BASE_URL = `http://${API_HOST}:${API_PORT}/api`;
export const API_INTERVIEW_URL = `${API_BASE_URL}/interview`;
export const API_VIDEOS_URL = `${API_BASE_URL}/videos`;
export const API_JOBS_URL = `${API_BASE_URL}/jobs`;
export const API_APPLICATIONS_URL = `${API_BASE_URL}/applications`;

export default API_BASE_URL;

// Error handling utilities
export const getErrorMessage = (error) => {
    if (error.response) {
        // Server responded with error
        return error.response.data?.error || error.response.data?.message || 'Server error occurred';
    } else if (error.request) {
        // Request made but no response
        return 'Unable to connect to server. Please check your connection.';
    } else {
        // Something else happened
        return error.message || 'An unexpected error occurred';
    }
};

export const handleApiError = (error, defaultMessage = 'An error occurred') => {
    console.error('API Error:', error);
    return getErrorMessage(error) || defaultMessage;
};

// API helper functions
export const apiGet = async (url, config = {}) => {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...config.headers,
            },
            ...config,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || error.message || `HTTP ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
};

export const apiPost = async (url, data, config = {}) => {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...config.headers,
            },
            body: JSON.stringify(data),
            ...config,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || error.message || `HTTP ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
};

