import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Button, Paper, IconButton, Box, ThemeProvider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { InwardInvoice } from '../../models/InwardInvoice';
import { dark } from '@mui/material/styles/createPalette';

const InwardInvoices: React.FC = () => {
  const [invoices, setInvoices] = useState<InwardInvoice[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvoices = async () => {
      const response = await axios.get<InwardInvoice[]>(`${process.env.REACT_APP_API_URL}/inward-invoices`);
      setInvoices(response.data);
    };
    fetchInvoices();
  }, []);

  const handleDelete = async (invoiceNumber: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      await axios.delete(`${process.env.REACT_APP_API_URL}/inward-invoices/${invoiceNumber}`);
      setInvoices(invoices.filter((invoice) => invoice.invoiceNumber !== invoiceNumber));
    }
  };

  const columns: GridColDef[] = [
    { field: 'invoiceNumber', headerName: 'Invoice Number', flex: 1 },
    { field: 'invoiceDate', headerName: 'Invoice Date', flex: 1 },
    { field: 'deliveryDate', headerName: 'Delivery Date', flex: 1 },
    { field: 'transporter', headerName: 'Transporter', flex: 1 },
    { field: 'docketNumber', headerName: 'Docket Number', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      renderCell: (params) => (
        <Box>
          <IconButton onClick={() => navigate(`/inward-invoices/view/${params.row.invoiceNumber}`)} color='primary'>
            <VisibilityIcon />
          </IconButton>
          <IconButton onClick={() => navigate(`/inward-invoices/edit/${params.row.invoiceNumber}`)} color='secondary'>
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row.invoiceNumber)} color='error'>
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Paper elevation={3} style={{ padding: '20px' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="20px">
        <h2>Inward Invoices</h2>
        <Button variant="contained" color="primary" onClick={() => navigate('/inward-invoices/add')} startIcon={<AddIcon />}>
          Add Invoice
        </Button>
      </Box>
      <div>
       <DataGrid
          rows={invoices}
          columns={columns}
          getRowId={(row) => row.invoiceNumber}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
          pageSizeOptions={[10, 20, 50, 100]}
          />
      </div>
    </Paper>
  );
};

export default InwardInvoices;