import React, { useState, useEffect } from 'react';
import { Formik, Form, FieldArray } from 'formik';
import * as Yup from 'yup';
import { useParams, useNavigate } from 'react-router-dom';
import { Paper, TextField, Button, Box, Typography, CircularProgress } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { OutwardInvoice } from '../../models/OutwardInvoice';
import DeleteIcon from '@mui/icons-material/Delete';
import { CREATE_NEW_CUSTOMER_URL, CREATE_NEW_DESTINATION_URL, CREATE_NEW_TRANSPORTER_URL, GET_ALL_CUSTOMERS_URL, GET_ALL_DESTINATIONS_URL, GET_ALL_PRODUCTS_URL, GET_ALL_TRANSPORTERS_URL, GET_OUTWARD_INVOICE_URL, UPDATE_OUTWARD_INVOICE_URL } from '../../Config';
import { Product } from '../../models/Product';
import { Customer } from '../../models/Customer';
import { Destination } from '../../models/Destination';
import { Transporter } from '../../models/Transporter';
import DateFieldWithClick from '../../components/DateFieldWithClick';
import api from '../../Api';
import AddableAutocomplete from '../../components/AddableAutocomplete';

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
        const response = await api.get<Product[]>(GET_ALL_PRODUCTS_URL);
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
        const response = await api.get<Customer[]>(GET_ALL_CUSTOMERS_URL);
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
        const response = await api.get<Destination[]>(GET_ALL_DESTINATIONS_URL);
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
        const response = await api.get<Transporter[]>(GET_ALL_TRANSPORTERS_URL);
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
        const response = await api.get<OutwardInvoice>(
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
          .test('imeis-contents', 'IMEI should value should be numeric', function (value, context) {
            const numberRegex = /^\d+$/;
            const imeis = value ? value.split('\n').filter((imei) => imei.trim() !== '') : [];
            return imeis.every(imei => numberRegex.test(imei));
          })
          .test('imeis-length', 'Length of each IMEI must be 15 or 18', function (value, context) {
            const imeis = value ? value.split('\n').filter((imei) => imei.trim() !== '') : [];
            return imeis.every(imei => imei.length === 15 || imei.length === 18);
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
          })
          .test('imeis-match-product', 'IMEIs should match the product', function (value, context) {
            const imeis = value
              ? value.split('\n').map(s => s.trim()).filter(Boolean)
              : [];

            const productId = parseInt(context.parent.productId);
            const product = products.find(p => p.id === productId);
            if (!product || !product.imeis) return false;
            const validImeis = new Set(product.imeis);

            const existingItem = initialValues?.items.find(item => item.productId === productId);
            // @ts-ignore
            const existingImeis = new Set(existingItem?(existingItem.imeis as string).split("\n"):[]);
            
            return imeis.every(i => validImeis.has(i) || existingImeis.has(i));
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
      await api.put(`${UPDATE_OUTWARD_INVOICE_URL}${id}`, formattedValues, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      navigate(`/outward-invoices/view/${formattedValues.id}`);
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
            <DateFieldWithClick
              name="invoiceDate"
              label="Invoice Date"
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
              <AddableAutocomplete
                value={customers.find((c) => c.id === values.customerId) || null}
                onChange={(val) => setFieldValue('customerId', val?.id || '')}
                options={customers}
                setOptions={setCustomer}
                createUrl={CREATE_NEW_CUSTOMER_URL}
                label="Customer"
                error={touched.customerId && Boolean(errors.customerId)}
                helperText={touched.customerId && errors.customerId}
              />
            )}
            {loadingDestinations ? (
              <CircularProgress size={24} />
            ) : (
              <AddableAutocomplete
                value={destinations.find((c) => c.id === values.destinationId) || null}
                onChange={(val) => setFieldValue('destinationId', val?.id || '')}
                options={destinations}
                setOptions={setDestination}
                createUrl={CREATE_NEW_DESTINATION_URL}
                label="Destination"
                error={touched.destinationId && Boolean(errors.destinationId)}
                helperText={touched.destinationId && errors.destinationId}
              />
            )}
            {loadingTransporters ? (
              <CircularProgress size={24} />
            ) : (
              <AddableAutocomplete
                value={transporters.find((c) => c.id === values.transporterId) || null}
                onChange={(val) => setFieldValue('transporterId', val?.id || '')}
                options={transporters}
                setOptions={setTransporters}
                createUrl={CREATE_NEW_TRANSPORTER_URL}
                label="Transporter"
                error={touched.transporterId && Boolean(errors.transporterId)}
                helperText={touched.transporterId && errors.transporterId}
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
                        inputProps={{
                          onWheel: (e) => (e.target as HTMLInputElement).blur(),
                        }}
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