import React, { useEffect, useState } from 'react';
import { Container, Typography, Button, Box, AppBar, Toolbar, Grid, CircularProgress, IconButton, TextField, MenuItem, Select, FormControl, InputLabel, Badge } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import HistoryIcon from '@mui/icons-material/History';
import PersonIcon from '@mui/icons-material/Person'; // אייקון פרופיל
import { useNavigate } from 'react-router-dom';
import { getProducts, type Product } from '../services/api';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('name');

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    navigate('/login');
  };

  const filteredProducts = products
    .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortOrder === 'price-asc') return Number(a.price) - Number(b.price);
      if (sortOrder === 'price-desc') return Number(b.price) - Number(a.price);
      return a.name.localeCompare(b.name);
    });

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      <AppBar position="static" elevation={0} sx={{ bgcolor: '#1976d2' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Fresh Market 🍎
          </Typography>

          <Button color="inherit" startIcon={<HistoryIcon />} onClick={() => navigate('/orders')}>
            My Orders
          </Button>

          {/* כפתור פרופיל החדש */}
          <IconButton color="inherit" onClick={() => navigate('/profile')} sx={{ ml: 1 }}>
            <PersonIcon />
          </IconButton>

          <IconButton color="inherit" onClick={() => navigate('/cart')} sx={{ mr: 2, ml: 1 }}>
            <Badge badgeContent={cartCount} color="error" showZero>
              <ShoppingCartIcon />
            </Badge>
          </IconButton>

          <Button color="inherit" onClick={handleLogout}>Logout</Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 6, mb: 6, flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        <Typography variant="h3" align="center" gutterBottom sx={{ mb: 4, fontWeight: '800', color: '#2c3e50', width: '100%' }}>
          Our Products
        </Typography>

        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mb: 6 }}>
          <Box sx={{
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
            width: '100%',
            maxWidth: '800px',
            bgcolor: 'white',
            p: 3,
            borderRadius: 4,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}>
            <TextField
              label="Search Products"
              variant="outlined"
              sx={{ flexGrow: 1 }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortOrder}
                label="Sort By"
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <MenuItem value="name">Name (A-Z)</MenuItem>
                <MenuItem value="price-asc">Price: Low to High</MenuItem>
                <MenuItem value="price-desc">Price: High to Low</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8, width: '100%' }}>
            <CircularProgress size={60} />
          </Box>
        ) : (
          <Grid
            container
            spacing={4}
            justifyContent="center"
            sx={{ width: '100%' }}
          >
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <Grid key={product.id} size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2.4 }}>
                  <ProductCard product={product} />
                </Grid>
              ))
            ) : (
              /* הודעת "לא נמצאו מוצרים" */
              <Grid size={{ xs: 12 }}>
                <Box sx={{ textAlign: 'center', mt: 4, width: '100%' }}>
                  <Typography variant="h4" color="text.secondary">
                    No products found 😔
                  </Typography>
                  <Button variant="outlined" sx={{ mt: 3 }} onClick={() => setSearchTerm('')}>
                    Clear Search
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default HomePage;