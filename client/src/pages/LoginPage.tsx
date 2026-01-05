import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Box, Paper, FormControlLabel, Checkbox, Alert } from '@mui/material';
import { loginUser } from '../services/api';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  const [emailError, setEmailError] = useState('');
  const [serverError, setServerError] = useState('');

  // אותו Regex כמו בהרשמה ובשרת
  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    setEmailError('');

    if (!EMAIL_REGEX.test(email)) {
        setEmailError('Invalid email format');
        return;
    }

    try {
      const data = await loginUser({ email, password });
      const token = data.access_token;
      
      if (rememberMe) {
        localStorage.setItem('token', token);
      } else {
        sessionStorage.setItem('token', token);
      }
      
      navigate('/home');
      
    } catch (err) {
      setServerError('Invalid email or password');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Sign In
          </Typography>

          {serverError && <Alert severity="error" sx={{ mb: 2 }}>{serverError}</Alert>}

          <form onSubmit={handleLogin}>
            <TextField
              margin="normal" required fullWidth
              label="Email Address" type="email"
              value={email} 
              onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError('');
              }}
              error={!!emailError}
              helperText={emailError}
            />
            <TextField
              margin="normal" required fullWidth
              label="Password" type="password"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
            
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />}
              label="Remember me"
            />

            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
              Sign In
            </Button>
            
            <Button fullWidth color="secondary" onClick={() => navigate('/register')}>
              Don't have an account? Sign Up
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;