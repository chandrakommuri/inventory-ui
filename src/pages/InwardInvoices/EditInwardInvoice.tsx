import React, { useState, useEffect } from 'react';
import { Formik, Form, FieldArray } from 'formik';
import * as Yup from 'yup';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import axios from 'axios';
import { InwardInvoice } from '../../models/InwardInvoice';
import DeleteIcon from '@mui/icons-material/Delete';
import { GET_ALL_PRODUCTS_URL, GET_INWARD_INVOICE_URL, UPDATE_INWARD_INVOICE_URL } from '../../Config';
import { Product } from '../../models/Product';

const EditInwardInvoice: React.FC = () => {
  const { invoiceNumber } = useParams<{ invoiceNumber: string }>();
  const navigate = useNavigate();

  // State to hold initial form values
  const [initialValues, setInitialValues] = useState<InwardInvoice | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // State to hold the list of products
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);

  // Fetch products from the API
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

  // Fetch invoice details and format IMEIs as newline-separated strings
  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await axios.get<InwardInvoice>(
          `${GET_INWARD_INVOICE_URL}${invoiceNumber}`
        );
        const invoice = response.data;

        // Format IMEIs as newline-separated strings
        const formattedInvoice = {
          ...invoice,
          items: invoice.items.map((item) => ({
            ...item,
            imeis: item.imeis.join('\n'), // Convert array to newline-separated string
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

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Validation schema for the form using Yup
  const validationSchema = Yup.object().shape({
    invoiceNumber: Yup.string().required('Invoice Number is required'),
    invoiceDate: Yup.string()
      .required('Invoice Date is required')
      .test('not-future-date', 'Invoice Date cannot be a future date', (value) => {
        return value ? new Date(value) <= new Date() : true;
      }),
    deliveryDate: Yup.string()
      .required('Delivery Date is required')
      .test('not-future-date', 'Delivery Date cannot be a future date', (value) => {
        return value ? new Date(value) <= new Date() : true;
      }),
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

  // Handle form submission
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
      await axios.post(`${UPDATE_INWARD_INVOICE_URL}${invoiceNumber}`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      navigate('/inward-invoices');
    } catch (error) {
      console.error('Error updating invoice:', error);
    }
  };

  // Show loading indicator while fetching data
  if (loading || loadingProducts) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  // Handle case where invoice is null (e.g., API failed or invoice not found)
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
        Edit Inward Invoice
      </Typography>
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
        {({ values, handleChange, setFieldValue, errors, touched }) => (
          <Form>
            {/* Invoice Details */}
            <TextField
              name="invoiceNumber"
              label="Invoice Number"
              fullWidth
              margin="normal"
              onChange={handleChange}
              value={values.invoiceNumber}
              disabled // Invoice Number cannot be edited
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
              name="deliveryDate"
              label="Delivery Date"
              type="date"
              fullWidth
              margin="normal"
              onChange={handleChange}
              value={values.deliveryDate}
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: today }}
              error={touched.deliveryDate && Boolean(errors.deliveryDate)}
              helperText={touched.deliveryDate && errors.deliveryDate}
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
            <Button variant="outlined" color="primary" style={{ marginTop: '20px', marginLeft: '20px' }} onClick={() => navigate('/inward-invoices')}>
              Cancel
            </Button>
          </Form>
        )}
      </Formik>
    </Paper>
  );
};

export default EditInwardInvoice;