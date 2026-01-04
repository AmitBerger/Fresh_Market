import React, { useEffect, useState } from 'react';
import { Container, Typography, Table, TableHead, TableRow, TableCell, TableBody, Chip, Accordion, AccordionSummary, AccordionDetails, Box, Button, CircularProgress } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getMyOrders, type Order } from '../services/api';
import { useNavigate } from 'react-router-dom';

const OrdersHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyOrders()
      .then(setOrders)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Container sx={{mt:4, textAlign: 'center'}}><CircularProgress /></Container>;

  return (
    <Container sx={{ mt: 4 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/home')} sx={{ mb: 2 }}>
        Back to Shop
      </Button>

      <Typography variant="h4" gutterBottom>My Order History</Typography>
      
      {orders.length === 0 && <Typography>You haven't placed any orders yet.</Typography>}

      {orders.map((order) => (
        <Accordion key={order.id} sx={{ mb: 2, border: '1px solid #eee' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#f5f5f5' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mr: 2, alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Typography fontWeight="bold">Order #{order.id}</Typography>
                <Typography color="text.secondary">
                    {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString()}
                </Typography>
                <Chip label={order.status} color="primary" size="small" />
                <Typography fontWeight="bold" color="primary">Total: ₪{Number(order.totalAmount).toFixed(2)}</Typography>
            </Box>
          </AccordionSummary>
          
          <AccordionDetails>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Items:</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Price at Purchase</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.product.name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>₪{item.priceAtPurchase}</TableCell>
                    <TableCell align="right">₪{(Number(item.priceAtPurchase) * item.quantity).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AccordionDetails>
        </Accordion>
      ))}
    </Container>
  );
};

export default OrdersHistoryPage;