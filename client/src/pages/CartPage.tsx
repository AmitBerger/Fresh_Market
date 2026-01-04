import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Button, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { removeFromCart, checkout } from '../services/api';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  // משתמשים בעגלה מהקונטקסט כדי שתהיה מסונכרנת תמיד
  const { cart, refreshCart, updateQuantityGlobal } = useCart();
  const [loading, setLoading] = useState(false); // לשימוש בפעולות ארוכות כמו צ'קאאוט

  useEffect(() => {
    refreshCart();
  }, []);

  const handleUpdateQuantity = async (itemId: number, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) return; // לא מאפשרים פחות מ-1 כאן (בשביל זה יש מחיקה)

    try {
      await updateQuantityGlobal(itemId, newQuantity);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update quantity');
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    if (window.confirm('Are you sure you want to remove this item?')) {
        try {
            await removeFromCart(itemId);
            refreshCart(); 
        } catch (error) {
            alert('Failed to remove item');
        }
    }
  };

  const handleCheckout = async () => {
    setLoading(true);
    try {
      await checkout();
      alert('Order placed successfully!');
      refreshCart();
      navigate('/home'); 
    } catch (error: any) {
      alert('Checkout failed: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!cart) return 0;
    return cart.items.reduce((total, item) => {
      return total + (Number(item.product.price) * item.quantity);
    }, 0);
  };

  if (!cart && loading) return <Container sx={{ mt: 5, textAlign: 'center' }}><CircularProgress /></Container>;

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Shopping Cart
      </Typography>

      {!cart || cart.items.length === 0 ? (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="h6">Your cart is empty.</Typography>
            <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/home')}>
                Go Shopping
            </Button>
        </Box>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell align="center">Quantity</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cart.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
                        <img 
                            src={item.product.imageUrl} 
                            alt={item.product.name} 
                            style={{ width: 50, height: 50, objectFit: 'cover', marginRight: 15, borderRadius: 4 }} 
                            onError={(e: any) => e.target.src = 'https://via.placeholder.com/50'}
                        />
                        {item.product.name}
                    </TableCell>
                    <TableCell>₪{item.product.price}</TableCell>
                    
                    {/* תא הכמות החדש */}
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IconButton size="small" onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)} disabled={item.quantity <= 1}>
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <Typography sx={{ mx: 2 }}>{item.quantity}</Typography>
                        <IconButton size="small" onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}>
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>

                    <TableCell>₪{(Number(item.product.price) * item.quantity).toFixed(2)}</TableCell>
                    <TableCell align="right">
                      <IconButton color="error" onClick={() => handleRemoveItem(item.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ mr: 3 }}>
                Total: ₪{calculateTotal().toFixed(2)}
            </Typography>
            <Button 
                variant="contained" 
                size="large" 
                color="primary"
                onClick={handleCheckout}
                disabled={loading}
            >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Checkout'}
            </Button>
          </Box>
          
          <Button sx={{ mt: 2 }} onClick={() => navigate('/home')}>
              Continue Shopping
          </Button>
        </>
      )}
    </Container>
  );
};

export default CartPage;