import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const authenticate = (data, next) => {
    if (typeof window !== 'undefined') {
        sessionStorage.setItem('token', JSON.stringify(data.token));
        sessionStorage.setItem('user', JSON.stringify(data.user));
    }
    if (typeof next === 'function') next();
};

export const getUser = () => {
    if (typeof window !== 'undefined') {
        try {
            const raw = sessionStorage.getItem('user') || localStorage.getItem('user');
            return raw ? JSON.parse(raw) : false;
        } catch (e) {
            return false;
        }
    }
    return false;
};

// remove token from session and local storage
export const logout = next => {
    if (typeof window !== 'undefined') {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
    if (typeof next === 'function') next();
};

export const getToken = () => {
    if (typeof window !== 'undefined') {
        const rawToken = sessionStorage.getItem('token') || localStorage.getItem('token');
        if (rawToken) {
            try {
                return JSON.parse(rawToken);
            } catch (e) {
                return rawToken;
            }
        }
        return false;
    }
    return false;
};

export const isOrderPaid = (status) => {
    if (!status) return false;
    const s = String(status).toLowerCase();
    return s === 'paid' || s === 'succeeded';
};

// existing exports continue below

export const getAdminConfig = () => {
    const token = getToken();
    const config = {
        withCredentials: true,
        headers: {}
    };
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
};

export const errMsg = (message = '') => toast.error(message, {
    position: 'bottom-center'
});
export const successMsg = (message = '') => toast.success(message, {
    position: 'bottom-center'
});
