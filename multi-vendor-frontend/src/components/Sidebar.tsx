import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Menu, ShoppingBag, Settings, LogOut, UtensilsCrossed } from 'lucide-react';

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('qb_token');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div style={{ background: 'var(--primary-color)', color: 'white', padding: '8px', borderRadius: '8px', display: 'flex' }}>
          <UtensilsCrossed size={20} />
        </div>
        QuickBite
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <NavLink to="/dashboard" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Home size={20} /> Dashboard
        </NavLink>
        <NavLink to="/dashboard/menu" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Menu size={20} /> Menu Management
        </NavLink>
        <NavLink to="/dashboard/orders" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <ShoppingBag size={20} /> Live Orders
        </NavLink>
        <NavLink to="/dashboard/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Settings size={20} /> Store Settings
        </NavLink>
      </nav>

      <button onClick={handleLogout} className="nav-item" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#dc2626', marginTop: 'auto' }}>
        <LogOut size={20} /> Sign Out
      </button>
    </aside>
  );
}
