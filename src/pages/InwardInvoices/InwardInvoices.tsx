import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Button, Paper, IconButton, Box, ThemeProvider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import { InwardInvoice } from '../../models/InwardInvoice';
import { dark } from '@mui/material/styles/createPalette';
import { DELETE_INWARD_INVOICE_URL, DOWNLOAD_INVOICE_REPORT_URL, GET_ALL_INWARD_INVOICES_URL } from '../../Config';

const InwardInvoices: React.FC = () => {
  const [invoices, setInvoices] = useState<InwardInvoice[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvoices = async () => {
      const response = await axios.get<InwardInvoice[]>(GET_ALL_INWARD_INVOICES_URL);
      const data = response.data;
      let sno = 1;
      data.forEach(i => i.sno = sno++);
      setInvoices(data);
    };
    fetchInvoices();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      await axios.delete(`${DELETE_INWARD_INVOICE_URL}${id}`);
      setInvoices(invoices.filter((invoice) => invoice.id !== id));
    }
  };

  const handleDownloadReport = async () => {
    const today = new Date().toISOString().split('T')[0];
    const url = new URL(DOWNLOAD_INVOICE_REPORT_URL);
    url.searchParams.append("type", "inward");
    url.searchParams.append("startDate", today);
    url.searchParams.append("endDate", today);

    try {
      const response = await fetch(url.toString());
      console.log(url.toString());
      if (!response.ok) throw new Error("Failed to download");

      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `inward_invoice_report_${today}.xlsx`;
      link.click();
      link.remove();
    } catch (error) {
      console.error("Download failed:", error);
      alert("Unable to download report.");
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

export default InwardInvoices;