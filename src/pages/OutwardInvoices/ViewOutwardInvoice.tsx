import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
import { OutwardInvoice } from '../../models/OutwardInvoice';
import { GET_OUTWARD_INVOICE_URL } from '../../Config';

const ViewOutwardInvoice: React.FC = () => {
  const navigate = useNavigate();

  const { invoiceNumber } = useParams<{ invoiceNumber: string }>(); // Extract route parameter
  const [invoice, setInvoice] = useState<OutwardInvoice | null>(null); // State to hold invoice data
  const [loading, setLoading] = useState<boolean>(true); // State for loading indicator

  // Fetch invoice details from API
  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await axios.get<OutwardInvoice>(
          `${GET_OUTWARD_INVOICE_URL}${invoiceNumber}`
        );
        setInvoice(response.data);
      } catch (error) {
        console.error('Error fetching invoice:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [invoiceNumber]);

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

  return (
    <Paper elevation={3} style={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom align="center">
        View Outward Invoice
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
              { label: 'Customer Name', value: invoice.customerName },
              { label: 'Destination', value: invoice.destination },
              { label: 'Transporter', value: invoice.transporter },
              { label: 'Docket Number', value: invoice.docketNumber },
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
                <TableCell><strong>Quantity</strong></TableCell>
                <TableCell><strong>IMEIs</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoice.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.productCode}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>
                    <Typography variant="body2" style={{ whiteSpace: 'pre-wrap' }}>
                      {item.imeis.join('\n')} {/* Display IMEIs separated by new lines */}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Button variant="outlined" color="primary" style={{ marginTop: '20px'}} onClick={() => navigate('/outward-invoices')}>
        Back
      </Button>
    </Paper>
  );
};

export default ViewOutwardInvoice;