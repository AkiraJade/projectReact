import React, { useState, useEffect } from 'react';
import MetaData from '../Layout/MetaData';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux';
import { forgotPassword, clearErrors } from '../../actions/userActions';

const ForgotPassword = () => {
    const dispatch = useDispatch();
    const { error, loading, message } = useSelector(state => state.forgotPassword || {});
    const [email, setEmail] = useState('');

    useEffect(() => {
        if (error) {
            toast.error(error, {
                position: 'bottom-right'
            });
            dispatch(clearErrors());
        }
        if (message) {
            toast.success(message, {
                position: 'bottom-right'
            });
        }
    }, [dispatch, error, message]);

    const submitHandler = (e) => {
        e.preventDefault();
        if (!email.trim()) {
            toast.error('Please enter your email address', { position: 'bottom-right' });
            return;
        }
        dispatch(forgotPassword({ email: email.trim() }));
    };

    return (
        <>
            <MetaData title={'Forgot Password'} />
            <div className="row wrapper">
                <div className="col-10 col-lg-5">
                    <form className="shadow-lg" onSubmit={submitHandler}>
                        <h1 className="mb-3">Forgot Password</h1>
                        <div className="form-group">
                            <label htmlFor="email_field">Enter Email</label>
                            <input
                                type="email"
                                id="email_field"
                                className="form-control"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                required
                            />
                        </div>

                        <button
                            id="forgot_password_button"
                            type="submit"
                            className="btn btn-block py-3"
                            disabled={loading ? true : false}>
                            {loading ? 'Sending Recovery Email...' : 'Send Email'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default ForgotPassword;
