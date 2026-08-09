import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { API_URL } from '../lib/api';

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      localStorage.setItem('qb_token', data.data.token);
      navigate('/register-restaurant');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="auth-wrapper">
      <div className="glass-container auth-card" style={{ maxWidth: '500px' }}>
        <div className="auth-header">
          <div style={{ display: 'inline-flex', padding: '12px', background: '#ffe6eb', borderRadius: '50%', color: 'var(--primary-color)', marginBottom: '1rem' }}>
            <UserPlus size={28} />
          </div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join QuickBite as a Restaurant Partner</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input 
                name="firstName"
                type="text" 
                className="form-input" 
                placeholder="John" 
                value={formData.firstName}
                onChange={handleChange}
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input 
                name="lastName"
                type="text" 
                className="form-input" 
                placeholder="Doe" 
                value={formData.lastName}
                onChange={handleChange}
                required 
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              name="email"
              type="email" 
              className="form-input" 
              placeholder="hello@quickbite.com" 
              value={formData.email}
              onChange={handleChange}
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              name="password"
              type="password" 
              className="form-input" 
              placeholder="••••••••" 
              value={formData.password}
              onChange={handleChange}
              required 
              minLength={8}
            />
          </div>

          {error && <p className="error-msg" style={{ marginBottom: '1rem' }}>{error}</p>}

          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
