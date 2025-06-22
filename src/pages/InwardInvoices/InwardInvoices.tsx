import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Button, Paper, IconButton, Box, ThemeProvider, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import { InwardInvoice } from '../../models/InwardInvoice';
import { dark } from '@mui/material/styles/createPalette';
import { DELETE_INWARD_INVOICE_URL, DOWNLOAD_INVOICE_REPORT_URL, GET_ALL_INWARD_INVOICES_URL } from '../../Config';
import api from '../../Api';

const InwardInvoices: React.FC = () => {
  const [invoices, setInvoices] = useState<InwardInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const response = await api.get<InwardInvoice[]>(GET_ALL_INWARD_INVOICES_URL);
        const data = response.data;
        let sno = 1;
        data.forEach(i => i.sno = sno++);
        setInvoices(data);
      } catch (error) {
        console.error('Error fetching inward invoices:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const filteredInvoices = invoices.filter((invoice) =>
    invoice.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
    invoice.invoiceDate.toLowerCase().includes(search.toLowerCase()) ||
    invoice.deliveryDate.toLowerCase().includes(search.toLowerCase()) ||
    invoice.transporter.toLowerCase().includes(search.toLowerCase()) ||
    invoice.docketNumber.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      await api.delete(`${DELETE_INWARD_INVOICE_URL}${id}`);
      setInvoices(invoices.filter((invoice) => invoice.id !== id));
    }
  };

  const handleDownloadReport = async () => {
    const today = new Date().toISOString().split('T')[0];

    try {
      const response = await api.get(DOWNLOAD_INVOICE_REPORT_URL, {
        params: {
          type: 'inward',
          startDate: today,
          endDate: today
        },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `inward_invoice_report_${today}.xlsx`;
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
    { field: 'deliveryDate', headerName: 'Delivery Date', flex: 1 },
    { field: 'transporter', headerName: 'Transporter', flex: 1 },
    { field: 'docketNumber', headerName: 'Docket Number', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      renderCell: (params) => (
        <Box>
          <IconButton onClick={() => navigate(`/inward-invoices/view/${params.row.id}`)} color='primary'>
            <VisibilityIcon />
          </IconButton>
          <IconButton onClick={() => navigate(`/inward-invoices/edit/${params.row.id}`)} color='secondary'>
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
        <h2>Inward Invoices</h2>
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/inward-invoices/add')}
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

      <TextField
        label="Search"
        variant="outlined"
        fullWidth
        sx={{ marginBottom: '20px' }}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <DataGrid
        rows={filteredInvoices}
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
        loading={loading}
        autoHeight
      />
    </Paper>
  );
};

export default InwardInvoices;