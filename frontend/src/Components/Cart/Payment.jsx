import React, { useState } from 'react'
import { useNavigate } from "react-router-dom";
import MetaData from '../Layout/MetaData'
import CheckoutSteps from './CheckoutSteps'
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getAdminConfig } from '../../Utils/helpers';

const Payment = ({ cartItems, shippingInfo, clearCart }) => {
    const [submitting, setSubmitting] = useState(false)
    let navigate = useNavigate();

    const orderInfo = JSON.parse(sessionStorage.getItem('orderInfo'));

    const submitHandler = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const order = {
            orderItems: cartItems,
            shippingInfo,
            paymentInfo: {
                id: 'COD-' + Date.now(),
                status: 'pending'
            }
        };

        try {
            const config = getAdminConfig();
            config.headers = {
                ...config.headers,
                'Content-Type': 'application/json'
            };

            const { data } = await axios.post(`${import.meta.env.VITE_API}/order/new`, order, config);

            if (data.success) {
                toast.success('Order placed successfully!', {
                    position: 'bottom-right'
                });
                sessionStorage.removeItem('orderInfo');
                if (clearCart) {
                    clearCart();
                }
                navigate('/success');
            }
        } catch (error) {
            setSubmitting(false);
            const message = error.response?.data?.message || error.message;
            toast.error(message, {
                position: 'bottom-right'
            });
        }
    };

    return (
        <>
            <MetaData title={'Payment — DOSNOVENTA®'} />
            <CheckoutSteps shipping confirmOrder payment />
            <div className="row wrapper">
                <div className="col-10 col-lg-5">
                    <form className="shadow-lg" onSubmit={submitHandler}>
                        <h1 className="mb-4">Order Checkout</h1>
                        
                        <div className="alert alert-dark mb-4" role="alert" style={{ background: '#17191d', border: '1px solid #2a2d34', color: '#f6f5f1' }}>
                            <h6 className="alert-heading font-weight-bold">PAYMENT METHOD: CASH ON DELIVERY / ATELIER DISPATCH</h6>
                            <p className="mb-0 small text-muted">
                                Standard courier and freight delivery with payment settlement upon arrival. To confirm direct atelier bank transfers, contact our Barcelona Concierge.
                            </p>
                        </div>

                        <div className="form-group">
                            <label htmlFor="notes_field">Order Notes / Delivery Instructions (Optional)</label>
                            <input
                                type="text"
                                id="notes_field"
                                className="form-control"
                                placeholder="E.g., Gate code, call before delivery"
                            />
                        </div>

                        <button
                            id="pay_btn"
                            type="submit"
                            className="btn btn-block py-3"
                            disabled={submitting || !cartItems || cartItems.length === 0}
                        >
                            {submitting ? 'RESERVING INVENTORY & PLACING ORDER...' : `CONFIRM ORDER — $${orderInfo?.totalPrice || '0.00'}`}
                        </button>

                    </form>
                </div>
            </div>

        </>
    )
}

export default Payment