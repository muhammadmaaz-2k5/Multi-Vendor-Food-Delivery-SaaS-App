import React, { useState } from 'react';
import { useAppSelector } from '../store/hooks';
import { MapPin, CreditCard, ChevronRight } from 'lucide-react';

export default function CustomerCheckout() {
  const { items, cartTotal } = useAppSelector(state => state.cart);

  const DELIVERY_FEE = 150;
  const SERVICE_FEE = 30;
  const TAX_RATE = 0.16;
  const taxAmount = cartTotal * TAX_RATE;
  const grandTotal = cartTotal + DELIVERY_FEE + SERVICE_FEE + taxAmount;

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    notes: ''
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/payments/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items, formData }),
      });

      const data = await response.json();
      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Failed to create checkout session.');
        setIsProcessing(false);
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <h2>Your cart is empty</h2>
        <p>Please add some items before checking out.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', display: 'flex', gap: '3rem', flexWrap: 'wrap', animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* Left Column: Form */}
      <div style={{ flex: '1 1 600px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem', color: 'var(--text-color)' }}>Checkout</h1>
        
        <form onSubmit={handleSubmit}>
          {/* Delivery Details */}
          <section style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={20} /> Delivery Details
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Full Name</label>
                <input required type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="search-input" style={{ width: '100%', boxSizing: 'border-box' }} placeholder="John Doe" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Phone Number</label>
                <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="search-input" style={{ width: '100%', boxSizing: 'border-box' }} placeholder="0300 1234567" />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Full Address</label>
              <input required type="text" name="address" value={formData.address} onChange={handleChange} className="search-input" style={{ width: '100%', boxSizing: 'border-box' }} placeholder="House 123, Street 4, Phase 5..." />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>City</label>
                <input required type="text" name="city" value={formData.city} onChange={handleChange} className="search-input" style={{ width: '100%', boxSizing: 'border-box' }} placeholder="Lahore" />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Delivery Notes (Optional)</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} className="search-input" style={{ width: '100%', minHeight: '80px', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} placeholder="E.g., Leave at the door..."></textarea>
            </div>
          </section>

          {/* Payment Section Placeholder */}
          <section style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={20} /> Payment Method
            </h2>
            <div style={{ padding: '2rem', border: '2px dashed #e2e8f0', borderRadius: '12px', textAlign: 'center', background: '#f8fafc' }}>
              <p style={{ color: 'var(--text-light)', fontWeight: 500, margin: 0 }}>Stripe Elements Integration (Coming in QB-402)</p>
            </div>
          </section>

          <button type="submit" disabled={isProcessing} style={{ width: '100%', padding: '1.25rem', background: isProcessing ? '#94a3b8' : 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 700, cursor: isProcessing ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', boxShadow: '0 10px 15px -3px rgba(225, 29, 72, 0.2)' }}>
            {isProcessing ? 'Processing...' : `Confirm & Pay ₨ ${grandTotal.toFixed(2)}`} {!isProcessing && <ChevronRight size={20} />}
          </button>
          
          {error && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: '#fef2f2', color: '#ef4444', borderRadius: '8px', border: '1px solid #f87171' }}>
              {error}
            </div>
          )}
        </form>
      </div>

      {/* Right Column: Order Summary */}
      <div style={{ flex: '1 1 350px' }}>
        <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', position: 'sticky', top: '100px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Order Summary</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', maxHeight: '300px', overflowY: 'auto' }}>
            {items.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                <div style={{ flex: 1, paddingRight: '1rem' }}>
                  <span style={{ fontWeight: 600 }}>{item.quantity}x</span> {item.name}
                  {item.modifiers.length > 0 && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                      {item.modifiers.map(m => m.optionName).join(', ')}
                    </div>
                  )}
                </div>
                <div style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>₨ {(item.totalPrice * item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.95rem', color: 'var(--text-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal</span>
              <span>₨ {cartTotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Delivery Fee</span>
              <span>₨ {DELIVERY_FEE.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Service Fee</span>
              <span>₨ {SERVICE_FEE.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Tax (16% GST)</span>
              <span>₨ {taxAmount.toFixed(2)}</span>
            </div>
          </div>
          
          <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '1.5rem', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-color)' }}>
            <span>Total</span>
            <span>₨ {grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
    </div>
  );
}
