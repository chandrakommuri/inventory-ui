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
    product.productDescription.toLowerCase().includes(search.toLowerCase())
  );

  const columns: GridColDef[] = [
    { field: 'productCode', headerName: 'Product Code', width: 150 },
    { field: 'productDescription', headerName: 'Product Description', width: 300 },
    { field: 'quantity', headerName: 'Quantity', width: 150 },
  ];

  return (
    <Paper elevation={3} style={{ padding: '20px' }}>
      <TextField
        label="Search"
        variant="outlined"
        fullWidth
        style={{ marginBottom: '20px' }}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div style={{ height: 400, width: '100%' }}>
        <DataGrid rows={filteredProducts} 
            columns={columns} 
            initialState={{
                pagination: {
                    paginationModel: { pageSize: 5, page: 0 },
                },
            }}
            pageSizeOptions={[5, 10, 20]} 
            getRowId={(row) => row.id} />
      </div>
    </Paper>
  );
};

export default Inventory;