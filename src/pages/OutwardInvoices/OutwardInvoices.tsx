import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Button, Paper, Box, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { OutwardInvoice } from '../../models/OutwardInvoice';
import { DELETE_OUTWARD_INVOICE_URL, GET_ALL_OUTWARD_INVOICES_URL } from '../../Config';

const OutwardInvoices: React.FC = () => {
  const [invoices, setInvoices] = useState<OutwardInvoice[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await axios.get<OutwardInvoice[]>(GET_ALL_OUTWARD_INVOICES_URL);
        setInvoices(response.data);
      } catch (error) {
        console.error('Error fetching outward invoices:', error);
      }
    };
    fetchInvoices();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await axios.delete(`${DELETE_OUTWARD_INVOICE_URL}${id}`);
        setInvoices(invoices.filter((invoice) => invoice.id !== id));
      } catch (error) {
        console.error('Error deleting invoice:', error);
      }
    }
  };

  const columns: GridColDef[] = [
    { field: 'invoiceNumber', headerName: 'Invoice Number', width: 150, flex: 1 },
    { field: 'invoiceDate', headerName: 'Invoice Date', width: 150, flex: 1 },
    { field: 'customer', headerName: 'Customer Name', width: 200, flex: 1 },
    { field: 'destination', headerName: 'Destination', width: 200, flex: 1 },
    { field: 'transporter', headerName: 'Transporter', width: 200, flex: 1 },
    { field: 'docketNumber', headerName: 'Docket Number', width: 150, flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box>
          <IconButton onClick={() => navigate(`/outward-invoices/view/${params.row.id}`)} color='primary'>
            <VisibilityIcon />
          </IconButton>
          <IconButton onClick={() => navigate(`/outward-invoices/edit/${params.row.id}`)} color='secondary'>
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row.id)} color='error'>
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Paper elevation={3} sx={{ padding: '20px', transition: 'height 0.3s ease' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="20px">
        <h2>Outward Invoices</h2>
        <Button variant="contained" color="primary" onClick={() => navigate('/outward-invoices/add')} startIcon={<AddIcon />}>
          Add Invoice
        </Button>
      </Box>
      <DataGrid 
        rows={invoices} 
        columns={columns} 
        getRowId={(row) => row.id}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
        pageSizeOptions={[10, 20, 50, 100]}
        autoHeight
      />
    </Paper>
  );
};

export default OutwardInvoices;