import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import RegisterRestaurant from './pages/RegisterRestaurant';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardHome from './pages/DashboardHome';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/register-restaurant" element={<RegisterRestaurant />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
