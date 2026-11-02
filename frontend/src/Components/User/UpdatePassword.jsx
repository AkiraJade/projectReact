import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MetaData from '../Layout/MetaData';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux';
import { updatePassword, clearErrors } from '../../actions/userActions';
import { UPDATE_PASSWORD_RESET } from '../../constants/userConstants';

const UpdatePassword = () => {
    const dispatch = useDispatch();
    const { error, isUpdated, loading } = useSelector(state => state.user || {});

    const [oldPassword, setOldPassword] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (error) {
            toast.error(error, { position: 'bottom-right' });
            dispatch(clearErrors());
        }
        if (isUpdated) {
            toast.success('Password updated successfully', { position: 'bottom-right' });
            dispatch({ type: UPDATE_PASSWORD_RESET });
            navigate('/me');
        }
    }, [dispatch, error, navigate, isUpdated]);

    const submitHandler = (e) => {
        e.preventDefault();
        if (!oldPassword) {
            toast.error('Please enter your current password', { position: 'bottom-right' });
            return;
        }
        if (!password || password.length < 6) {
            toast.error('New password must be at least 6 characters long', { position: 'bottom-right' });
            return;
        }

        dispatch(updatePassword({ oldPassword, password }));
    };

    return (
        <>
            <MetaData title={'Change Password'} />

            <div className="row wrapper">
                <div className="col-10 col-lg-5">
                    <form className="shadow-lg" onSubmit={submitHandler}>
                        <h1 className="mt-2 mb-5">Update Password</h1>
                        <div className="form-group">
                            <label htmlFor="old_password_field">Old Password</label>
                            <input
                                type="password"
                                id="old_password_field"
                                className="form-control"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="new_password_field">New Password</label>
                            <input
                                type="password"
                                id="new_password_field"
                                className="form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-block py-3"
                            disabled={loading ? true : false}>
                            {loading ? 'Updating Password...' : 'Update Password'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default UpdatePassword;
