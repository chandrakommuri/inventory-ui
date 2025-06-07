import React, { useState, useEffect } from 'react';
import { Formik, Form, FieldArray } from 'formik';
import * as Yup from 'yup';
import { useParams, useNavigate } from 'react-router-dom';
import { Paper, TextField, Button, Box, Typography, CircularProgress } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import axios from 'axios';
import { OutwardInvoice } from '../../models/OutwardInvoice';
import DeleteIcon from '@mui/icons-material/Delete';
import { GET_ALL_PRODUCTS_URL, GET_OUTWARD_INVOICE_URL, UPDATE_OUTWARD_INVOICE_URL } from '../../Config';
import { Product } from '../../models/Product';

const EditOutwardInvoice: React.FC = () => {
  const { invoiceNumber } = useParams<{ invoiceNumber: string }>();
  const navigate = useNavigate();

  const [initialValues, setInitialValues] = useState<OutwardInvoice | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get<Product[]>(GET_ALL_PRODUCTS_URL);
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await axios.get<OutwardInvoice>(
          `${GET_OUTWARD_INVOICE_URL}${invoiceNumber}`
        );
        const invoice = response.data;

        const formattedInvoice = {
          ...invoice,
          items: invoice.items.map((item) => ({
            ...item,
            imeis: item.imeis.join('\n'),
          })),
        };

        setInitialValues(formattedInvoice);
      } catch (error) {
        console.error('Error fetching invoice:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [invoiceNumber]);

  const validationSchema = Yup.object().shape({
    invoiceNumber: Yup.string().required('Invoice Number is required'),
    invoiceDate: Yup.string().required('Invoice Date is required'),
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
      const formData = new URLSearchParams();
      formData.append("payload", JSON.stringify(formattedValues));
      await axios.post(`${UPDATE_OUTWARD_INVOICE_URL}${invoiceNumber}`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      navigate('/outward-invoices');
    } catch (error) {
      console.error('Error updating invoice:', error);
    }
  };

  if (loading || loadingProducts) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!initialValues) {
    return (
      <Typography variant="h6" align="center" color="error">
        Invoice not found.
      </Typography>
    );
  }

  return (
    <Paper elevation={3} style={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Edit Outward Invoice
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
              disabled
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

            <FieldArray name="items">
              {({ push, remove }) => (
                <div>
                  <Typography variant="h5" gutterBottom>
                    Items
                  </Typography>
                  {values.items.map((item, index) => (
                    <Box key={index} marginBottom="20px" padding="10px" border="1px solid #ccc" borderRadius="8px">
                      <Typography variant="h6">Item {index + 1}</Typography>
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
                        value={
                          products.find((product) => product.productCode === item.productCode) || null
                        }
                        onChange={(event, value) => {
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

export default EditOutwardInvoice;