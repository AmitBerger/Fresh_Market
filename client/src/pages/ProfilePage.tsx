import React, { useEffect, useState } from 'react';
import { Container, Typography, TextField, Button, Box, Paper, Alert, CircularProgress, Tabs, Tab, Table, TableHead, TableRow, TableCell, TableBody, Chip, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { getUserProfile, updateUserProfile, changeUserPassword, getMyOrders, type Order } from '../services/api';
import { useNavigate, useLocation } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [profileData, setProfileData] = useState({ firstName: '', lastName: '', email: '' });
  const [passwordData, setPasswordData] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // בדיקה אם הגענו עם בקשה לפתוח טאב ספציפי (למשל מהכפתור My Orders)
  useEffect(() => {
    if (location.state && typeof location.state.tab === 'number') {
      setTabValue(location.state.tab);
    }
  }, [location.state]);

  // טעינת פרופיל ראשונית
  useEffect(() => {
    getUserProfile()
      .then((user) => {
        setProfileData({ firstName: user.firstName, lastName: user.lastName, email: user.email });
      })
      .catch(() => setMessage({ type: 'error', text: 'Failed to load profile data' }))
      .finally(() => setLoading(false));
  }, []);

  // טעינת הזמנות רק כשנמצאים בטאב ההזמנות
  useEffect(() => {
    if (tabValue === 2) {
      setOrdersLoading(true);
      getMyOrders()
        .then((data) => setOrders(data))
        .catch((err) => console.error("Failed to load orders", err))
        .finally(() => setOrdersLoading(false));
    }
  }, [tabValue]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setMessage(null);
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserProfile({ firstName: profileData.firstName, lastName: profileData.lastName });
      setMessage({ type: 'success', text: 'Profile details updated!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await changeUserPassword(passwordData);
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData('');
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update password.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Container sx={{ mt: 5, textAlign: 'center' }}><CircularProgress /></Container>;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/home')} sx={{ mb: 2 }}>
        Back to Shop
      </Button>

      <Typography variant="h4" gutterBottom fontWeight="bold">
        Account Management
      </Typography>

      <Paper elevation={3}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth" indicatorColor="primary" textColor="primary">
          <Tab icon={<PersonIcon />} label="Personal Details" />
          <Tab icon={<LockIcon />} label="Security" />
          <Tab icon={<ReceiptLongIcon />} label="My Orders" />
        </Tabs>

        <Box sx={{ p: 4 }}>
          {message && <Alert severity={message.type} sx={{ mb: 3 }}>{message.text}</Alert>}

          {/* === Tab 0: Personal Details === */}
          {tabValue === 0 && (
            <form onSubmit={handleProfileUpdate}>
              <TextField
                label="Email Address"
                fullWidth
                margin="normal"
                value={profileData.email}
                disabled
                helperText="Email cannot be changed."
              />
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <TextField
                  label="First Name"
                  fullWidth
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  required
                />
                <TextField
                  label="Last Name"
                  fullWidth
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  required
                />
              </Box>
              <Button type="submit" variant="contained" size="large" sx={{ mt: 3 }} startIcon={<SaveIcon />} disabled={saving}>
                {saving ? 'Saving...' : 'Update Profile'}
              </Button>
            </form>
          )}

          {/* === Tab 1: Security === */}
          {tabValue === 1 && (
            <form onSubmit={handlePasswordUpdate}>
              <Typography variant="h6" gutterBottom>Change Password</Typography>
              <TextField
                label="New Password"
                type="password"
                fullWidth
                margin="normal"
                value={passwordData}
                onChange={(e) => setPasswordData(e.target.value)}
                required
                helperText="Enter a new strong password."
              />
              <Button type="submit" variant="contained" color="error" size="large" sx={{ mt: 2 }} disabled={saving || passwordData.length < 4}>
                {saving ? 'Processing...' : 'Change Password'}
              </Button>
            </form>
          )}

          {/* === Tab 2: My Orders === */}
          {tabValue === 2 && (
            <Box>
              {ordersLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                </Box>
              ) : orders.length === 0 ? (
                <Typography align="center" color="text.secondary">No orders found.</Typography>
              ) : (
                orders.map((order, index) => (
                  <Accordion key={order.id} sx={{ mb: 2, border: '1px solid #eee' }} elevation={0}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#f9f9f9' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mr: 2, alignItems: 'center' }}>
                          <Typography fontWeight="bold">Order #{orders.length - index}</Typography>
                          <Typography variant="body2">{new Date(order.createdAt).toLocaleDateString()}</Typography>
                          <Chip label={order.status} color="primary" size="small" />
                          <Typography fontWeight="bold">₪{Number(order.totalAmount).toFixed(2)}</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Product</TableCell>
                            <TableCell>Qty</TableCell>
                            <TableCell align="right">Total</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {order.items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.product.name}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell align="right">₪{(Number(item.priceAtPurchase) * item.quantity).toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </AccordionDetails>
                  </Accordion>
                ))
              )}
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default ProfilePage;