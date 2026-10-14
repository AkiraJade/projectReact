import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { login, clearErrors } from '../../actions/userActions';
import AuthLayout from './AuthLayout';
import MetaData from '../Layout/MetaData';
import SocialLogin from './SocialLogin';
import { toast } from 'react-toastify';

const loginSchema = yup.object({
  email: yup
    .string()
    .email('VALID EMAIL FORMAT REQUIRED')
    .required('EMAIL ADDRESS IS REQUIRED'),
  password: yup
    .string()
    .min(6, 'PASSWORD MUST BE AT LEAST 6 CHARACTERS')
    .required('PASSWORD IS REQUIRED'),
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated, user, error, loading } = useSelector((state) => state.auth || {});

  const redirect = location.search ? new URLSearchParams(location.search).get('redirect') : '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  useEffect(() => {
    if (isAuthenticated) {
      if (redirect) {
        navigate(redirect.startsWith('/') ? redirect : `/${redirect}`);
      } else if (user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }

    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }
  }, [isAuthenticated, user, error, dispatch, navigate, redirect]);

  const onSubmit = ({ email, password }) => {
    dispatch(login(email, password));
  };

  return (
    <>
      <MetaData title="LOGIN — DOSNOVENTA®" />

      <AuthLayout
        title="WELCOME BACK."
        subtitle="Access your rider profile, frame builds, and order track records."
        imageSide="left"
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
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
              autoComplete="email"
              {...register('email')}
            />
            {errors.email && (
              <span className="ds-error-text">{errors.email.message}</span>
            )}
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
              autoComplete="current-password"
              {...register('password')}
            />
            <button
              type="button"
              className="ds-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'HIDE' : 'SHOW'}
            </button>
            {errors.password && (
              <span className="ds-error-text">{errors.password.message}</span>
            )}
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
        </form>

        {/* Firebase Social Login (Google + Facebook) */}
        <SocialLogin />

        {/* Bottom link to Register */}
        <div className="ds-auth-footer-prompt">
          DON'T HAVE AN ACCOUNT?
          <Link to="/register" className="ds-auth-footer-link">
            CREATE ACCOUNT →
          </Link>
        </div>
      </AuthLayout>
    </>
  );
};

export default Login;
