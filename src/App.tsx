import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';

import LoginPage from './pages/LoginPage';
import Home from './pages/Home';

import Inventory from './pages/Inventory';

import InwardInvoices from './pages/InwardInvoices/InwardInvoices';
import AddInwardInvoice from './pages/InwardInvoices/AddInwardInvoice';
import ViewInwardInvoice from './pages/InwardInvoices/ViewInwardInvoice';
import EditInwardInvoice from './pages/InwardInvoices/EditInwardInvoice';

import OutwardInvoices from './pages/OutwardInvoices/OutwardInvoices';
import AddOutwardInvoice from './pages/OutwardInvoices/AddOutwardInvoice';
import EditOutwardInvoice from './pages/OutwardInvoices/EditOutwardInvoice';
import ViewOutwardInvoice from './pages/OutwardInvoices/ViewOutwardInvoice';
import StockMovementPage from './pages/StockMovementPage';
import PrivateRoute from './PrivateRoute';

const App: React.FC = () => {
  return (
    <Router basename="/">
      <Sidebar>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/inventory" element={<PrivateRoute><Inventory /></PrivateRoute>} />
          <Route path="/inward-invoices" element={<PrivateRoute><InwardInvoices /></PrivateRoute>} />
          <Route path="/inward-invoices/add" element={<PrivateRoute><AddInwardInvoice /></PrivateRoute>} />
          <Route path="/inward-invoices/view/:id" element={<PrivateRoute><ViewInwardInvoice /></PrivateRoute>} />
          <Route path="/inward-invoices/edit/:id" element={<PrivateRoute><EditInwardInvoice /></PrivateRoute>} />

          <Route path="/outward-invoices" element={<PrivateRoute><OutwardInvoices /></PrivateRoute>} />
          <Route path="/outward-invoices/add" element={<PrivateRoute><AddOutwardInvoice /></PrivateRoute>} />
          <Route path="/outward-invoices/view/:id" element={<PrivateRoute><ViewOutwardInvoice /></PrivateRoute>} />
          <Route path="/outward-invoices/edit/:id" element={<PrivateRoute><EditOutwardInvoice /></PrivateRoute>} />

          <Route path="/stock-movement" element={<PrivateRoute><StockMovementPage /></PrivateRoute>} />
        </Routes>
      </Sidebar>
    </Router>
  );
};

export default App;