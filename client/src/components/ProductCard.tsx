import React from 'react';
import { Card, CardMedia, CardContent, Typography, CardActions, Button, Chip, Box } from '@mui/material';
import { type Product } from '../services/api';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCartGlobal, getItemQuantity } = useCart();
  
  const quantityInCart = getItemQuantity(product.id);
  const effectiveStock = product.stockQuantity - quantityInCart;
  const isGlobalOutOfStock = product.stockQuantity === 0;
  const isMaxReached = !isGlobalOutOfStock && effectiveStock <= 0;

  const handleAddToCart = async () => {
    if (isMaxReached || isGlobalOutOfStock) return;
    try {
      await addToCartGlobal(product.id);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error adding item');
    }
  };

  return (
    <Card 
        elevation={3} // צל עדין
        sx={{ 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            position: 'relative',
            borderRadius: 3, // פינות עגולות
            transition: 'transform 0.2s',
            '&:hover': {
                transform: 'translateY(-5px)', // אפקט ריחוף קטן
                boxShadow: 6
            }
        }}
    >
        {isGlobalOutOfStock && (
            <Box sx={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                bgcolor: 'rgba(255, 255, 255, 0.7)', zIndex: 1, display: 'flex', 
                alignItems: 'center', justifyContent: 'center'
            }}>
                <Typography variant="h5" fontWeight="bold" color="text.secondary" sx={{ transform: 'rotate(-30deg)', border: '4px solid #666', p: 1, borderRadius: 2 }}>
                    SOLD OUT
                </Typography>
            </Box>
        )}

      <CardMedia
        component="img"
        height="220" // תמונה גדולה יותר
        image={product.imageUrl}
        alt={product.name}
        sx={{ objectFit: 'cover', filter: isGlobalOutOfStock ? 'grayscale(100%)' : 'none' }}
        onError={(e: any) => {
            e.target.src = 'https://via.placeholder.com/220?text=No+Image';
        }}
      />
      
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Typography gutterBottom variant="h5" component="div" fontWeight="bold">
          {product.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: '40px', lineHeight: 1.6 }}>
          {product.description}
        </Typography>
        <Typography variant="h5" color="primary" fontWeight="bold" sx={{ mb: 1 }}>
          ₪{product.price}
        </Typography>
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {isGlobalOutOfStock ? (
                <Chip label="Out of Stock" color="error" size="small" variant="filled" />
            ) : (
                <Chip 
                  label={effectiveStock === 0 ? "0 left" : `${effectiveStock} left`} 
                  color={effectiveStock === 0 ? "default" : (effectiveStock < 5 ? "warning" : "success")} 
                  size="small" 
                  variant="outlined" 
                />
            )}
            
            {quantityInCart > 0 && (
                <Chip label={`In Cart: ${quantityInCart}`} color="primary" size="small" variant="filled" />
            )}
        </Box>
      </CardContent>

      <CardActions sx={{ p: 3, pt: 0 }}>
        <Button 
            fullWidth
            size="large" 
            variant="contained" 
            disabled={isGlobalOutOfStock || isMaxReached} 
            onClick={handleAddToCart}
            color={isMaxReached ? "warning" : "primary"}
            sx={{ borderRadius: 2, py: 1.2, fontWeight: 'bold' }}
        >
          {isGlobalOutOfStock ? 'Out of Stock' : isMaxReached ? 'Max Limit Reached' : 'Add to Cart'}
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;