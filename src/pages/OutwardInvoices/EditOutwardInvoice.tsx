import React, { useState, useEffect } from 'react';
import { Formik, Form, FieldArray } from 'formik';
import * as Yup from 'yup';
import { useParams, useNavigate } from 'react-router-dom';
import { Paper, TextField, Button, Box, Typography, CircularProgress } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import axios from 'axios';
import { OutwardInvoice } from '../../models/OutwardInvoice';
import DeleteIcon from '@mui/icons-material/Delete';
import { GET_ALL_CUSTOMERS_URL, GET_ALL_DESTINATIONS_URL, GET_ALL_PRODUCTS_URL, GET_ALL_TRANSPORTERS_URL, GET_OUTWARD_INVOICE_URL, UPDATE_OUTWARD_INVOICE_URL } from '../../Config';
import { Product } from '../../models/Product';
import { Customer } from '../../models/Customer';
import { Destination } from '../../models/Destination';
import { Transporter } from '../../models/Transporter';

const EditOutwardInvoice: React.FC = () => {
  const { id } = useParams<{ id: string }>();
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

  // State to hold the list of customers
  const [customers, setCustomer] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomer] = useState<boolean>(true);

  // Fetch customers from the API
  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await axios.get<Customer[]>(GET_ALL_CUSTOMERS_URL);
        setCustomer(response.data);
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setLoadingCustomer(false);
      }
    };
    fetchCustomer();
  }, []);

  // State to hold the list of destinations
  const [destinations, setDestination] = useState<Destination[]>([]);
  const [loadingDestinations, setLoadingDestination] = useState<boolean>(true);

  // Fetch destinations from the API
  useEffect(() => {
    const fetchDestination = async () => {
      try {
        const response = await axios.get<Destination[]>(GET_ALL_DESTINATIONS_URL);
        setDestination(response.data);
      } catch (error) {
        console.error('Error fetching destinations:', error);
      } finally {
        setLoadingDestination(false);
      }
    };
    fetchDestination();
  }, []);

  // State to hold the list of transporters
  const [transporters, setTransporters] = useState<Transporter[]>([]);
  const [loadingTransporters, setLoadingTransporters] = useState<boolean>(true);

  // Fetch transporters from the API
  useEffect(() => {
    const fetchTransporters = async () => {
      try {
        const response = await axios.get<Transporter[]>(GET_ALL_TRANSPORTERS_URL);
        setTransporters(response.data);
      } catch (error) {
        console.error('Error fetching transporters:', error);
      } finally {
        setLoadingTransporters(false);
      }
    };
    fetchTransporters();
  }, []);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await axios.get<OutwardInvoice>(
          `${GET_OUTWARD_INVOICE_URL}${id}`
        );
        const invoice = response.data;

        const formattedInvoice = {
          ...invoice,
          items: invoice.items.map((item) => ({
            ...item,
            imeis: item.imeis.join('\n'),
          })),
        };

        // @ts-ignore
        setInitialValues(formattedInvoice);
      } catch (error) {
        console.error('Error fetching invoice:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  const validationSchema = Yup.object().shape({
    invoiceNumber: Yup.string().required('Invoice Number is required'),
    invoiceDate: Yup.string().required('Invoice Date is required'),
    customer: Yup.string().required('Customer Name is required'),
    destination: Yup.string().required('Destination is required'),
    transporter: Yup.string().required('Transporter is required'),
    docketNumber: Yup.string().required('Docket Number is required'),
    items: Yup.array().of(
      Yup.object().shape({
        productId: Yup.string().required('Product is required'),
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
      await axios.put(`${UPDATE_OUTWARD_INVOICE_URL}${id}`, formattedValues, {
        headers: {
          'Content-Type': 'application/json',
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
            {loadingCustomers ? (
              <CircularProgress size={24} />
            ) : (
              <Autocomplete
                options={customers}
                getOptionLabel={(option) => `${option.name}`}
                filterOptions={(options, { inputValue }) =>
                  options.filter((option) =>option.name.toLowerCase().includes(inputValue.toLowerCase()))
                }
                value={
                  customers.find((customer) => customer.id === values.customerId) || null
                }
                onChange={(event, value) => {
                  // Set the customerId in Formik when a customerI is selected
                  setFieldValue(`customerId`, value?.id || '');
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Customer"
                    margin="normal"
                    error={touched.customerId && Boolean(errors.customerId)}
                    helperText={touched.customerId && errors.customerId}
                  />
                )}
              />
            )}
            {loadingDestinations ? (
              <CircularProgress size={24} />
            ) : (
              <Autocomplete
                options={destinations}
                getOptionLabel={(option) => `${option.name}`}
                filterOptions={(options, { inputValue }) =>
                  options.filter((option) =>option.name.toLowerCase().includes(inputValue.toLowerCase()))
                }
                value={
                  destinations.find((destination) => destination.id === values.destinationId) || null
                }
                onChange={(event, value) => {
                  // Set the destinationId in Formik when a destination is selected
                  setFieldValue(`destinationId`, value?.id || '');
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Destination"
                    margin="normal"
                    error={touched.destinationId && Boolean(errors.destinationId)}
                    helperText={touched.destinationId && errors.destinationId}
                  />
                )}
              />
            )}
            {loadingTransporters ? (
              <CircularProgress size={24} />
            ) : (
              <Autocomplete
                options={transporters}
                getOptionLabel={(option) => `${option.name}`}
                filterOptions={(options, { inputValue }) =>
                  options.filter((option) =>option.name.toLowerCase().includes(inputValue.toLowerCase()))
                }
                value={
                  transporters.find((transporter) => transporter.id === values.transporterId) || null
                }
                onChange={(event, value) => {
                  // Set the transporterId in Formik when a transporter is selected
                  setFieldValue(`transporterId`, value?.id || '');
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Transporter"
                    margin="normal"
                    error={touched.transporterId && Boolean(errors.transporterId)}
                    helperText={touched.transporterId && errors.transporterId}
                  />
                )}
              />
            )}
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
                        getOptionLabel={(option) => `${option.code}-${option.description}`}
                        filterOptions={(options, { inputValue }) =>
                          options.filter(
                            (option) =>
                              option.code.toLowerCase().includes(inputValue.toLowerCase()) ||
                              option.description.toLowerCase().includes(inputValue.toLowerCase())
                          )
                        }
                        value={
                          products.find((product) => product.id === item.productId) || null
                        }
                        onChange={(event, value) => {
                          setFieldValue(`items[${index}].productId`, value?.id || '');
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Product Code"
                            margin="normal"
                            error={
                              touched.items?.[index]?.productId &&
                              typeof errors.items?.[index] !== 'string' &&
                              // @ts-ignore
                              Boolean(errors.items?.[index]?.productId)
                            }
                            helperText={
                              touched.items?.[index]?.productId && 
                              typeof errors.items?.[index] !== 'string' && 
                              // @ts-ignore
                              errors.items?.[index]?.productId
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
                          touched.items?.[index]?.quantity &&
                          typeof errors.items?.[index] !== 'string' &&
                          // @ts-ignore
                          Boolean(errors.items?.[index]?.quantity)
                        }
                        helperText={
                          touched.items?.[index]?.quantity && 
                          typeof errors.items?.[index] !== 'string' && 
                          // @ts-ignore
                          errors.items?.[index]?.quantity
                        }
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
                          touched.items?.[index]?.imeis &&
                          typeof errors.items?.[index] !== 'string' &&
                          // @ts-ignore
                          Boolean(errors.items?.[index]?.imeis)
                        }
                        helperText={
                          touched.items?.[index]?.imeis && 
                          typeof errors.items?.[index] !== 'string' && 
                          // @ts-ignore
                          errors.items?.[index]?.imeis
                        }
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
                    onClick={() => push({ productId: '', quantity: 0, imeis: '' })}
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