import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Skeleton,
  Typography,
} from '@mui/material';
import axios from 'axios';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import InputIcon from '@mui/icons-material/Input';
import OutputIcon from '@mui/icons-material/Output';
import OutboxIcon from '@mui/icons-material/Outbox';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import MoveToInboxIcon from '@mui/icons-material/MoveToInbox';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import PeopleIcon from '@mui/icons-material/People';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { DASHBOARD_SUMMARY_URL } from '../Config';
import { DashboardSummary } from '../models/DashboardSummary';
import InventoryBreakdownChart from '../components/InventoryBreakdownChart';

const kpiLabels: {
  key: keyof DashboardSummary;
  label: string;
  bg: string;
  icon: React.ReactNode;
}[] = [
  {
    key: 'totalInwardQuantity',
    label: 'Inward Qty',
    bg: '#e8f5e9',
    icon: <InputIcon color="success" fontSize="large" />,
  },
  {
    key: 'totalOutwardQuantity',
    label: 'Outward Qty',
    bg: '#fff3e0',
    icon: <OutputIcon color="warning" fontSize="large" />,
  },
  {
    key: 'totalPhysicalQuantity',
    label: 'Physical Qty',
    bg: '#e3f2fd',
    icon: <Inventory2Icon color="primary" fontSize="large" />,
  },
  {
    key: 'totalDamagedQuantity',
    label: 'Damaged Qty',
    bg: '#ffebee',
    icon: <ReportProblemIcon color="error" fontSize="large" />,
  },
  {
    key: 'totalInwardInvoices',
    label: 'Inward Invoices',
    bg: '#e8eaf6',
    icon: <MoveToInboxIcon sx={{ color: '#3f51b5' }} fontSize="large" />,
  },
  {
    key: 'totalOutwardInvoices',
    label: 'Outward Invoices',
    bg: '#ffecb3',
    icon: <OutboxIcon sx={{ color: '#fb8c00' }} fontSize="large" />,
  },
  {
    key: 'totalProducts',
    label: 'Products',
    bg: '#e0f7fa',
    icon: <PhoneAndroidIcon sx={{ color: '#00acc1' }} fontSize="large" />,
  },
  {
    key: 'totalCustomers',
    label: 'Customers',
    bg: '#f9fbe7',
    icon: <PeopleIcon sx={{ color: '#8bc34a' }} fontSize="large" />,
  },
  {
    key: 'totalDestinations',
    label: 'Destinations',
    bg: '#e0f2f1',
    icon: <LocationOnIcon sx={{ color: '#00796b' }} fontSize="large" />,
  },
];

const Dashboard = () => {
  const [kpi, setKpi] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get<DashboardSummary>(DASHBOARD_SUMMARY_URL)
      .then((res) => setKpi(res.data))
      .catch((err) => console.error('Failed to fetch KPIs', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      {/* Inventory Breakdown Section */}
      <Box mt={4}>
        <Typography variant="h5" gutterBottom>
          Inventory Breakdown
        </Typography>
        <Card variant="outlined">
          <CardContent>
            <Grid container spacing={2}>
              {/* Pie Chart */}
              <Grid size={{ xs: 12, md: 6 }}>
                <InventoryBreakdownChart
                  inward={kpi?.totalInwardQuantity ?? 0}
                  outward={kpi?.totalOutwardQuantity ?? 0}
                  physical={kpi?.totalPhysicalQuantity ?? 0}
                  damaged={kpi?.totalDamagedQuantity ?? 0}
                />
              </Grid>

              {/* Quantity KPIs */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Grid container spacing={2}>
                  {kpiLabels.slice(0, 4).map(({ key, label, bg, icon }) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={key}>
                      <Card variant="elevation" sx={{ backgroundColor: bg }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          {icon}
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                              {label}
                            </Typography>
                            <Typography variant="h6">
                              {loading ? (
                                <Skeleton variant="text" width={80} height={32} />
                              ) : (
                                kpi?.[key]
                              )}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      {/* Other Statistics Section */}
      <Box mt={4}>
        <Typography variant="h5" gutterBottom>
          Other Statistics
        </Typography>
        <Grid container spacing={2}>
          {kpiLabels.slice(4).map(({ key, label, bg, icon }) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={key}>
              <Card variant="elevation" sx={{ backgroundColor: bg }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {icon}
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      {label}
                    </Typography>
                    <Typography variant="h6">
                      {loading ? (
                        <Skeleton variant="text" width={80} height={32} />
                      ) : (
                        kpi?.[key]
                      )}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;
