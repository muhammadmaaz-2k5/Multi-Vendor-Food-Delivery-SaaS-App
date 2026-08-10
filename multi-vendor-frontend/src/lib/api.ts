export const API_URL = 'https://multi-vendor-food-delivery-saa-s-ap.vercel.app/api/v1';

export const getAuthHeaders = () => {
  const token = localStorage.getItem('qb_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};
