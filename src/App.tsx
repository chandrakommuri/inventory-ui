import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
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

const App: React.FC = () => {
  return (
    <Router basename="/inventory-ui">
      <Header />
      <Sidebar>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/inward-invoices" element={<InwardInvoices />} />
          <Route path="/inward-invoices/add" element={<AddInwardInvoice />} />
          <Route path="/inward-invoices/view/:invoiceNumber" element={<ViewInwardInvoice />} />
          <Route path="/inward-invoices/edit/:invoiceNumber" element={<EditInwardInvoice />} />

          <Route path="/outward-invoices" element={<OutwardInvoices />} />
          <Route path="/outward-invoices/add" element={<AddOutwardInvoice />} />
          <Route path="/outward-invoices/view/:invoiceNumber" element={<ViewOutwardInvoice />} />
          <Route path="/outward-invoices/edit/:invoiceNumber" element={<EditOutwardInvoice />} />
        </Routes>
      </Sidebar>
    </Router>
  );
};

export default App;