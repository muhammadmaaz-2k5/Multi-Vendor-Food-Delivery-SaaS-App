export const API_URL = 'http://localhost:8000/api/v1';

export const getAuthHeaders = () => {
  const token = localStorage.getItem('qb_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};
