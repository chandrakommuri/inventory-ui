import React, { useState, useEffect } from 'react';
import { Formik, Form, FieldArray } from 'formik';
import * as Yup from 'yup';
import { Button, Paper, TextField, Box, Typography, CircularProgress } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { useNavigate } from 'react-router-dom';
import { Product } from '../../models/Product';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { CREATE_INWARD_INVOICE_URL, GET_ALL_PRODUCTS_URL, GET_ALL_TRANSPORTERS_URL } from '../../Config';
import { Transporter } from '../../models/Transporter';
import DateFieldWithClick from '../../components/DateFieldWithClick';
import api from '../../Api';

const AddInwardInvoice: React.FC = () => {
  const navigate = useNavigate();

  // State to hold the list of products
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);

  // Fetch products from the API
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

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Initial values for the form
  const initialValues = {
    invoiceNumber: '',
    invoiceDate: '',
    deliveryDate: '',
    transporterId: '',
    docketNumber: '',
    damageReason: '',
    items: [{ productId: '', quantity: 0, imeis: '', damagedQuantity: 0, damagedImeis: '' }], // IMEIs as a single string
  };

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
    transporterId: Yup.string().required('Transporter is required'),
    docketNumber: Yup.string().required('Docket Number is required'),
    // @ts-ignore
    damageReason: Yup.string().test('damages-exists', 'Damage reason is required when adding damaged items', function(value, context) {
      const totalQuantity = context.parent.items.reduce(
        // @ts-ignore
        (acc, ci) =>
          acc +
          (ci.damagedQuantity || 0) +
          // @ts-ignore
          ((ci.damagedImeis?.split('\n').filter(i => i.trim()).length) || 0),
        0
      );
      return totalQuantity === 0 || (value && value.length > 0) ;
    }),
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
          })
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
            // @ts-ignore
            const damagedImeis = context.parent.damagedImeis ? context.parent.damagedImeis.split('\n').filter((imei) => imei.trim() !== '') : [];
            return (imeis.length + damagedImeis.length) === new Set([...imeis, ...damagedImeis]).size;
          }),
        damagedQuantity: Yup.number()
          .min(0, 'Quantity must be at least 0'),
        damagedImeis: Yup.string()
          .test('imeis-match-quantity', 'Number of IMEIs must match the quantity', function (value, context) {
            const imeis = value ? value.split('\n').filter((imei) => imei.trim() !== '') : [];
            const quantity = context.parent.damagedQuantity || 0;
            return imeis.length === quantity;
          })
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
            const damagedImeis = value ? value.split('\n').filter((imei) => imei.trim() !== '') : [];
            // @ts-ignore
            const imeis = context.parent.imeis ? context.parent.imeis.split('\n').filter((imei) => imei.trim() !== '') : [];
            return (imeis.length + damagedImeis.length) === new Set([...imeis, ...damagedImeis]).size;
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
        damagedImeis: item.damagedImeis.split('\n').filter((imei: string) => imei.trim() !== ''),
      })),
    };

    try {
      const resp = await api.post(CREATE_INWARD_INVOICE_URL, formattedValues, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      navigate(`/inward-invoices/view/${resp.data.invoiceId}`);
    } catch (error) {
      console.error('Error adding invoice:', error);
    }
  };

  return (
    <Paper elevation={3} style={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Add Inward Invoice
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
              error={touched.invoiceNumber && Boolean(errors.invoiceNumber)}
              helperText={touched.invoiceNumber && errors.invoiceNumber}
            />
            <DateFieldWithClick
              name="invoiceDate"
              label="Invoice Date"
              fullWidth
              margin="normal"
              onChange={handleChange}
              value={values.invoiceDate}
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: today }}
              error={touched.invoiceDate && Boolean(errors.invoiceDate)}
              helperText={touched.invoiceDate && errors.invoiceDate}
            />
            <DateFieldWithClick
              name="deliveryDate"
              label="Delivery Date"
              fullWidth
              margin="normal"
              onChange={handleChange}
              value={values.deliveryDate}
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: today }}
              error={touched.deliveryDate && Boolean(errors.deliveryDate)}
              helperText={touched.deliveryDate && errors.deliveryDate}
            />
            {loadingTransporters ? (
              <CircularProgress size={24} />
            ) : (
              <Autocomplete
                options={transporters}
                getOptionLabel={(option) => `${option.name}`}
                filterOptions={(options, { inputValue }) =>
                  options.filter((option) =>option.name.toLowerCase().includes(inputValue.toLowerCase()))
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
            <TextField
              name="damageReason"
              label="Damage Reason"
              fullWidth
              margin="normal"
              onChange={handleChange}
              value={values.damageReason}
              error={touched.damageReason && Boolean(errors.damageReason)}
              helperText={touched.damageReason && errors.damageReason}
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
                          getOptionLabel={(option) => `${option.code}-${option.description}`}
                          filterOptions={(options, { inputValue }) =>
                            options.filter(
                              (option) =>
                                option.code.toLowerCase().includes(inputValue.toLowerCase()) ||
                                option.description.toLowerCase().includes(inputValue.toLowerCase())
                            )
                          }
                          onChange={(event, value) => {
                            // Set the productId in Formik when a product is selected
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
                      )}
                      <Box display="flex" gap={2}>
                        <Box flex={1}>
                          <Typography variant="subtitle1">Good Products</Typography>
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
                        </Box>
                        <Box flex={1}>
                          <Typography variant="subtitle1">Damaged Products</Typography>
                          <TextField
                            name={`items[${index}].damagedQuantity`}
                            label="Quantity"
                            type="number"
                            fullWidth
                            margin="normal"
                            onChange={handleChange}
                            value={item.damagedQuantity}
                            error={
                              touched.items?.[index]?.damagedQuantity &&
                              typeof errors.items?.[index] !== 'string' &&
                              // @ts-ignore
                              Boolean(errors.items?.[index]?.damagedQuantity)
                            }
                            helperText={
                              touched.items?.[index]?.damagedQuantity && 
                              typeof errors.items?.[index] !== 'string' && 
                              // @ts-ignore
                              errors.items?.[index]?.damagedQuantity
                            }
                            inputProps={{
                              onWheel: (e) => (e.target as HTMLInputElement).blur(),
                            }}
                          />
                          <TextField
                            name={`items[${index}].damagedImeis`}
                            label="IMEIs (Each IMEI on a new line)"
                            fullWidth
                            margin="normal"
                            multiline
                            rows={4}
                            onChange={handleChange}
                            value={item.damagedImeis}
                            error={
                              touched.items?.[index]?.damagedImeis &&
                              typeof errors.items?.[index] !== 'string' &&
                              // @ts-ignore
                              Boolean(errors.items?.[index]?.damagedImeis)
                            }
                            helperText={
                              touched.items?.[index]?.damagedImeis && 
                              typeof errors.items?.[index] !== 'string' && 
                              // @ts-ignore
                              errors.items?.[index]?.damagedImeis
                            }
                          />
                        </Box>
                      </Box>
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
                    onClick={() => push({ productId: '', quantity: 0, imeis: '', damagedQuantity: 0, damagedImeis: '' })}
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
            <Button variant="outlined" color="primary" style={{ marginTop: '20px', marginLeft: '20px' }} onClick={() => navigate('/inward-invoices')}>
              Cancel
            </Button>
          </Form>
        )}
      </Formik>
    </Paper>
  );
};

export default AddInwardInvoice;