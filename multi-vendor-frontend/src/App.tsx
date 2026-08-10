import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import RegisterRestaurant from './pages/RegisterRestaurant';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import CustomerLayout from './layouts/CustomerLayout';
import CustomerHome from './pages/CustomerHome';
import CustomerRestaurant from './pages/CustomerRestaurant';
import CustomerCheckout from './pages/CustomerCheckout';
import CustomerOrders from './pages/CustomerOrders';
import AdminDashboard from './pages/AdminDashboard';
import RestaurantKDS from './pages/RestaurantKDS';
import RestaurantWallet from './pages/RestaurantWallet';
import { Provider } from 'react-redux';
import { store } from './store';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
      <Routes>
        {/* Customer Public Routes */}
        <Route path="/" element={<CustomerLayout />}>
          <Route index element={<CustomerHome />} />
          <Route path="restaurants/:id" element={<CustomerRestaurant />} />
          <Route path="/checkout" element={<CustomerCheckout />} />
          <Route path="/orders" element={<CustomerOrders />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/register-restaurant" element={<RegisterRestaurant />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="wallet" element={<RestaurantWallet />} />
        </Route>
        <Route path="/kds/:tenantId" element={<RestaurantKDS />} />
      </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
