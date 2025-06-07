import React, { useState, useEffect } from 'react';
import { Formik, Form, FieldArray } from 'formik';
import * as Yup from 'yup';
import { Button, Paper, TextField, Box, Typography, CircularProgress } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Product } from '../../models/Product';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const AddOutwardInvoice: React.FC = () => {
  const navigate = useNavigate();

  // State to hold the list of products
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);

  // Fetch products from the API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get<Product[]>(`${process.env.REACT_APP_API_URL}/products`);
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  const today = new Date().toISOString().split('T')[0];

  const initialValues = {
    invoiceNumber: '',
    invoiceDate: '',
    customerName: '',
    destination: '',
    transporter: '',
    docketNumber: '',
    items: [{ productCode: '', quantity: 0, imeis: '' }],
  };

  const validationSchema = Yup.object().shape({
    invoiceNumber: Yup.string().required('Invoice Number is required'),
    invoiceDate: Yup.string()
        .required('Invoice Date is required')
        .test('not-future-date', 'Invoice Date cannot be a future date', (value) => {
            return value ? new Date(value) <= new Date() : true;
        }),
    customerName: Yup.string().required('Customer Name is required'),
    destination: Yup.string().required('Destination is required'),
    transporter: Yup.string().required('Transporter is required'),
    docketNumber: Yup.string().required('Docket Number is required'),
    items: Yup.array().of(
      Yup.object().shape({
        productCode: Yup.string().required('Product Code is required'),
        quantity: Yup.number()
          .required('Quantity is required')
          .min(1, 'Quantity must be at least 1'),
        imeis: Yup.string()
          .required('IMEIs are required')
          .test('imeis-contents', 'IMEI should value should be numeric', function (value, context) {
            const numberRegex = /^\d+$/;
            const imeis = value ? value.split('\n').filter((imei) => imei.trim() !== '') : [];
            return imeis.every(imei => numberRegex.test(imei));
          })
          .test('imeis-length', 'Length of each IMEI must be 15', function (value, context) {
            const imeis = value ? value.split('\n').filter((imei) => imei.trim() !== '') : [];
            return imeis.every(imei => imei.length === 15);
          })
          .test('imeis-duplicates', 'Duplicate IMEIs found', function (value, context) {
            const imeis = value ? value.split('\n').filter((imei) => imei.trim() !== '') : [];
            const quantity = context.parent.quantity;
            return imeis.length === new Set(imeis).size;
          })
          .test('imeis-match-quantity', 'Number of IMEIs must match the quantity', function (value, context) {
            const imeis = value ? value.split('\n').filter((imei) => imei.trim() !== '') : [];
            const quantity = context.parent.quantity;
            return imeis.length === quantity;
          }),
      })
    ),
  });

  const handleSubmit = async (values: any) => {
    const formattedValues = {
      ...values,
      items: values.items.map((item: any) => ({
        ...item,
        imeis: item.imeis.split('\n').filter((imei: string) => imei.trim() !== ''),
      })),
    };

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/outward-invoices`, formattedValues);
      navigate('/outward-invoices');
    } catch (error) {
      console.error('Error adding invoice:', error);
    }
  };

  return (
    <Paper elevation={3} style={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Add Outward Invoice
      </Typography>
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
        {({ values, handleChange, setFieldValue, errors, touched }) => (
          <Form>
            <TextField
              name="invoiceNumber"
              label="Invoice Number"
              fullWidth
              margin="normal"
              onChange={handleChange}
              value={values.invoiceNumber}
              error={touched.invoiceNumber && Boolean(errors.invoiceNumber)}
              helperText={touched.invoiceNumber && errors.invoiceNumber}
            />
            <TextField
              name="invoiceDate"
              label="Invoice Date"
              type="date"
              fullWidth
              margin="normal"
              onChange={handleChange}
              value={values.invoiceDate}
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: today }}
              error={touched.invoiceDate && Boolean(errors.invoiceDate)}
              helperText={touched.invoiceDate && errors.invoiceDate}
            />
            <TextField
              name="customerName"
              label="Customer Name"
              fullWidth
              margin="normal"
              onChange={handleChange}
              value={values.customerName}
              error={touched.customerName && Boolean(errors.customerName)}
              helperText={touched.customerName && errors.customerName}
            />
            <TextField
              name="destination"
              label="Destination"
              fullWidth
              margin="normal"
              onChange={handleChange}
              value={values.destination}
              error={touched.destination && Boolean(errors.destination)}
              helperText={touched.destination && errors.destination}
            />
            <TextField
              name="transporter"
              label="Transporter"
              fullWidth
              margin="normal"
              onChange={handleChange}
              value={values.transporter}
              error={touched.transporter && Boolean(errors.transporter)}
              helperText={touched.transporter && errors.transporter}
            />
            <TextField
              name="docketNumber"
              label="Docket Number"
              fullWidth
              margin="normal"
              onChange={handleChange}
              value={values.docketNumber}
              error={touched.docketNumber && Boolean(errors.docketNumber)}
              helperText={touched.docketNumber && errors.docketNumber}
            />

            {/* Items Array */}
            <FieldArray name="items">
              {({ push, remove }) => (
                <div>
                  <Typography variant="h5" gutterBottom>
                    Items
                  </Typography>
                  {values.items.map((item, index) => (
                    <Box key={index} marginBottom="20px" padding="10px" border="1px solid #ccc" borderRadius="8px">
                      <Typography variant="h6">Item {index + 1}</Typography>
                      {loadingProducts ? (
                        <CircularProgress size={24} />
                      ) : (
                        <Autocomplete
                          options={products}
                          getOptionLabel={(option) => `${option.productCode}-${option.productDescription}`}
                          filterOptions={(options, { inputValue }) =>
                            options.filter(
                              (option) =>
                                option.productCode.toLowerCase().includes(inputValue.toLowerCase()) ||
                                option.productDescription.toLowerCase().includes(inputValue.toLowerCase())
                            )
                          }
                          onChange={(event, value) => {
                            // Set the productCode in Formik when a product is selected
                            setFieldValue(`items[${index}].productCode`, value?.productCode || '');
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Product Code"
                              margin="normal"
                              error={
                                touched.items &&
                                touched.items[index] &&
                                Boolean(errors.items?.[index]?.productCode)
                              }
                              helperText={
                                touched.items?.[index]?.productCode && errors.items?.[index]?.productCode
                              }
                            />
                          )}
                        />
                      )}
                      <TextField
                        name={`items[${index}].quantity`}
                        label="Quantity"
                        type="number"
                        fullWidth
                        margin="normal"
                        onChange={handleChange}
                        value={item.quantity}
                        error={
                          touched.items &&
                          touched.items[index] &&
                          Boolean(errors.items?.[index]?.quantity)
                        }
                        helperText={touched.items?.[index]?.quantity && errors.items?.[index]?.quantity}
                      />
                      <TextField
                        name={`items[${index}].imeis`}
                        label="IMEIs (Each IMEI on a new line)"
                        fullWidth
                        margin="normal"
                        multiline
                        rows={4}
                        onChange={handleChange}
                        value={item.imeis}
                        error={
                          touched.items &&
                          touched.items[index] &&
                          Boolean(errors.items?.[index]?.imeis)
                        }
                        helperText={touched.items?.[index]?.imeis && errors.items?.[index]?.imeis}
                      />
                      <Button
                        onClick={() => remove(index)}
                        variant="contained"
                        color="error"
                        style={{ marginTop: '10px' }}
                        startIcon={<DeleteIcon />}
                      >
                        Remove Item
                      </Button>
                    </Box>
                  ))}
                  <Button
                    onClick={() => push({ productCode: '', quantity: 0, imeis: '' })}
                    variant="contained"
                    color="secondary"
                    style={{ marginTop: '20px' }}
                    startIcon={<AddIcon />}
                  >
                    Add Item
                  </Button>
                </div>
              )}
            </FieldArray>

            <Button type="submit" variant="contained" color="primary" style={{ marginTop: '20px' }}>
              Submit
            </Button>
            <Button variant="outlined" color="primary" style={{ marginTop: '20px', marginLeft: '20px' }} onClick={() => navigate('/outward-invoices')}>
              Cancel
            </Button>
          </Form>
        )}
      </Formik>
    </Paper>
  );
};

export default AddOutwardInvoice;