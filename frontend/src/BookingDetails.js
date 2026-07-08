import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from './api/axiosConfig';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Modal from '@mui/material/Modal';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const BookingDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const { selectedSlots, tournamentName, tournamentType } = location.state || { selectedSlots: [] };

const [players, setPlayers] = useState(() => {
    if (Array.isArray(selectedSlots)) {
        return selectedSlots.map((slot, index) => ({
            ...slot,
            inGameName: '',
            inGameId: '',
            label: `Player ${index + 1} (Slot ${slot.slotIndex + 1})`
        }));
    }
    return [];
});

    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    
    const [open, setOpen] = useState(false);
    const [bookingDetails, setBookingDetails] = useState(null);

    if (selectedSlots.length === 0) {
        return navigate(`/tournaments/${id}/select-slot`);
    }

    const handlePlayerChange = (index, field, value) => {
        const newPlayers = [...players];
        newPlayers[index][field] = value;
        setPlayers(newPlayers);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsError(false);

        try {
           const res = await api.post(`/api/tournaments/${id}/book-slots`, {
                slots: players
            });
            console.log("Backend Response:", res.data);

            const details = res.data.bookingDetails; 
            
            console.log("Details received:", details); 

            setBookingDetails(details); 
            
            setOpen(true);

        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to submit details.');
            setIsError(true);
        }
    };

    const handleCloseModal = () => {
        setOpen(false);
        navigate('/tournaments');
    };

    const formContainerStyles = {
        maxWidth: 500,
        background: '#2c2c2c',
        padding: '25px',
        borderRadius: '12px',
        margin: '0 auto',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5)',
    };

    const inputStyles = {
        '& .MuiInputBase-root': {
            backgroundColor: '#444',
            borderRadius: '6px',
            color: 'white',
        },
        '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
        '& .MuiInputBase-input': { color: 'white' },
    };

    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        maxWidth: 500,
        width: '90%',
        bgcolor: '#2a2a2a',
        border: '1px solid #444',
        borderRadius: '12px',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5)',
        p: 4,
        color: 'white',
        textAlign: 'center',
    };

    return (
        <Container sx={{ padding: '20px' }}>
            <Button
                className="back-button"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(`/tournaments/${id}/select-slot`)}
                sx={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    color: '#4caf50',
                    fontSize: '18px',
                    fontWeight: 600,
                }}
            >
                Back
            </Button>

            <Typography variant="h4" component="h2" sx={{ textAlign: 'center', mt: '60px', mb: '20px', fontWeight: 'bold' }}>
                Enter In-Game Name & UID
            </Typography>

            <Box component="form" sx={formContainerStyles} onSubmit={handleSubmit}>
                {players.map((player, index) => (
                    <Box key={index}>
                        <Typography component="label" sx={{ display: 'block', mb: '6px', fontWeight: 'bold' }}>
                            {player.label} In-Game Name:
                        </Typography>
                        <TextField
                            type="text"
                            name={`ign${index}`}
                            value={player.inGameName}
                            onChange={(e) => handlePlayerChange(index, 'inGameName', e.target.value)}
                            required
                            fullWidth
                            sx={inputStyles}
                        />
                        <Typography component="label" sx={{ display: 'block', mb: '6px', mt: '10px', fontWeight: 'bold' }}>
                            {player.label} UID:
                        </Typography>
                        <TextField
                            type="text"
                            name={`uid${index}`}
                            value={player.inGameId}
                            onChange={(e) => handlePlayerChange(index, 'inGameId', e.target.value)}
                            required
                            fullWidth
                            sx={inputStyles}
                        />
                    </Box>
                ))}
                
                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    sx={{
                        padding: '12px',
                        backgroundColor: '#4caf50',
                        fontSize: '16px',
                        borderRadius: '6px',
                        mt: '20px',
                        '&:hover': { backgroundColor: '#45a049' }
                    }}
                >
                    Submit Booking
                </Button>

                {message && (
                    <Typography sx={{ color: isError ? '#ff6b6b' : '#4caf50', mt: 2, fontWeight: 'bold' }}>
                        {message}
                    </Typography>
                )}
            </Box>

            <Modal open={open} onClose={handleCloseModal}>
                <Paper sx={modalStyle}>
                    {console.log("Rendering Modal with state:", bookingDetails)}
                    <Typography variant="h4" component="h3" sx={{ color: '#4caf50', mb: '15px' }}>
                        Booking Confirmed 🎉
                    </Typography>
                    
                {bookingDetails?.players && Array.isArray(bookingDetails.players) ? (
                    bookingDetails.players.map((p, i) => (
                        <Box key={i}>
                            <Typography><strong>Player {i + 1} IGN:</strong> {p.ign}</Typography>
                            <Typography><strong>Player {i + 1} UID:</strong> {p.uid}</Typography>
                            <Divider sx={{ bgcolor: '#444', my: 1 }} />
                        </Box>
                    ))
                ) : (
                    <Typography>No player details available.</Typography>
                )}
                    
                    <Typography>
                    <strong>Slot(s):</strong> 
                    {bookingDetails?.slots && Array.isArray(bookingDetails.slots) 
                        ? bookingDetails.slots.join(', ') 
                        : 'N/A'}
                </Typography>
                    <Typography><strong>Tournament:</strong> {bookingDetails?.tournamentName}</Typography>
                    
                    <Button 
                        onClick={handleCloseModal}
                        variant="contained"
                        sx={{
                            mt: '20px',
                            backgroundColor: '#4caf50',
                            '&:hover': { backgroundColor: '#45a049' }
                        }}
                    >
                        Go to Tournaments
                    </Button>
                </Paper>
            </Modal>
        </Container>
    );
};

export default BookingDetails;