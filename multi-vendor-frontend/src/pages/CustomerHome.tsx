import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, Clock, Sparkles, TrendingUp } from 'lucide-react';
import { API_URL } from '../lib/api';

export default function CustomerHome() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [recType, setRecType] = useState<'trending' | 'personalized'>('trending');
  const [tasteProfile, setTasteProfile] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Fetch AI Recommendations on mount
    const phone = localStorage.getItem('qb_customer_phone');
    const url = phone
      ? `${API_URL}/discovery/recommendations?phone=${encodeURIComponent(phone)}`
      : `${API_URL}/discovery/recommendations`;

    fetch(url)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setRecommendations(data.data);
          setRecType(data.type);
          setTasteProfile(data.tasteProfile || []);
        }
      })
      .catch(err => console.error('Failed to fetch recommendations:', err));
  }, []);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const query = search ? `?search=${encodeURIComponent(search)}` : '';
        const res = await fetch(`${API_URL}/discovery/restaurants${query}`);
        const data = await res.json();
        
        if (res.ok) {
          setRestaurants(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch restaurants:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchRestaurants, 300);
    return () => clearTimeout(debounceTimer);
  }, [search]);

  const RestaurantCard = ({ restaurant }: { restaurant: any }) => (
    <div
      onClick={() => navigate(`/restaurants/${restaurant.id}`)}
      style={{
        background: 'white',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        flexShrink: 0,
        width: '280px',
      }}
      onMouseOver={e => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 20px -5px rgba(0,0,0,0.12)';
      }}
      onMouseOut={e => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
      }}
    >
      <div style={{
        height: '160px',
        background: restaurant.coverImage ? `url(${restaurant.coverImage}) center/cover` : '#ffe6eb',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        padding: '1rem'
      }}>
        <div style={{ background: 'white', padding: '4px 8px', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <Clock size={14} /> {restaurant.deliveryTime}
        </div>
      </div>
      <div style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-color)' }}>
            {restaurant.name}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#fef3c7', color: '#d97706', padding: '2px 6px', borderRadius: '4px', fontSize: '0.875rem', fontWeight: 600, flexShrink: 0 }}>
            <Star size={14} fill="#d97706" /> {restaurant.rating?.toFixed(1) || '—'}
          </div>
        </div>
        <p style={{ color: 'var(--text-light)', fontSize: '0.875rem', marginBottom: '0.75rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {restaurant.description || 'Delicious food delivered hot and fresh.'}
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {restaurant.cuisine?.map((tag: string) => (
            <span key={tag} style={{ background: '#f1f5f9', color: 'var(--text-light)', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500 }}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <section className="hero-banner">
        <h1>Hungry? We've got you covered.</h1>
        <p>Discover the best food &amp; drinks in your area, delivered directly to your door.</p>
        
        <div className="search-bar-container">
          <div style={{ position: 'absolute', top: '14px', left: '16px', color: '#94a3b8' }}>
            <MapPin size={22} />
          </div>
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search for restaurants or cuisines..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button style={{ position: 'absolute', right: '8px', top: '8px', bottom: '8px', background: 'var(--text-color)', color: 'white', border: 'none', borderRadius: '9999px', padding: '0 1.5rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}>
            Find Food
          </button>
        </div>
      </section>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>

        {/* ✨ AI Recommendations Section */}
        {recommendations.length > 0 && (
          <section style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              {recType === 'personalized' ? (
                <Sparkles size={22} color="var(--primary-color)" />
              ) : (
                <TrendingUp size={22} color="#f59e0b" />
              )}
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--text-color)' }}>
                {recType === 'personalized' ? '✨ AI Picks for You' : '🔥 Trending Now'}
              </h2>
            </div>
            {recType === 'personalized' && tasteProfile.length > 0 && (
              <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                Based on your love of{' '}
                {tasteProfile.map((t, i) => (
                  <span key={t}>
                    <strong style={{ color: 'var(--primary-color)' }}>{t}</strong>
                    {i < tasteProfile.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </p>
            )}
            {recType === 'trending' && (
              <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                Most popular restaurants on QuickBite right now.
              </p>
            )}

            {/* Horizontal scroll rail */}
            <div
              style={{
                display: 'flex',
                gap: '1.5rem',
                overflowX: 'auto',
                paddingBottom: '1rem',
                scrollbarWidth: 'none',
              }}
            >
              {recommendations.map(r => <RestaurantCard key={r.id} restaurant={r} />)}
            </div>
          </section>
        )}

        {/* All Restaurants Grid */}
        <section>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 700 }}>
            {search ? `Results for "${search}"` : 'All Restaurants'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
            {isLoading ? (
              [1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                  <div style={{ height: '160px', background: '#e2e8f0', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
                  <div style={{ padding: '1.25rem' }}>
                    <div style={{ height: '24px', width: '60%', background: '#f1f5f9', borderRadius: '4px', marginBottom: '0.5rem' }}></div>
                    <div style={{ height: '16px', width: '40%', background: '#f1f5f9', borderRadius: '4px', marginBottom: '1rem' }}></div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <div style={{ height: '24px', width: '60px', background: '#f1f5f9', borderRadius: '9999px' }}></div>
                      <div style={{ height: '24px', width: '60px', background: '#f1f5f9', borderRadius: '9999px' }}></div>
                    </div>
                  </div>
                </div>
              ))
            ) : restaurants.length === 0 ? (
              <p style={{ color: 'var(--text-light)', gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
                No restaurants found matching your search.
              </p>
            ) : (
              restaurants.map((restaurant) => (
                <div
                  key={restaurant.id}
                  onClick={() => navigate(`/restaurants/${restaurant.id}`)}
                  style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', cursor: 'pointer', transition: 'transform 0.2s' }}
                  onMouseOver={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'}
                  onMouseOut={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'}
                >
                  <div style={{
                    height: '160px',
                    background: restaurant.coverImage ? `url(${restaurant.coverImage}) center/cover` : '#ffe6eb',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'flex-end',
                    padding: '1rem'
                  }}>
                    <div style={{ background: 'white', padding: '4px 8px', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                      <Clock size={14} /> {restaurant.deliveryTime}
                    </div>
                  </div>
                  <div style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-color)' }}>
                        {restaurant.name}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#fef3c7', color: '#d97706', padding: '2px 6px', borderRadius: '4px', fontSize: '0.875rem', fontWeight: 600 }}>
                        <Star size={14} fill="#d97706" /> {restaurant.rating?.toFixed(1) || '—'}
                      </div>
                    </div>
                    <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {restaurant.description || 'Delicious food delivered hot and fresh.'}
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {restaurant.cuisine?.map((tag: string) => (
                        <span key={tag} style={{ background: '#f1f5f9', color: 'var(--text-light)', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500 }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
