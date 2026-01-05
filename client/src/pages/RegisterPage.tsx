import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Box, Paper, Alert } from '@mui/material';
import { registerUser } from '../services/api';
import { useNavigate } from 'react-router-dom';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  // הגדרת אותם החוקים כמו בשרת
  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  // מתיר כל תו מיוחד (כולל #, -, ., _, וכו')
  const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // ניקוי שגיאות בהקלדה
    setErrors({ ...errors, [name]: '', general: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let valid = true;
    const newErrors = { email: '', password: '', general: '' };

    // בדיקת שדות מלאים
    if (!formData.firstName || !formData.lastName) {
      newErrors.general = 'All fields are required';
      valid = false;
    }

    // בדיקת אימייל
    if (!EMAIL_REGEX.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      valid = false;
    }

    // בדיקת סיסמה קשוחה
    if (!PASSWORD_REGEX.test(formData.password)) {
      newErrors.password = 'Min 8 chars, 1 Uppercase, 1 Lowercase, 1 Number, 1 Symbol (!@#$%)';
      valid = false;
    }

    setErrors(newErrors);

    if (!valid) return;

    try {
      await registerUser(formData);
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (err: any) {
      console.error(err);
      setErrors({ ...newErrors, general: err.response?.data?.message || 'Registration failed' });
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Create Account
          </Typography>

          {errors.general && <Alert severity="error" sx={{ mb: 2 }}>{errors.general}</Alert>}

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
              error={!!errors.email}
              helperText={errors.email}
            />

            <TextField
              margin="normal" required fullWidth
              label="Password" name="password" type="password"
              value={formData.password} onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password} // כאן המשתמש יראה את דרישות הסיסמה אם הוא טועה
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