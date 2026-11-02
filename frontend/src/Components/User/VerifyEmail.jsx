import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function VerifyEmail() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('');

    // Resend state
    const [resendEmail, setResendEmail] = useState('');
    const [resendStatus, setResendStatus] = useState('idle'); // idle | sending | sent | error
    const [resendMsg, setResendMsg] = useState('');

    useEffect(() => {
        const verify = async () => {
            try {
                const { data } = await axios.get(
                    `${import.meta.env.VITE_API}/verify/${token}`
                );
                setStatus('success');
                setMessage(data.message || 'Email verified successfully!');
                setTimeout(() => navigate('/login'), 3000);
            } catch (err) {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Invalid or expired verification link.');
            }
        };
        verify();
    }, [token, navigate]);

    const handleResend = async (e) => {
        e.preventDefault();
        if (!resendEmail) return;
        setResendStatus('sending');
        try {
            const { data } = await axios.post(
                `${import.meta.env.VITE_API}/resend-verification`,
                { email: resendEmail },
                { headers: { 'Content-Type': 'application/json' } }
            );
            setResendStatus('sent');
            setResendMsg(data.message);
        } catch (err) {
            setResendStatus('error');
            setResendMsg(err.response?.data?.message || 'Failed to resend. Try again.');
        }
    };

    const card = {
        background: '#111',
        border: '1px solid #1e1e1e',
        borderRadius: '4px',
        padding: '48px 40px',
        maxWidth: '440px',
        width: '100%',
        textAlign: 'center',
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0a0a0a',
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            padding: '24px',
        }}>
            {/* Logo */}
            <div style={{ marginBottom: '36px', textAlign: 'center' }}>
                <div style={{ color: '#fff', fontSize: '18px', letterSpacing: '6px', fontWeight: 300 }}>DOSNOVENTA</div>
                <div style={{ color: '#444', fontSize: '9px', letterSpacing: '3px', marginTop: '4px' }}>FIXED GEAR BICYCLES</div>
            </div>

            <div style={card}>
                {/* Top accent bar */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: '#fff', borderRadius: '4px 4px 0 0' }} />

                {/* ── LOADING ─── */}
                {status === 'loading' && (
                    <>
                        <div style={{
                            width: '40px', height: '40px',
                            border: '2px solid #222',
                            borderTop: '2px solid #fff',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite',
                            margin: '0 auto 24px',
                        }} />
                        <p style={{ color: '#888', fontSize: '13px', letterSpacing: '1px' }}>VERIFYING YOUR EMAIL…</p>
                    </>
                )}

                {/* ── SUCCESS ─── */}
                {status === 'success' && (
                    <>
                        <div style={{
                            width: '52px', height: '52px',
                            border: '1px solid #2a2a2a',
                            borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 24px',
                            fontSize: '22px', color: '#fff',
                        }}>✓</div>
                        <p style={{ color: '#444', fontSize: '9px', letterSpacing: '3px', margin: '0 0 16px' }}>VERIFIED</p>
                        <h2 style={{ color: '#fff', fontWeight: 300, fontSize: '22px', margin: '0 0 12px' }}>
                            Email Confirmed
                        </h2>
                        <p style={{ color: '#888', fontSize: '13px', lineHeight: 1.7, margin: '0 0 32px' }}>
                            {message}<br />Redirecting you to login…
                        </p>
                        <Link to="/login" style={{
                            display: 'inline-block',
                            padding: '14px 36px',
                            background: '#fff',
                            color: '#000',
                            fontWeight: 700,
                            fontSize: '11px',
                            letterSpacing: '2px',
                            borderRadius: '2px',
                            textDecoration: 'none',
                        }}>LOG IN NOW</Link>
                    </>
                )}

                {/* ── ERROR ─── */}
                {status === 'error' && (
                    <>
                        <div style={{
                            width: '52px', height: '52px',
                            border: '1px solid #2a2a2a',
                            borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 24px',
                            fontSize: '20px', color: '#888',
                        }}>✕</div>
                        <p style={{ color: '#444', fontSize: '9px', letterSpacing: '3px', margin: '0 0 16px' }}>LINK EXPIRED</p>
                        <h2 style={{ color: '#fff', fontWeight: 300, fontSize: '22px', margin: '0 0 12px' }}>
                            Verification Failed
                        </h2>
                        <p style={{ color: '#888', fontSize: '13px', lineHeight: 1.7, margin: '0 0 32px' }}>
                            {message}<br />Enter your email below to receive a fresh link.
                        </p>

                        {/* Divider */}
                        <div style={{ borderTop: '1px solid #1e1e1e', margin: '0 0 28px' }} />

                        {resendStatus === 'sent' ? (
                            <p style={{ color: '#aaa', fontSize: '13px', lineHeight: 1.7 }}>
                                ✓ &nbsp;{resendMsg}
                            </p>
                        ) : (
                            <form onSubmit={handleResend} style={{ textAlign: 'left' }}>
                                <label style={{ color: '#555', fontSize: '9px', letterSpacing: '2px', display: 'block', marginBottom: '8px' }}>
                                    YOUR EMAIL
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={resendEmail}
                                    onChange={e => setResendEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    style={{
                                        width: '100%', boxSizing: 'border-box',
                                        background: '#0a0a0a', border: '1px solid #222',
                                        color: '#fff', padding: '12px 14px',
                                        fontSize: '13px', borderRadius: '2px',
                                        outline: 'none', marginBottom: '16px',
                                    }}
                                />
                                {resendStatus === 'error' && (
                                    <p style={{ color: '#c0392b', fontSize: '12px', margin: '0 0 12px' }}>{resendMsg}</p>
                                )}
                                <button
                                    type="submit"
                                    disabled={resendStatus === 'sending'}
                                    style={{
                                        width: '100%', padding: '14px',
                                        background: resendStatus === 'sending' ? '#333' : '#fff',
                                        color: '#000', border: 'none',
                                        fontSize: '11px', fontWeight: 700,
                                        letterSpacing: '2px', borderRadius: '2px',
                                        cursor: resendStatus === 'sending' ? 'not-allowed' : 'pointer',
                                    }}
                                >
                                    {resendStatus === 'sending' ? 'SENDING…' : 'RESEND VERIFICATION EMAIL'}
                                </button>
                            </form>
                        )}
                    </>
                )}
            </div>

            {/* Footer */}
            <p style={{ color: '#2a2a2a', fontSize: '10px', letterSpacing: '2px', marginTop: '28px' }}>
                DOSNOVENTA · BARCELONA
            </p>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                input::placeholder { color: #333; }
            `}</style>
        </div>
    );
}
