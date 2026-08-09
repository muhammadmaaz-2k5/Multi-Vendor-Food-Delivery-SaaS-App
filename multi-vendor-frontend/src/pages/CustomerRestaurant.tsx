import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Star, Clock, Info } from 'lucide-react';
import { API_URL } from '../lib/api';
import ItemModal from '../components/ItemModal';

export default function CustomerRestaurant() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const res = await fetch(`${API_URL}/discovery/restaurants/${id}`);
        const data = await res.json();
        if (res.ok) {
          setRestaurant(data.data);
          if (data.data.menuCategories?.length > 0) {
            setActiveCategory(data.data.menuCategories[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch restaurant:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRestaurant();
  }, [id]);

  if (isLoading) {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading menu...</div>;
  }

  if (!restaurant) {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>Restaurant not found.</div>;
  }

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      {/* Hero Section */}
      <section className="restaurant-hero" style={{ background: restaurant.coverImage ? `url(${restaurant.coverImage}) center/cover` : '#1e293b' }}>
        {/* Dark overlay for readability */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}></div>
        
        <div className="restaurant-hero-content" style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '12px', background: restaurant.logo ? `url(${restaurant.logo}) center/cover` : '#ffe6eb', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}></div>
            <div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--text-color)' }}>{restaurant.name}</h1>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', color: 'var(--text-light)', fontSize: '0.9rem', fontWeight: 500 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#fef3c7', color: '#d97706', padding: '4px 8px', borderRadius: '6px' }}>
                  <Star size={16} fill="#d97706" /> {restaurant.rating} Rating
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={16} /> {restaurant.deliveryTime}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Info size={16} /> Min. Order: ₨ 200
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Layout */}
      <div className="restaurant-menu-layout">
        {/* Sticky Sidebar */}
        <aside className="menu-sidebar">
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Menu</h3>
          <nav>
            {restaurant.menuCategories?.map((category: any) => (
              <a 
                key={category.id} 
                href={`#cat-${category.id}`}
                className={`menu-sidebar-link ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(category.id)}
              >
                {category.name}
              </a>
            ))}
          </nav>
        </aside>

        {/* Menu Items */}
        <main className="menu-content">
          {restaurant.menuCategories?.map((category: any) => (
            <div key={category.id} id={`cat-${category.id}`} className="menu-category-section">
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-color)' }}>
                {category.name}
              </h2>
              {category.description && <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>{category.description}</p>}
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
                {category.menuItems?.map((item: any) => (
                  <div key={item.id} className="menu-item-card" onClick={() => setSelectedItem(item)}>
                    <div style={{ flex: 1, paddingRight: '1rem' }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>{item.name}</h4>
                      <p style={{ color: 'var(--text-light)', fontSize: '0.85rem', marginBottom: '0.75rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {item.description}
                      </p>
                      <div style={{ fontWeight: 600, color: 'var(--text-color)' }}>
                        ₨ {item.price.toFixed(2)}
                      </div>
                    </div>
                    {item.image && (
                      <div style={{ width: '100px', height: '100px', borderRadius: '12px', background: `url(${item.image}) center/cover`, flexShrink: 0 }}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </main>
      </div>

      {selectedItem && (
        <ItemModal 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
        />
      )}
    </div>
  );
}
