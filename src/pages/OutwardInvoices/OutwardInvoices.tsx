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

  const handleDelete = async (invoiceNumber: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await axios.get(`${DELETE_OUTWARD_INVOICE_URL}${invoiceNumber}`);
        setInvoices(invoices.filter((invoice) => invoice.invoiceNumber !== invoiceNumber));
      } catch (error) {
        console.error('Error deleting invoice:', error);
      }
    }
  };

  const columns: GridColDef[] = [
    { field: 'invoiceNumber', headerName: 'Invoice Number', width: 150, flex: 1 },
    { field: 'invoiceDate', headerName: 'Invoice Date', width: 150, flex: 1 },
    { field: 'customerName', headerName: 'Customer Name', width: 200, flex: 1 },
    { field: 'destination', headerName: 'Destination', width: 200, flex: 1 },
    { field: 'transporter', headerName: 'Transporter', width: 200, flex: 1 },
    { field: 'docketNumber', headerName: 'Docket Number', width: 150, flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box>
          <IconButton onClick={() => navigate(`/outward-invoices/view/${params.row.invoiceNumber}`)} color='primary'>
            <VisibilityIcon />
          </IconButton>
          <IconButton onClick={() => navigate(`/outward-invoices/edit/${params.row.invoiceNumber}`)} color='secondary'>
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
        <h2>Outward Invoices</h2>
        <Button variant="contained" color="primary" onClick={() => navigate('/outward-invoices/add')} startIcon={<AddIcon />}>
          Add Invoice
        </Button>
      </Box>
      <div style={{ height: 400, width: '100%' }}>
        <DataGrid 
          rows={invoices} 
          columns={columns} 
          getRowId={(row) => row.invoiceNumber}
          autoHeight
          disableColumnMenu // Optional: Disables the column menu
          disableSelectionOnClick // Prevents row selection when clicking on a row
          checkboxSelection={false}/>
      </div>
    </Paper>
  );
};

export default OutwardInvoices;