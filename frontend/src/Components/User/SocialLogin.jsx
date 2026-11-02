import React, { useState } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from 'firebase/auth';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loadUser } from '../../actions/userActions';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_APP_API_KEY,
    authDomain: import.meta.env.VITE_APP_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_APP_PROJECT_ID,
    storageBucket: import.meta.env.VITE_APP_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_APP_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_APP_APP_ID,
};

// Lazy initialization so missing API keys never crash the application on startup
let authInstance = null;
const getFirebaseAuth = () => {
    if (!authInstance) {
        const apiKey = import.meta.env.VITE_APP_API_KEY;
        if (!apiKey || apiKey.trim() === '') {
            throw new Error('Firebase configuration missing: please set VITE_APP_API_KEY in frontend/.env');
        }
        const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
        authInstance = getAuth(firebaseApp);
    }
    return authInstance;
};

const SocialLogin = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleSocialLogin = async (providerName) => {
        setLoading(true);
        setError('');
        try {
            const auth = getFirebaseAuth();
            const provider = providerName === 'google'
                ? new GoogleAuthProvider()
                : new FacebookAuthProvider();

            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Send user info to backend to create/login user and get JWT
            const { data } = await axios.post(
                `${import.meta.env.VITE_API}/auth/social-login`,
                {
                    name: user.displayName,
                    email: user.email,
                    avatar: user.photoURL,
                    uid: user.uid,
                    provider: providerName
                },
                { withCredentials: true }
            );

            if (data.success) {
                if (data.token) {
                    sessionStorage.setItem('token', JSON.stringify(data.token));
                    localStorage.setItem('token', data.token);
                }
                if (data.user) {
                    sessionStorage.setItem('user', JSON.stringify(data.user));
                    localStorage.setItem('user', JSON.stringify(data.user));
                }
                dispatch(loadUser());
                navigate('/');
            }
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || 'Social login failed';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ marginTop: '16px' }}>
            {error && (
                <div style={{
                    background: '#fee2e2', color: '#991b1b', padding: '10px 16px',
                    borderRadius: '6px', fontSize: '13px', marginBottom: '12px'
                }}>
                    {error}
                </div>
            )}

            {/* Divider */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '12px', margin: '8px 0 16px'
            }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.12)' }} />
                <span style={{ color: '#9ca3af', fontSize: '11px', letterSpacing: '1px', whiteSpace: 'nowrap' }}>OR CONTINUE WITH</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.12)' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Google Button */}
                <button
                    id="google-login-btn"
                    type="button"
                    onClick={() => handleSocialLogin('google')}
                    disabled={loading}
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                        width: '100%', padding: '11px 16px', border: '1.5px solid rgba(255,255,255,0.15)',
                        borderRadius: '6px', background: '#fff', cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '13px', fontWeight: '600', color: '#1f2937', transition: 'border-color 0.2s, box-shadow 0.2s'
                    }}
                >
                    {/* Google SVG Icon */}
                    <svg width="18" height="18" viewBox="0 0 48 48">
                        <path fill="#4285F4" d="M47.5 24.5c0-1.6-.1-3.1-.4-4.6H24v8.7h13.2c-.6 3-2.3 5.6-5 7.3v6h8.1c4.7-4.4 7.2-10.8 7.2-17.4z"/>
                        <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.8-5.8l-8.1-6c-2.1 1.4-4.8 2.3-7.7 2.3-5.9 0-10.9-4-12.7-9.3H3v6.2C6.8 42.7 14.9 48 24 48z"/>
                        <path fill="#FBBC05" d="M11.3 29.2c-.5-1.4-.7-2.8-.7-4.2s.3-2.9.7-4.2V14.6H3C1.1 18.1 0 21.9 0 26s1.1 7.9 3 11.4l8.3-8.2z"/>
                        <path fill="#EA4335" d="M24 9.5c3.3 0 6.3 1.1 8.6 3.3l6.4-6.4C34.9 2.8 29.8.5 24 .5 14.9.5 6.8 5.8 3 14.6l8.3 6.4C13.1 15.7 18.1 9.5 24 9.5z"/>
                    </svg>
                    {loading ? 'SIGNING IN...' : 'CONTINUE WITH GOOGLE'}
                </button>

                {/* Facebook Button */}
                <button
                    id="facebook-login-btn"
                    type="button"
                    onClick={() => handleSocialLogin('facebook')}
                    disabled={loading}
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                        width: '100%', padding: '11px 16px', border: 'none',
                        borderRadius: '6px', background: '#1877f2', cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '13px', fontWeight: '600', color: '#fff', transition: 'opacity 0.2s'
                    }}
                >
                    {/* Facebook SVG Icon */}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    {loading ? 'SIGNING IN...' : 'CONTINUE WITH FACEBOOK'}
                </button>
            </div>
        </div>
    );
};

export default SocialLogin;
