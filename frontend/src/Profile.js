import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api/axiosConfig';

import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

const Profile = () => {
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/api/users/profile');
                setProfileData(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching profile:', error);
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress sx={{ color: 'white' }} />
            </Box>
        );
    }

    if (!profileData) {
        return <Typography sx={{ color: 'red', textAlign: 'center', mt: 4 }}>Could not load profile.</Typography>;
    }

    const { user: userDetails, bookedTournaments } = profileData;
    const totalMatchesPlayed = bookedTournaments.length;
    const totalWinnings = 0;

    const paperStyle = {
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        padding: { xs: '20px', md: '30px' },
        borderRadius: '12px',
        color: 'white',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5)',
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

            <Paper sx={{ ...paperStyle, mb: 3 }}>
                <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', mb: 3, textAlign: 'center' }}>
                    My Profile
                </Typography>
                <Typography variant="h6"><strong>Username:</strong> {userDetails.username}</Typography>
                <Typography variant="h6"><strong>Email:</strong> {userDetails.email}</Typography>
                <Typography variant="h6" sx={{ color: '#ffc107', fontWeight: 'bold' }}>
                    <strong>Wallet Balance:</strong> ₹{userDetails.walletBalance.toFixed(2)}
                </Typography>
            </Paper>

            <Paper sx={{ ...paperStyle, mb: 3 }}>
                 <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
                    My Stats
                </Typography>
                <Grid container spacing={2} textAlign="center">
                    <Grid item xs={6}>
                        <EmojiEventsIcon sx={{ fontSize: 40, color: '#03a9f4' }}/>
                        <Typography variant="h6">Matches Played</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{totalMatchesPlayed}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                         <MonetizationOnIcon sx={{ fontSize: 40, color: '#ffc107' }}/>
                        <Typography variant="h6">Total Winnings</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>₹{totalWinnings.toFixed(2)}</Typography>
                         <Typography variant="caption">(Feature coming soon)</Typography>
                    </Grid>
                </Grid>
            </Paper>

            <Paper sx={paperStyle}>
                <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
                    My Booked Tournaments
                </Typography>
                {bookedTournaments.length > 0 ? (
                    <List sx={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {bookedTournaments.map((tournament, index) => (
                            <React.Fragment key={tournament._id}>
                                <ListItem>
                                    <ListItemText
                                        primary={tournament.title}
                                        secondary={
                                            <Typography component="span" sx={{ color: '#ccc' }}>
                                                {`Status: ${tournament.status} | Date: ${new Date(tournament.matchTime).toLocaleDateString()}`}
                                            </Typography>
                                        }
                                        primaryTypographyProps={{ fontWeight: 'bold', color: 'white' }}
                                    />
                                </ListItem>
                                {index < bookedTournaments.length - 1 && <Divider component="li" sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />}
                            </React.Fragment>
                        ))}
                    </List>
                ) : (
                    <Typography sx={{ textAlign: 'center', fontStyle: 'italic', color: '#ccc' }}>
                        You have not booked any tournaments yet.
                    </Typography>
                )}
            </Paper>
        </Container>
    );
};

export default Profile;