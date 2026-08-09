import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, ChefHat, CheckCircle } from 'lucide-react';
import { API_URL, getAuthHeaders } from '../lib/api';

export default function RegisterRestaurant() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/restaurants/register`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name, description }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          navigate('/login');
          throw new Error('Please login first');
        }
        throw new Error(data.message || 'Failed to register restaurant');
      }

      setIsSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="auth-wrapper">
        <div className="glass-container auth-card" style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', padding: '16px', background: '#dcfce7', borderRadius: '50%', color: '#16a34a', marginBottom: '1.5rem' }}>
            <CheckCircle size={40} />
          </div>
          <h1 className="auth-title">Store Created!</h1>
          <p className="auth-subtitle">Your restaurant is now live on QuickBite.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrapper">
      <div className="glass-container auth-card" style={{ maxWidth: '600px' }}>
        <div className="auth-header">
          <div style={{ display: 'inline-flex', padding: '12px', background: '#ffe6eb', borderRadius: '50%', color: 'var(--primary-color)', marginBottom: '1rem' }}>
            <Store size={28} />
          </div>
          <h1 className="auth-title">Setup your Restaurant</h1>
          <p className="auth-subtitle">Tell us about your awesome food business</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Restaurant Name</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '12px', left: '12px', color: '#94a3b8' }}>
                <ChefHat size={20} />
              </div>
              <input 
                type="text" 
                className="form-input" 
                style={{ paddingLeft: '2.5rem' }}
                placeholder="e.g. Spicy Kitchen" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Short Description</label>
            <textarea 
              className="form-input" 
              placeholder="What kind of food do you serve?" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              style={{ resize: 'vertical' }}
            />
          </div>

          {error && <p className="error-msg" style={{ marginBottom: '1rem' }}>{error}</p>}

          <button type="submit" className="btn-primary" disabled={isLoading} style={{ marginTop: '1rem' }}>
            {isLoading ? 'Creating Storefront...' : 'Launch Restaurant'}
          </button>
        </form>
      </div>
    </div>
  );
}
