import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import CustomerNavbar from '../components/CustomerNavbar';
import CartDrawer from '../components/CartDrawer';

export default function CustomerLayout() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="customer-layout">
      <CustomerNavbar onCartClick={() => setIsCartOpen(true)} />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      
      {/* Simple Footer */}
      <footer style={{ background: 'white', padding: '2rem', textAlign: 'center', borderTop: '1px solid #e2e8f0', color: 'var(--text-light)', marginTop: 'auto' }}>
        <p>&copy; 2026 QuickBite SaaS Platform. All rights reserved.</p>
      </footer>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
