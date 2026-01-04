import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Box, Paper, Alert } from '@mui/material';
import { registerUser } from '../services/api';
import { useNavigate } from 'react-router-dom';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate(); // הוק למעבר בין דפים
  
  // ניהול ה-State של הטופס
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  // עדכון ה-State בכל פעם שהמשתמש מקליד
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // שליחת הטופס
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // מניעת ריענון הדף
    try {
      await registerUser(formData);
      // אם הצליח -> עוברים לדף התחברות
      navigate('/login');
    } catch (err: any) {
      console.error(err);
      setError('Registration failed. Try again.');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Create Account
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                margin="normal" required fullWidth
                label="First Name" name="firstName"
                value={formData.firstName} onChange={handleChange}
                />
                <TextField
                margin="normal" required fullWidth
                label="Last Name" name="lastName"
                value={formData.lastName} onChange={handleChange}
                />
            </Box>
            <TextField
              margin="normal" required fullWidth
              label="Email Address" name="email" type="email"
              value={formData.email} onChange={handleChange}
            />
            <TextField
              margin="normal" required fullWidth
              label="Password" name="password" type="password"
              value={formData.password} onChange={handleChange}
            />
            
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
              Sign Up
            </Button>
            
            <Button fullWidth color="secondary" onClick={() => navigate('/login')}>
              Already have an account? Login
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterPage;