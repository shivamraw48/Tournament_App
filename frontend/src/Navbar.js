import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { jwtDecode } from 'jwt-decode';
import api from './api/axiosConfig';
import socket from './socket';

import { AppBar, Toolbar, Box } from '@mui/material';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';

import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const [walletBalance, setWalletBalance] = useState(0);
    const navigate = useNavigate();

    let isAdmin = false;
    if (user && user.token) {
        try {
            const decodedToken = jwtDecode(user.token);
            isAdmin = decodedToken.isAdmin;
        } catch (error) {
            console.error("Invalid token in navbar:", error);
        }
    }

    useEffect(() => {
        if (user) {
            const fetchWallet = async () => {
                try {
                    const res = await api.get('/api/users/profile');
                    setWalletBalance(res.data.user.walletBalance);
                } catch (error) {
                    console.error("Could not fetch wallet", error);
                }
            };
            fetchWallet();
        }
    }, [user]);

useEffect(() => {
    if (!user) return;

    const loggedInUserId = jwtDecode(user.token).id;

    const handleWalletUpdate = (data) => {
        if (data.userId === loggedInUserId) {
            console.log("Wallet update received:", data.newBalance);
            setWalletBalance(data.newBalance);
        }
    };

    socket.on('walletUpdate', handleWalletUpdate);

    return () => {
        socket.off('walletUpdate', handleWalletUpdate);
    };
}, [user]);
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    
    return (
        <AppBar 
            position="static" 
            sx={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', boxShadow: 'none' }}
        >
            <Toolbar sx={{ padding: '20px' }}>
                
                <Box sx={{ flexBasis: '33.33%', display: 'flex', justifyContent: 'flex-start' }} />

                <Typography 
                    variant="h4" 
                    component={Link} 
                    to="/home"
                    sx={{ 
                        flexBasis: '33.33%',
                        textAlign: 'center',
                        textDecoration: 'none', 
                        color: 'white', 
                        fontWeight: 'bold',
                        fontSize: '32px'
                    }}
                >
                    Tournament App
                </Typography>

                <Box sx={{ 
                    flexBasis: '33.33%',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'flex-end',
                    gap: '10px' 
                }}>
                    {user ? (
                        <>
                            {isAdmin && (
                                <Button 
                                    component={Link} 
                                    to="/admin" 
                                    variant="contained"
                                    sx={{ 
                                        backgroundColor: '#1b03f4',
                                        borderRadius: '10px',
                                        padding: '10px 20px',
                                        '&:hover': { backgroundColor: '#1502b0' }
                                    }}
                                >
                                    Admin
                                </Button>
                            )}
                            
                            <Button 
                                className="notif-btn"
                                startIcon={<NotificationsIcon />}
                                variant="contained"
                                sx={{
                                    backgroundColor: '#1b03f4',
                                    color: 'white',
                                    padding: '10px 20px',
                                    fontSize: '14px',
                                    borderRadius: '10px',
                                    '&:hover': { backgroundColor: '#1502b0' }
                                }}
                            >
                                Notifications
                            </Button>

                            <Chip 
                                className="wallet-btn"
                                icon={<AccountBalanceWalletIcon sx={{ color: '#000 !important' }} />}
                                label={`₹${walletBalance.toFixed(2)}`}
                                sx={{
                                    backgroundColor: '#ffc107',
                                    color: '#000',
                                    padding: '20px 10px',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    borderRadius: '10px'
                                }}
                            />
                            
                            <Button 
                                onClick={handleLogout} 
                                sx={{ 
                                    color: 'white',
                                    padding: '10px 20px',
                                    fontSize: '14px',
                                }}
                            >
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button component={Link} to="/" color="inherit">Register</Button>
                            <Button component={Link} to="/login" color="inherit">Login</Button>
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;