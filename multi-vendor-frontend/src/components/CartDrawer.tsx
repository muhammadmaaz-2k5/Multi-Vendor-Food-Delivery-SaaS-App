import React from 'react';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { updateQuantity } from '../store/slices/cartSlice';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, cartTotal } = useAppSelector(state => state.cart);
  const dispatch = useAppDispatch();
  
  const handleUpdateQuantity = (id: string, quantity: number) => {
    dispatch(updateQuantity({ id, quantity }));
  };

  const DELIVERY_FEE = 150;
  const SERVICE_FEE = 30;
  const TAX_RATE = 0.16;

  const taxAmount = cartTotal * TAX_RATE;
  const grandTotal = cartTotal + DELIVERY_FEE + SERVICE_FEE + taxAmount;

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }} onClick={onClose}></div>
      
      <div style={{ position: 'relative', width: '100%', maxWidth: '400px', background: 'white', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 25px rgba(0,0,0,0.1)', animation: 'slideLeft 0.3s ease-out' }}>
        
        {/* Header */}
        <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingBag size={20} /> Your Order
          </h2>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-light)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Items List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-light)', marginTop: '2rem' }}>
              <ShoppingBag size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p>Your cart is empty.</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <h4 style={{ fontWeight: 700, margin: 0, color: 'var(--text-color)' }}>{item.name}</h4>
                    <span style={{ fontWeight: 600, color: 'var(--text-color)' }}>₨ {(item.totalPrice * item.quantity).toFixed(2)}</span>
                  </div>
                  
                  {item.modifiers.length > 0 && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '0.5rem' }}>
                      {item.modifiers.map(m => m.optionName).join(', ')}
                    </div>
                  )}

                  <div style={{ display: 'inline-flex', alignItems: 'center', background: '#f1f5f9', borderRadius: '9999px', padding: '2px', marginTop: '0.5rem' }}>
                    <button onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)} style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'white', borderRadius: '50%', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                      <Minus size={14} />
                    </button>
                    <span style={{ width: '32px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 600 }}>{item.quantity}</span>
                    <button onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)} style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'white', borderRadius: '50%', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer / Calculations */}
        {items.length > 0 && (
          <div style={{ padding: '1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-light)' }}>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-color)', fontWeight: 500 }}>
                <span>Tax (16% GST)</span>
                <span>₨ {taxAmount.toFixed(2)}</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 800 }}>
              <span>Total</span>
              <span>₨ {grandTotal.toFixed(2)}</span>
            </div>

            <button 
              onClick={() => {
                alert('Proceeding to Checkout! (Checkout Flow coming in next sprint)');
                onClose();
              }}
              style={{ width: '100%', padding: '1rem', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(225, 29, 72, 0.2)' }}
            >
              Go to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
