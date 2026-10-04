import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearErrors } from '../../actions/userActions';
import AuthLayout from './AuthLayout';
import MetaData from '../Layout/MetaData';
import { toast } from 'react-toastify';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated, error, loading } = useSelector((state) => state.auth || {});

  const redirect = location.search ? new URLSearchParams(location.search).get('redirect') : '';

  useEffect(() => {
    if (isAuthenticated) {
      if (redirect === 'shipping') {
        navigate(`/${redirect}`);
      } else {
        navigate('/');
      }
    }

    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }
  }, [isAuthenticated, error, dispatch, navigate, redirect]);

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'EMAIL ADDRESS IS REQUIRED';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'VALID EMAIL FORMAT REQUIRED';
    }
    if (!password) {
      errs.password = 'PASSWORD IS REQUIRED';
    } else if (password.length < 6) {
      errs.password = 'PASSWORD MUST BE AT LEAST 6 CHARACTERS';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (validate()) {
      dispatch(login(email, password));
    }
  };

  return (
    <>
      <MetaData title="LOGIN — DOSNOVENTA®" />

      <AuthLayout
        title="WELCOME BACK."
        subtitle="Access your rider profile, frame builds, and order track records."
        imageSide="left"
      >
        <form onSubmit={submitHandler} noValidate>
          {/* Email */}
          <div className="ds-form-group">
            <label className="ds-label" htmlFor="email">
              RIDER EMAIL
            </label>
            <input
              type="email"
              id="email"
              className={`ds-input ${errors.email ? 'ds-input-error' : ''}`}
              placeholder="rider@dosnoventabikes.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            {errors.email && <span className="ds-error-text">{errors.email}</span>}
          </div>

          {/* Password */}
          <div className="ds-form-group">
            <label className="ds-label" htmlFor="password">
              PASSWORD
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              className={`ds-input ${errors.password ? 'ds-input-error' : ''}`}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="ds-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'HIDE' : 'SHOW'}
            </button>
            {errors.password && <span className="ds-error-text">{errors.password}</span>}
          </div>

          {/* Actions meta row */}
          <div className="ds-auth-meta-row">
            <Link to="/password/forgot" className="ds-auth-link">
              FORGOT PASSWORD?
            </Link>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            className="ds-btn"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'AUTHENTICATING...' : 'LOG IN →'}
          </button>

          {/* Divider */}
          <div className="ds-auth-divider">
            <span>OR CONTINUE WITH</span>
          </div>

          {/* OAuth Buttons */}
          <div className="ds-auth-socials">
            <button
              type="button"
              className="ds-social-btn"
              onClick={() => toast.info('Third-party authentication will be enabled in Phase 2.')}
            >
              <span>GOOGLE</span>
            </button>
            <button
              type="button"
              className="ds-social-btn"
              onClick={() => toast.info('Apple ID authentication will be enabled in Phase 2.')}
            >
              <span>APPLE</span>
            </button>
          </div>

          {/* Bottom link to Register */}
          <div className="ds-auth-footer-prompt">
            DON'T HAVE AN ACCOUNT?
            <Link to="/register" className="ds-auth-footer-link">
              CREATE ACCOUNT →
            </Link>
          </div>
        </form>
      </AuthLayout>
    </>
  );
};

export default Login;
