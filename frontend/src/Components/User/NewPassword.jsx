import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MetaData from '../Layout/MetaData';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const NewPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const navigate = useNavigate();
    const { token } = useParams();

    const resetPassword = async (resetToken, passwords) => {
        setLoading(true);
        setError('');
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            const { data } = await axios.put(`${import.meta.env.VITE_API}/password/reset/${resetToken}`, passwords, config);
            setSuccess(data.success);
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || 'Password reset failed';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (error) {
            toast.error(error, {
                position: 'bottom-right'
            });
            setError('');
        }
        if (success) {
            toast.success('Password updated successfully. Please log in with your new password.', {
                position: 'bottom-right'
            });
            navigate('/login');
        }
    }, [error, success, navigate]);

    const submitHandler = (e) => {
        e.preventDefault();
        if (!password || password.length < 6) {
            toast.error('Password must be at least 6 characters long', { position: 'bottom-right' });
            return;
        }
        if (password !== confirmPassword) {
            toast.error('Passwords do not match', { position: 'bottom-right' });
            return;
        }
        resetPassword(token, { password, confirmPassword });
    };

    return (
        <>
            <MetaData title={'New Password Reset'} />
            <div className="row wrapper">
                <div className="col-10 col-lg-5">
                    <form className="shadow-lg" onSubmit={submitHandler}>
                        <h1 className="mb-3">New Password</h1>

                        <div className="form-group">
                            <label htmlFor="password_field">Password</label>
                            <input
                                type="password"
                                id="password_field"
                                className="form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirm_password_field">Confirm Password</label>
                            <input
                                type="password"
                                id="confirm_password_field"
                                className="form-control"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            id="new_password_button"
                            type="submit"
                            disabled={loading}
                            className="btn btn-block py-3">
                            {loading ? 'Setting Password...' : 'Set Password'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default NewPassword;
