import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { API_URL, getAuthHeaders } from '../lib/api';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const res = await fetch(`${API_URL}/restaurants/me`, {
          headers: getAuthHeaders(),
        });
        
        if (res.status === 401) {
          navigate('/login');
          return;
        }

        const data = await res.json();
        
        if (data.data.restaurants && data.data.restaurants.length > 0) {
          setRestaurant(data.data.restaurants[0]);
        } else {
          // If logged in but no restaurant, send them to onboarding
          navigate('/register-restaurant');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurant();
  }, [navigate]);

  if (isLoading) {
    return <div className="dashboard-layout" style={{ justifyContent: 'center', alignItems: 'center' }}>Loading...</div>;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-content">
        <Outlet context={{ restaurant }} />
      </main>
    </div>
  );
}
