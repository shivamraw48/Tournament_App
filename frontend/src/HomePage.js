import React from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import PersonIcon from '@mui/icons-material/Person';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import InfoIcon from '@mui/icons-material/Info';

const HomePage = () => {
    const navigate = useNavigate();

    const mainBtnStyles = {
        padding: '18px 40px',
        fontSize: '20px',
        borderRadius: '12px',
        backgroundColor: '#03a9f4',
        color: 'white',
        width: '260px',
        transition: '0.3s',
        '&:hover': {
            backgroundColor: '#0288d1',
        },
        display: 'flex',
        justifyContent: 'flex-start',
        gap: '10px'
    };

    return (
        <Box 
            component="main"
            sx={{ padding: '50px 20px', textAlign: 'center' }}
        >
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', marginBottom: '30px' }}>
                Welcome to the Tournament App!
            </Typography>

            <Box
                className="button-container"
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '20px',
                }}
            >
                <Button
                    className="main-btn"
                    sx={mainBtnStyles}
                    startIcon={<PersonIcon />}
                    onClick={() => navigate('/profile')}
                >
                    My Profile
                </Button>
                
                <Button
                    className="main-btn"
                    sx={mainBtnStyles}
                    startIcon={<EmojiEventsIcon />}
                    onClick={() => navigate('/tournaments')}
                >
                    See Tournaments
                </Button>
                
                <Button
                    className="main-btn"
                    sx={mainBtnStyles}
                    startIcon={<AccountBalanceWalletIcon />}
                    onClick={() => navigate('/profile')}
                >
                    My Wallet
                </Button>
                
                <Button
                className="main-btn"
                sx={mainBtnStyles}
                startIcon={<InfoIcon />}
                onClick={() => navigate('/about')}
            >
                About Us
            </Button>
            </Box>
        </Box>
    );
};

export default HomePage;