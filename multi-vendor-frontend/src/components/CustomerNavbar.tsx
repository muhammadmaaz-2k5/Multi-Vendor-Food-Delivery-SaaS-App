import { Link } from 'react-router-dom';
import { ShoppingBag, User, UtensilsCrossed } from 'lucide-react';
import { useAppSelector } from '../store/hooks';

interface CustomerNavbarProps {
  onCartClick: () => void;
}

export default function CustomerNavbar({ onCartClick }: CustomerNavbarProps) {
  const totalItems = useAppSelector(state => state.cart.totalItems);
  return (
    <nav className="customer-navbar">
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ background: 'var(--primary-color)', color: 'white', padding: '8px', borderRadius: '8px', display: 'flex' }}>
          <UtensilsCrossed size={24} />
        </div>
        <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-color)' }}>QuickBite</span>
      </Link>

      <div className="nav-actions">
        <button className="cart-button" onClick={onCartClick}>
          <ShoppingBag size={20} />
          <span>Cart ({totalItems})</span>
        </button>
        <Link to="/login" className="btn-primary" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <User size={18} />
          Sign In
        </Link>
      </div>
    </nav>
  );
}
