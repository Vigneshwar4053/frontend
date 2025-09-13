import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import OwnerDashboard from './pages/OwnerDashboard';
import AddProductsPage from './pages/AddProductsPage';
import AddStockist from './pages/AddStockist';
import ManageOrders from './pages/ManageOrders';
import ManageProducts from './pages/ManageProducts';
import AddAdvertisements from './pages/AddAdvertisements';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<OwnerDashboard />} />
        <Route path="/add-products" element={<AddProductsPage />} />
        <Route path="/add-stockist" element={<AddStockist />} />
        <Route path="/manage-orders" element={<ManageOrders />} />
        <Route path="/manage-products" element={<ManageProducts />} />
        <Route path="/add-ads" element={<AddAdvertisements />} />
      </Routes>
    </Router>
  );
}

export default App;
