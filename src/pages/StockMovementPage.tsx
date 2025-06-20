import React, { useState } from 'react';
import {
  Box, Button, Grid, Paper, CircularProgress,
  GridLegacy
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import dayjs, { Dayjs } from 'dayjs';
import axios from 'axios';
import { Table } from 'antd';
import * as XLSX from 'xlsx';
import 'antd/dist/reset.css'; // Reset AntD styles
import { STOCK_MOVEMENT_URL } from '../Config';
import DownloadIcon from '@mui/icons-material/Download';

type StockRow = Record<string, string | number>;

const StockMovementPage: React.FC = () => {
  const [data, setData] = useState<StockRow[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      startDate: null as Dayjs | null,
      endDate: null as Dayjs | null
    },
    validationSchema: Yup.object({
      startDate: Yup.date()
        .required('Start date is required'),

      endDate: Yup.date()
        .required('End date is required')
        .min(Yup.ref('startDate'), 'End date must be after start date')
        .test(
          'max-duration',
          'Date range cannot exceed 31 days',
          function (endDate) {
            const { startDate } = this.parent;
            if (!startDate || !endDate) return true;
            const diff = dayjs(endDate).diff(dayjs(startDate), 'day');
            return diff <= 30; // 31-day window = 0-based diff max 30
          }
        )
    }),
    onSubmit: async (values) => {
      setLoading(true);
      const start = values.startDate?.format('YYYY-MM-DD');
      const end = values.endDate?.format('YYYY-MM-DD');
      try {
        const res = await axios.get<StockRow[]>(STOCK_MOVEMENT_URL, {
          params: { startDate: start, endDate: end }
        });
        const data = res.data;
        let sno = 1;
        data.forEach(d => d.sno = sno++);
        setData(res.data);
        if (res.data.length > 0) {
          const keys = Object.keys(res.data[0]);
          const uniqueDates = keys
            .filter(k => k.endsWith('_IN'))
            .map(k => k.replace('_IN', ''));
          setDates(uniqueDates);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      }
      setLoading(false);
    }
  });

  const exportToExcel = () => {
    const headersRow1 = ['S. No', 'Product Code', 'Product Description', ...dates.flatMap(date => [date, ''])];
    const headersRow2 = ['', '', '', ...dates.flatMap(() => ['IN', 'OUT'])];

    const rows = data.map(row => {
      const base = [row.sno, row.productCode, row.productDescription];
      const values = dates.flatMap(date => [
        row[`${date}_IN`] || 0,
        row[`${date}_OUT`] || 0
      ]);
      return [...base, ...values];
    });

    const sheetData = [headersRow1, headersRow2, ...rows];

    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

    // ✅ Auto-adjust column widths based on maximum cell length
    const columnWidths = sheetData[0].map((_, colIndex) => {
      const maxWidth = sheetData.reduce((max, row) => {
        const cell = row[colIndex];
        const cellLength = cell ? cell.toString().length : 0;
        return Math.max(max, cellLength);
      }, 10); // Minimum column width
      return { wch: maxWidth + 2 }; // +2 for padding
    });

    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Stock Movement');
    XLSX.writeFile(workbook, 'stock_movement.xlsx');
  };



  const baseColumns = [
    {
      title: 'S. No',
      dataIndex: 'sno',
      key: 'sno',
      align: 'center' as const,
    },
    {
      title: 'Product Code',
      dataIndex: 'productCode',
      key: 'productCode',
      align: 'center' as const
    },
    {
      title: 'Product Description',
      dataIndex: 'productDescription',
      key: 'productDescription',
      align: 'center' as const
    }
  ];

  const dateColumns = dates.map(date => ({
    title: date,
    children: [
      {
        title: 'IN',
        dataIndex: `${date}_IN`,
        key: `${date}_IN`,
        align: 'center',
      },
      {
        title: 'OUT',
        dataIndex: `${date}_OUT`,
        key: `${date}_OUT`,
        align: 'center'
      }
    ]
  }));

  return (
    <Box sx={{ padding: 3 }}>
      <Paper elevation={2} sx={{ padding: 3, marginBottom: 4 }}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2} alignItems="center">
            <GridLegacy item xs={12} md={4}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Start Date"
                  disableFuture
                  value={formik.values.startDate}
                  onChange={(val) => formik.setFieldValue('startDate', val)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: Boolean(formik.errors.startDate && formik.touched.startDate),
                      helperText: formik.touched.startDate && formik.errors.startDate
                    }
                  }}
                />
              </LocalizationProvider>
            </GridLegacy>
            <GridLegacy item xs={12} md={4}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="End Date"
                  disableFuture
                  value={formik.values.endDate}
                  onChange={(val) => formik.setFieldValue('endDate', val)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: Boolean(formik.errors.endDate && formik.touched.endDate),
                      helperText: formik.touched.endDate && formik.errors.endDate
                    }
                  }}
                />
              </LocalizationProvider>
            </GridLegacy>
            <GridLegacy item xs={12} md={4}>
              <Button type="submit" variant="contained" color="primary" fullWidth>
                Load Stock Movement
              </Button>
            </GridLegacy>
          </Grid>
        </form>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : (
        <>
          {data.length > 0 && (
            <Box>
              <Box mb={2}>
                <Button 
                  variant="outlined" 
                  color="success" 
                  onClick={exportToExcel}
                  endIcon={<DownloadIcon />}
                  >
                  Download
                </Button>
              </Box>
              <Table
                dataSource={data}
                columns={[...baseColumns, ...dateColumns]}
                rowKey="productCode"
                bordered
                scroll={{ x: 'max-content' }}
                pagination={false}
                style={{ borderRadius: 6 }}
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default StockMovementPage;
