import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Divider,
  CircularProgress,
} from '@mui/material';
import { InwardInvoice } from '../../models/InwardInvoice';
import { GET_INWARD_INVOICE_URL } from '../../Config';
import api from '../../Api';

const ViewInwardInvoice: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Extract route parameter
  const [invoice, setInvoice] = useState<InwardInvoice | null>(null); // State to hold invoice data
  const [loading, setLoading] = useState<boolean>(true); // State for loading indicator

  const navigate = useNavigate();

  // Fetch invoice details from API
  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await api.get<InwardInvoice>(
          `${GET_INWARD_INVOICE_URL}${id}`
        );
        setInvoice(response.data);
      } catch (error) {
        console.error('Error fetching invoice:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  // Show loading indicator while data is being fetched
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  // Handle case where invoice is null (e.g., API failed or invoice not found)
  if (!invoice) {
    return (
      <Typography variant="h6" align="center" color="error">
        Invoice not found.
      </Typography>
    );
  }

  // Helper function to split IMEIs into columns
  const splitIMEIsIntoColumns = (imeis: string[], itemsPerColumn: number): string[][] => {
    const columns: string[][] = [];
    for (let i = 0; i < imeis.length; i += itemsPerColumn) {
      columns.push(imeis.slice(i, i + itemsPerColumn));
    }
    return columns;
  };

  return (
    <Paper elevation={3} style={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom align="center">
        View Inward Invoice
      </Typography>

      {/* Invoice Details */}
      <Card elevation={2} style={{ marginBottom: '20px' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Invoice Details
          </Typography>
          <Divider style={{ marginBottom: '10px' }} />
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,               // spacing between items (equivalent to spacing={2})
            }}
          >
            {[
              { label: 'Invoice Number', value: invoice.invoiceNumber },
              { label: 'Invoice Date', value: invoice.invoiceDate },
              { label: 'Delivery Date', value: invoice.deliveryDate },
              { label: 'Transporter', value: invoice.transporter },
              { label: 'Docket Number', value: invoice.docketNumber },
              { label: 'Damage Reason', value: invoice.damageReason },
            ].map(({ label, value }) => (
              <Box
                key={label}
                sx={{
                  flex: '1 1 100%',   // full width on small screens
                  maxWidth: { xs: '100%', sm: '50%' }, // half width on small+ screens
                }}
              >
                <Typography variant="body1">
                  <strong>{label}:</strong> {value}
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card elevation={2}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Items
          </Typography>
          <Divider style={{ marginBottom: '10px' }} />
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Product Code</strong></TableCell>
                <TableCell><strong>Description</strong></TableCell>
                <TableCell><strong>Quantity</strong></TableCell>
                <TableCell><strong>IMEIs</strong></TableCell>
                <TableCell><strong>Damaged Quantity</strong></TableCell>
                <TableCell><strong>Damaged IMEIs</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoice.items.map((item, index) => {
                const imeiColumns = splitIMEIsIntoColumns(item.imeis, 10); // Split IMEIs into columns of 10
                const damagedImeiColumns = splitIMEIsIntoColumns(item.damagedImeis, 10); // Split IMEIs into columns of 10
                return (
                  <TableRow key={index}>
                    <TableCell>{item.code}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 2, // space between columns
                        }}
                      >
                        {imeiColumns.map((column, columnIndex) => (
                          <Box
                            key={columnIndex}
                            sx={{
                              flex: '1 1 120px', // column will take at least 120px
                              maxWidth: '200px', // limits overflow
                            }}
                          >
                            {column.map((imei, imeiIndex) => (
                              <Typography key={imeiIndex} variant="body2">
                                {imei}
                              </Typography>
                            ))}
                          </Box>
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>{item.damagedQuantity}</TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 2, // space between columns
                        }}
                      >
                        {damagedImeiColumns.map((column, columnIndex) => (
                          <Box
                            key={columnIndex}
                            sx={{
                              flex: '1 1 120px', // column will take at least 120px
                              maxWidth: '200px', // limits overflow
                            }}
                          >
                            {column.map((imei, imeiIndex) => (
                              <Typography key={imeiIndex} variant="body2">
                                {imei}
                              </Typography>
                            ))}
                          </Box>
                        ))}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Button variant="outlined" color="primary" style={{ marginTop: '20px', marginRight: '20px'}} onClick={() => navigate('/inward-invoices')}>
        Back
      </Button>
      <Button variant="outlined" color="secondary" style={{ marginTop: '20px'}} onClick={() => navigate(`/inward-invoices/edit/${invoice.id}`)}>
        Edit
      </Button>
    </Paper>
  );
};

export default ViewInwardInvoice;