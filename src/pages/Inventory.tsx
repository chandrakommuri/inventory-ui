import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { TextField, Paper } from '@mui/material';
import { Product } from '../models/Product';
import { GET_ALL_PRODUCTS_URL } from '../Config';

const Inventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await axios.get<Product[]>(GET_ALL_PRODUCTS_URL);
      setProducts(response.data);
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) =>
    product.code.toLowerCase().includes(search.toLowerCase()) || 
      product.description.toLowerCase().includes(search.toLowerCase())
  );

  const columns: GridColDef[] = [
    { field: 'code', headerName: 'Product Code', headerAlign: 'center', align: 'center', flex: 1 },
    { field: 'description', headerName: 'Product Description', headerAlign: 'center', flex: 3 },
    { field: 'inwardQuantity', headerName: 'Inward Qty', headerAlign: 'center', align: 'center', flex: 1 },
    { field: 'outwardQuantity', headerName: 'Outward Qty', headerAlign: 'center', align: 'center', flex: 1 },
    { field: 'quantity', headerName: 'Physical Qty', headerAlign: 'center', align: 'center', flex: 1 },
  ];

  return (
    <Paper elevation={3} sx={{ padding: '20px', transition: 'height 0.3s ease' }}>
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
        pageSizeOptions={[20, 50, 100, 200]} 
        getRowId={(row) => row.id}
        sx = {{
          '.MuiDataGrid-columnHeader': {
            backgroundColor: '#61dafb',
          }
        }}
        autoHeight
      />      
    </Paper>
  );
};

export default Inventory;