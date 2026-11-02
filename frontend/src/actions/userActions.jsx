import axios from 'axios';
import { getToken } from '../Utils/helpers';
import {
    LOGIN_REQUEST,
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    REGISTER_USER_REQUEST,
    REGISTER_USER_SUCCESS,
    REGISTER_USER_FAIL,
    LOAD_USER_REQUEST,
    LOAD_USER_SUCCESS,
    LOAD_USER_FAIL,
    LOGOUT_SUCCESS,
    LOGOUT_FAIL,
    UPDATE_PROFILE_REQUEST,
    UPDATE_PROFILE_SUCCESS,
    UPDATE_PROFILE_FAIL,
    UPDATE_PASSWORD_REQUEST,
    UPDATE_PASSWORD_SUCCESS,
    UPDATE_PASSWORD_FAIL,
    FORGOT_PASSWORD_REQUEST,
    FORGOT_PASSWORD_SUCCESS,
    FORGOT_PASSWORD_FAIL,
    NEW_PASSWORD_REQUEST,
    NEW_PASSWORD_SUCCESS,
    NEW_PASSWORD_FAIL,
    CLEAR_ERRORS
} from '../constants/userConstants';

export const register = (userData) => async (dispatch) => {
    try {
        dispatch({ type: REGISTER_USER_REQUEST });
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            withCredentials: true
        };
        const { data } = await axios.post(`${import.meta.env.VITE_API}/register`, userData, config);

        // Registration now requires email verification — do NOT store token or set auth
        dispatch({
            type: REGISTER_USER_SUCCESS,
            payload: data.message  // just the success message
        });
    } catch (error) {
        dispatch({
            type: REGISTER_USER_FAIL,
            payload: error.response?.data?.message || error.message
        });
    }
};

export const login = (email, password) => async (dispatch) => {
    try {
        dispatch({ type: LOGIN_REQUEST });
        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        };

        const { data } = await axios.post(`${import.meta.env.VITE_API}/login`, { email, password }, config);
        if (data.token && typeof window !== 'undefined') {
            sessionStorage.setItem('token', JSON.stringify(data.token));
            localStorage.setItem('token', data.token);
        }
        if (data.user && typeof window !== 'undefined') {
            sessionStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('user', JSON.stringify(data.user));
        }
        dispatch({
            type: LOGIN_SUCCESS,
            payload: data.user
        });
    } catch (error) {
        dispatch({
            type: LOGIN_FAIL,
            payload: error?.response?.data?.message || error.message
        });
    }
};

export const logout = () => async (dispatch) => {
    try {
        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        };
        await axios.get(`${import.meta.env.VITE_API}/logout`, config);
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        dispatch({
            type: LOGOUT_SUCCESS,
        });
    } catch (error) {
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        dispatch({
            type: LOGOUT_FAIL,
            payload: error?.response?.data?.message || error.message
        });
    }
};

export const loadUser = () => async (dispatch) => {
    try {
        const token = getToken();

        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        };
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        dispatch({ type: LOAD_USER_REQUEST });
        const { data } = await axios.get(`${import.meta.env.VITE_API}/me`, config);
        if (data.user && typeof window !== 'undefined') {
            sessionStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('user', JSON.stringify(data.user));
        }
        dispatch({
            type: LOAD_USER_SUCCESS,
            payload: data.user
        });
    } catch (error) {
        dispatch({
            type: LOAD_USER_FAIL,
            payload: error?.response?.data?.message || error.message
        });
    }
};

export const updateProfile = (userData) => async (dispatch) => {
    try {
        const token = getToken();

        dispatch({ type: UPDATE_PROFILE_REQUEST });
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            withCredentials: true,
        };
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        const { data } = await axios.put(`${import.meta.env.VITE_API}/me/update`, userData, config);

        if (data.user && typeof window !== 'undefined') {
            sessionStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('user', JSON.stringify(data.user));
            dispatch({
                type: LOAD_USER_SUCCESS,
                payload: data.user
            });
        }

        dispatch({
            type: UPDATE_PROFILE_SUCCESS,
            payload: data.success
        });
    } catch (error) {
        dispatch({
            type: UPDATE_PROFILE_FAIL,
            payload: error?.response?.data?.message || error.message
        });
    }
};

export const updatePassword = (passwords) => async (dispatch) => {
    try {
        dispatch({ type: UPDATE_PASSWORD_REQUEST });
        const token = getToken();
        const config = {
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true,
        };
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        const { data } = await axios.put(`${import.meta.env.VITE_API}/password/update`, passwords, config);
        dispatch({
            type: UPDATE_PASSWORD_SUCCESS,
            payload: data.success
        });
    } catch (error) {
        dispatch({
            type: UPDATE_PASSWORD_FAIL,
            payload: error?.response?.data?.message || error.message
        });
    }
};

export const forgotPassword = (emailData) => async (dispatch) => {
    try {
        dispatch({ type: FORGOT_PASSWORD_REQUEST });
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };
        const payload = typeof emailData === 'string' ? { email: emailData } : emailData;
        const { data } = await axios.post(`${import.meta.env.VITE_API}/password/forgot`, payload, config);
        dispatch({
            type: FORGOT_PASSWORD_SUCCESS,
            payload: data.message
        });
    } catch (error) {
        dispatch({
            type: FORGOT_PASSWORD_FAIL,
            payload: error?.response?.data?.message || error.message
        });
    }
};

export const resetPassword = (token, passwords) => async (dispatch) => {
    try {
        dispatch({ type: NEW_PASSWORD_REQUEST });
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };
        const { data } = await axios.put(`${import.meta.env.VITE_API}/password/reset/${token}`, passwords, config);
        dispatch({
            type: NEW_PASSWORD_SUCCESS,
            payload: data.success
        });
    } catch (error) {
        dispatch({
            type: NEW_PASSWORD_FAIL,
            payload: error?.response?.data?.message || error.message
        });
    }
};

export const clearErrors = () => async (dispatch) => {
    dispatch({
        type: CLEAR_ERRORS
    });
};
