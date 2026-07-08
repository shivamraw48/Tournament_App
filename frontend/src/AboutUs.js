import React from 'react';
import { useNavigate } from 'react-router-dom';

import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const AboutUs = () => {
    const navigate = useNavigate();

    const paperStyle = {
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        padding: { xs: '20px', md: '30px' },
        borderRadius: '12px',
        color: 'white',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5)',
        maxWidth: '700px',
        margin: '0 auto',
        textAlign: 'center'
    };

    return (
        <Container sx={{ padding: '30px', color: 'white' }}>
            <Box sx={{ width: '100%', textAlign: 'left', mb: 3 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/home')}
                    sx={{
                        backgroundColor: '#03a9f4',
                        color: 'white',
                        padding: '8px 14px',
                        fontSize: '14px',
                        borderRadius: '6px',
                        '&:hover': { backgroundColor: '#0288d1' }
                    }}
                >
                    Back to Home
                </Button>
            </Box>

            <Paper sx={paperStyle}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 3 }}>
                    About FireTourney
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                    Welcome to FireTourney, your premier platform for participating in exciting Free Fire tournaments!
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                    Our mission is to provide a seamless and fair environment for gamers to compete, showcase their skills, and win rewards based on their performance.
                </Typography>
                <Typography variant="body1">
                    Join our community, book your slots, and get ready for intense battles! Good luck! 🔥
                </Typography>
            </Paper>
        </Container>
    );
};

export default AboutUs;