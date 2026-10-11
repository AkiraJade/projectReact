import React from 'react';
import { Navigate } from 'react-router-dom';
import Loader from '../Layout/Loader';
import { useSelector } from 'react-redux';
import { getUser } from '../../Utils/helpers';

const ProtectedRoute = ({ children, isAdmin = false }) => {
    const { isAuthenticated, loading, user } = useSelector(state => state.auth || {});

    // Resolve user from Redux state or persisted session storage
    const sessionUser = getUser();
    const effectiveUser = user && (user._id || user.email) ? user : (sessionUser && (sessionUser._id || sessionUser.email) ? sessionUser : null);
    const effectiveAuth = isAuthenticated || !!effectiveUser;

    // Only display spinner if active asynchronous loading is occurring AND no user is known yet
    if (loading === true && !effectiveUser) {
        return <Loader />;
    }

    // Unauthenticated user -> redirect to login immediately
    if (!effectiveAuth || !effectiveUser) {
        return <Navigate to="/login" replace />;
    }

    // Role unauthorized -> redirect to home immediately
    if (isAdmin === true && effectiveUser.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;