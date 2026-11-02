import axios from 'axios';
import { getToken } from '../Utils/helpers';

import {
    ALL_PRODUCTS_REQUEST,
    ALL_PRODUCTS_SUCCESS,
    ALL_PRODUCTS_FAIL,
    PRODUCT_DETAILS_REQUEST,
    PRODUCT_DETAILS_SUCCESS,
    PRODUCT_DETAILS_FAIL,
    NEW_PRODUCT_REQUEST,
    NEW_PRODUCT_SUCCESS,
    NEW_PRODUCT_FAIL,
    ADMIN_PRODUCTS_REQUEST,
    ADMIN_PRODUCTS_SUCCESS,
    ADMIN_PRODUCTS_FAIL,
    NEW_REVIEW_REQUEST,
    NEW_REVIEW_SUCCESS,
    NEW_REVIEW_FAIL,
    CLEAR_ERRORS
} from '../constants/productConstants';

export const getProducts = (currentPage = 1, keyword = '', price = [0, 1000000], category = '') => async (dispatch) => {
    try {
        dispatch({
            type: ALL_PRODUCTS_REQUEST
        });

        const minPrice = Array.isArray(price) && price.length > 0 ? price[0] : 0;
        const maxPrice = Array.isArray(price) && price.length > 1 ? price[1] : 1000000;

        let link = `${import.meta.env.VITE_API}/products?page=${currentPage}&keyword=${encodeURIComponent(keyword)}&price[lte]=${maxPrice}&price[gte]=${minPrice}`;

        if (category && category !== 'all') {
            link += `&category=${encodeURIComponent(category)}`;
        }
        const { data } = await axios.get(link);
        dispatch({
            type: ALL_PRODUCTS_SUCCESS,
            payload: data
        });

    } catch (error) {
        dispatch({
            type: ALL_PRODUCTS_FAIL,
            payload: error?.response?.data?.message || error.message
        });
    }
};

export const getProductDetails = (id) => async (dispatch) => {
    try {
        dispatch({ type: PRODUCT_DETAILS_REQUEST });
        const { data } = await axios.get(`${import.meta.env.VITE_API}/product/${id}`);
        dispatch({
            type: PRODUCT_DETAILS_SUCCESS,
            payload: data.product
        });
    } catch (error) {
        dispatch({
            type: PRODUCT_DETAILS_FAIL,
            payload: error?.response?.data?.message || error.message
        });
    }
};

export const newProduct = (productData) => async (dispatch) => {
    try {
        dispatch({ type: NEW_PRODUCT_REQUEST });
        const token = getToken();
        const config = {
            headers: {},
            withCredentials: true
        };
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        // Let axios set multipart boundary automatically when productData is FormData
        if (!(productData instanceof FormData)) {
            config.headers['Content-Type'] = 'application/json';
        }
        const { data } = await axios.post(`${import.meta.env.VITE_API}/admin/product/new`, productData, config);
        dispatch({
            type: NEW_PRODUCT_SUCCESS,
            payload: data
        });
    } catch (error) {
        dispatch({
            type: NEW_PRODUCT_FAIL,
            payload: error?.response?.data?.message || error.message
        });
    }
};

export const getAdminProducts = () => async (dispatch) => {
    try {
        dispatch({ type: ADMIN_PRODUCTS_REQUEST });
        const token = getToken();
        const config = {
            withCredentials: true,
            headers: {}
        };
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/products`, config);
        dispatch({
            type: ADMIN_PRODUCTS_SUCCESS,
            payload: data.products
        });
    } catch (error) {
        dispatch({
            type: ADMIN_PRODUCTS_FAIL,
            payload: error?.response?.data?.message || error.message
        });
    }
};

export const newReview = (reviewData) => async (dispatch) => {
    try {
        dispatch({ type: NEW_REVIEW_REQUEST });
        const token = getToken();
        const config = {
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true
        };
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        const { data } = await axios.put(`${import.meta.env.VITE_API}/review`, reviewData, config);
        dispatch({
            type: NEW_REVIEW_SUCCESS,
            payload: data.success
        });
    } catch (error) {
        dispatch({
            type: NEW_REVIEW_FAIL,
            payload: error?.response?.data?.message || error.message
        });
    }
};

export const clearErrors = () => async (dispatch) => {
    dispatch({
        type: CLEAR_ERRORS
    });
};
