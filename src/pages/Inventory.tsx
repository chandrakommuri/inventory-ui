import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { TextField, Paper, Box, Button } from '@mui/material';
import { Product } from '../models/Product';
import * as XLSX from 'xlsx';
import DownloadIcon from '@mui/icons-material/Download';
import { GET_ALL_PRODUCTS_URL } from '../Config';
import api from '../Api';

const Inventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get<Product[]>(GET_ALL_PRODUCTS_URL);
        const data = response.data;
        let sno = 1;
        data.forEach(p => p.sno = sno++);
        setProducts(data);
      } catch (error) {
        console.error('Error fetching inventory:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) =>
    product.code.toLowerCase().includes(search.toLowerCase()) || 
      product.description.toLowerCase().includes(search.toLowerCase())
  );

  const exportToExcel = () => {
    const headersRow = ['S. No', 'Product Code', 'Product Description', 'Inward Qty', 'Outward Qty', 'Physical Qty'];

    const rows = products.map(product => {
      const base = [product.sno, product.code, product.description, product.inwardQuantity, product.outwardQuantity, product.quantity];
      return base;
    });

    const sheetData = [headersRow, ...rows];

    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

    // ✅ Auto-adjust column widths based on maximum cell length
    const columnWidths = sheetData[0].map((_, colIndex) => {
      const maxWidth = sheetData.reduce((max, row) => {
        const cell = row[colIndex];
        const cellLength = cell ? cell.toString().length : 0;
        return Math.max(max, cellLength);
      }, 10); // Minimum column width
      return { wch: maxWidth + 2 }; // +2 for padding
    });

    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory');
    XLSX.writeFile(workbook, 'inventory.xlsx');
  };

  const columns: GridColDef[] = [
    { field: 'sno', headerName: 'S. No', headerAlign: 'center', align: 'center', width: 70 },
    { field: 'code', headerName: 'Product Code', headerAlign: 'center', align: 'center', flex: 1 },
    { field: 'description', headerName: 'Product Description', headerAlign: 'center', flex: 3 },
    { field: 'inwardQuantity', headerName: 'Inward Qty', headerAlign: 'center', align: 'center', flex: 1 },
    { field: 'outwardQuantity', headerName: 'Outward Qty', headerAlign: 'center', align: 'center', flex: 1 },
    { field: 'quantity', headerName: 'Physical Qty', headerAlign: 'center', align: 'center', flex: 1 },
  ];

  return (
    <Paper elevation={3} sx={{ padding: '20px', transition: 'height 0.3s ease' }}>
      <Box mb={2} display="flex" justifyContent="flex-end">
        <Button 
          variant="outlined" 
          color="success" 
          onClick={exportToExcel}
          endIcon={<DownloadIcon />}
          >
          Download
        </Button>
      </Box>
      <TextField
        label="Search"
        variant="outlined"
        fullWidth
        style={{ marginBottom: '20px' }}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />      
      <DataGrid rows={filteredProducts} 
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
    </Paper>
  );
};

export default Inventory;