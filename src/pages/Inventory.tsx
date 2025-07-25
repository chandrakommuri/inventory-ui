import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  TextField,
  Paper,
  Box,
  Button,
  Snackbar,
  Alert,
  IconButton,
  Typography,
  CardContent,
  Grid,
  Card,
  Skeleton,
} from '@mui/material';
import { Product } from '../models/Product';
import * as XLSX from 'xlsx';
import DownloadIcon from '@mui/icons-material/Download';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { GET_ALL_PRODUCTS_URL, CREATE_NEW_PRODUCT_URL, DELETE_RODUCT_URL } from '../Config';
import api from '../Api';
import AddProductDialog from './AddProductDialog';

const Inventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const showToast = (message: string, severity: 'success' | 'error') => {
    setToast({ open: true, message, severity });
  };

  const handleToastClose = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get<Product[]>(GET_ALL_PRODUCTS_URL);
      const data = response.data;
      let sno = 1;
      data.forEach((p) => (p.sno = sno++));
      setProducts(data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      showToast('Error fetching inventory.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = async (newProduct: { productCode: string; productDescription: string }) => {
    try {
      await api.post(CREATE_NEW_PRODUCT_URL, {
        code: newProduct.productCode,
        description: newProduct.productDescription,
      });
      await fetchProducts();
      showToast('Product added successfully.', 'success');
    } catch (error) {
      console.error('Failed to add product:', error);
      showToast('Failed to add product.', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await api.delete(`${DELETE_RODUCT_URL}${id}`);
      setProducts(products.filter((product) => product.id !== id));
    }
  };

  const filteredProducts = products.filter((product) =>
    product.code.toLowerCase().includes(search.toLowerCase()) ||
    product.description.toLowerCase().includes(search.toLowerCase())
  );

  const total_cards = [
    {
      title: "Total Inward Quantity",
      total: products.reduce((sum, row) => sum + row.inwardQuantity, 0)
    },
    {
      title: "Total Outward Quantity",
      total: products.reduce((sum, row) => sum + row.outwardQuantity, 0)
    },
    {
      title: "Total Physical Quantity",
      total: products.reduce((sum, row) => sum + row.quantity, 0),
    }
  ];

  const exportToExcel = () => {
    const headersRow = ['S. No', 'Product Code', 'Product Description', 'Inward Qty', 'Outward Qty', 'Physical Qty'];
    const rows = products.map(product => [
      product.sno,
      product.code,
      product.description,
      product.inwardQuantity,
      product.outwardQuantity,
      product.quantity,
    ]);

    const sheetData = [headersRow, ...rows];
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    const columnWidths = sheetData[0].map((_, colIndex) => {
      const maxWidth = sheetData.reduce((max, row) => {
        const cell = row[colIndex];
        const cellLength = cell ? cell.toString().length : 0;
        return Math.max(max, cellLength);
      }, 10);
      return { wch: maxWidth + 2 };
    });
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory');
    const today = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `inventory_${today}.xlsx`);
  };

  const columns: GridColDef[] = [
    { field: 'sno', headerName: 'S. No', headerAlign: 'center', align: 'center', width: 70 },
    { field: 'code', headerName: 'Product Code', headerAlign: 'center', align: 'center', flex: 1 },
    { field: 'description', headerName: 'Product Description', headerAlign: 'center', flex: 3 },
    { field: 'inwardQuantity', headerName: 'Inward Qty', headerAlign: 'center', align: 'center', flex: 1 },
    { field: 'outwardQuantity', headerName: 'Outward Qty', headerAlign: 'center', align: 'center', flex: 1 },
    { field: 'quantity', headerName: 'Physical Qty', headerAlign: 'center', align: 'center', flex: 1 },
    {
      field: 'actions',
      headerName: '',
      flex: 1,
      renderCell: (params) => (
        <Box>
          <IconButton onClick={() => handleDelete(params.row.id)} color='error' disabled={params.row.quantity !== 0}>
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Paper elevation={3} sx={{ padding: '20px', transition: 'height 0.3s ease' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="20px">
        <h2>Inventory</h2>
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setAddDialogOpen(true)}
            startIcon={<AddIcon />}
          >
            Add Product
          </Button>
          <Button
            variant="outlined"
            color="success"
            onClick={exportToExcel}
            endIcon={<DownloadIcon />}
          >
            Download
          </Button>
        </Box>
      </Box>

      <Grid container spacing={2} mb={2}>
        {total_cards.map((card, index) => (
          <Grid size={{  xs: 6, sm: 4 }}>
            <Card variant="elevation" sx={{ backgroundColor: '#e3f2fd' }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  {card.title}
                </Typography>
                {loading ? (
                  <Skeleton variant="text" width={80} height={32} />
                ) : (
                  <Typography variant="h6">{card.total}</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <TextField
        label="Search"
        variant="outlined"
        fullWidth
        sx={{ marginBottom: '20px' }}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <DataGrid
        rows={filteredProducts}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 20, page: 0 },
          },
        }}
        pageSizeOptions={[20, 50, 100]}
        getRowId={(row) => row.id}
        loading={loading}
        autoHeight
      />

      <AddProductDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSubmit={handleAddProduct}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={handleToastClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={toast.severity} variant="filled" onClose={handleToastClose}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default Inventory;
