import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Button, Paper, Box, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import { OutwardInvoice } from '../../models/OutwardInvoice';
import { DELETE_OUTWARD_INVOICE_URL, DOWNLOAD_INVOICE_REPORT_URL, GET_ALL_OUTWARD_INVOICES_URL } from '../../Config';
import api from '../../Api';

const OutwardInvoices: React.FC = () => {
  const [invoices, setInvoices] = useState<OutwardInvoice[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await api.get<OutwardInvoice[]>(GET_ALL_OUTWARD_INVOICES_URL);
        const data = response.data;
        let sno = 1;
        data.forEach(i => i.sno = sno++);
        setInvoices(data);
      } catch (error) {
        console.error('Error fetching outward invoices:', error);
      }
    };
    fetchInvoices();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await api.delete(`${DELETE_OUTWARD_INVOICE_URL}${id}`);
        setInvoices(invoices.filter((invoice) => invoice.id !== id));
      } catch (error) {
        console.error('Error deleting invoice:', error);
      }
    }
  };

  const handleDownloadReport = async () => {
    const today = new Date().toISOString().split('T')[0];

    try {
      const response = await api.get(DOWNLOAD_INVOICE_REPORT_URL, {
        params: {
          type: 'outward',
          startDate: today,
          endDate: today
        },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `outward_invoice_report_${today}.xlsx`;
      link.click();
      link.remove();
    } catch (error) {
      console.error('Download failed:', error);
      alert('Unable to download report.');
    }
  };
  
    const columns: GridColDef[] = [
    { field: 'sno', headerName: 'S. No', width: 70},
    { field: 'invoiceNumber', headerName: 'Invoice Number', flex: 1 },
    { field: 'invoiceDate', headerName: 'Invoice Date', flex: 1 },
    { field: 'customer', headerName: 'Customer Name', flex: 1 },
    { field: 'destination', headerName: 'Destination', flex: 1 },
    { field: 'transporter', headerName: 'Transporter', flex: 1 },
    { field: 'docketNumber', headerName: 'Docket Number', flex: 1 },
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
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/outward-invoices/add')}
            startIcon={<AddIcon />}
          >
            Add Invoice
          </Button>
          <Button 
            variant="outlined" 
            color="success" 
            onClick={handleDownloadReport}
            endIcon={<DownloadIcon />}
          >
            Today’s Report
          </Button>
        </Box>
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