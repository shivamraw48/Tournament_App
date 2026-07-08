import React, { useState, useContext } from 'react';
import api from './api/axiosConfig';
import { Link, useNavigate } from 'react-router-dom';


import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Link as MuiLink } from '@mui/material';

import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { AuthContext } from './context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleMouseDownPassword = (event) => event.preventDefault();

    const { username, email, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            const res = await api.post('/api/users/register', formData);
            login(res.data);
            setIsError(false);
            navigate('/home');
        } catch (error) {
            if (error.response) {
                setMessage(error.response.data.message);
            } else if (error.request) {
                setMessage('Cannot connect to server. Please try again later.');
            } else {
                setMessage(error.message);
            }
            setIsError(true);
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
            }}
        >
            <Box
                component="form"
                onSubmit={onSubmit}
                sx={{
                    maxWidth: 400,
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    padding: '40px',
                    borderRadius: '16px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(12px)',
                    textAlign: 'center',
                }}
            >
                <Typography variant="h4" component="h2" sx={{ mb: '30px', color: 'white' }}>
                    Create Account
                </Typography>

                <TextField
                    name="username"
                    placeholder="Username"
                    value={username}
                    onChange={onChange}
                    required
                    fullWidth
                    margin="normal"
                    InputProps={{
                        sx: {
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            color: 'white',
                            borderRadius: '8px',
                            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                        },
                    }}
                    InputLabelProps={{ sx: { color: '#ccc' } }}
                    sx={{ input: { color: 'white' }, '& ::placeholder': { color: '#ccc' } }}
                />
                
                <TextField
                    name="email"
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={onChange}
                    required
                    fullWidth
                    margin="normal"
                    InputProps={{
                        sx: {
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            color: 'white',
                            borderRadius: '8px',
                            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                        },
                    }}
                    InputLabelProps={{ sx: { color: '#ccc' } }}
                    sx={{ input: { color: 'white' }, '& ::placeholder': { color: '#ccc' } }}
                />

                <TextField
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={onChange}
                    required
                    fullWidth
                    margin="normal"
                    InputProps={{
                        sx: {
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            color: 'white',
                            borderRadius: '8px',
                            '& .MoiOutlinedInput-notchedOutline': { border: 'none' },
                        },
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={handleClickShowPassword}
                                    onMouseDown={handleMouseDownPassword}
                                    edge="end"
                                    sx={{ color: '#ccc' }}
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                    InputLabelProps={{ sx: { color: '#ccc' } }}
                    sx={{ input: { color: 'white' }, '& ::placeholder': { color: '#ccc' } }}
                />


                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    sx={{
                        padding: '12px',
                        backgroundColor: '#03a9f4',
                        color: 'white',
                        borderRadius: '8px',
                        fontSize: '16px',
                        marginTop: '20px',
                        '&:hover': {
                            backgroundColor: '#0288d1',
                        },
                    }}
                >
                    Register
                </Button>

                {message && (
                    <Typography
                        id="message"
                        sx={{
                            marginTop: '15px',
                            fontSize: '14px',
                            color: isError ? '#ff6b6b' : '#4caf50',
                        }}
                    >
                        {message}
                    </Typography>
                )}

                <MuiLink
                    component={Link}
                    to="/login"
                    className="link"
                    sx={{
                        fontSize: '14px',
                        color: '#ffeb3b',
                        textDecoration: 'none',
                        display: 'block',
                        marginTop: '15px',
                        '&:hover': {
                            textDecoration: 'underline',
                        },
                    }}
                >
                    Already have an account? Login
                </MuiLink>
            </Box>
        </Box>
    );
};

export default Register;