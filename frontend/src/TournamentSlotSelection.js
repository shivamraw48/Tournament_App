import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from './api/axiosConfig';
import { AuthContext } from './context/AuthContext';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Container from '@mui/material/Container';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const TournamentSlotSelection = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSlots, setSelectedSlots] = useState({});
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        const fetchTournament = async () => {
            try {
                const response = await api.get(`/api/tournaments/${id}`);
                setTournament(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching tournament details:", err);
                setError('Could not fetch tournament details.');
                setLoading(false);
            }
        };
        fetchTournament();
    }, [id]);

    const handleSlotChange = (slotIndex, playerIndex) => {
        const key = `${slotIndex}-${playerIndex}`;
        setSelectedSlots(prev => {
            const newSelection = { ...prev };
            if (newSelection[key]) {
                delete newSelection[key];
            } else {
                newSelection[key] = true;
            }
            return newSelection;
        });
    };

    const handleConfirmBooking = () => {
        const slotsToBook = Object.keys(selectedSlots).map(key => {
            const [slotIndex, playerIndex] = key.split('-').map(Number);
            return { slotIndex, playerIndex };
        });

        if (slotsToBook.length === 0) {
            setMessage('Please select at least one slot.');
            setIsError(true);
            return;
        }

        navigate(`/tournaments/${id}/book-details`, { 
            state: { 
                selectedSlots: slotsToBook,
                tournamentName: tournament.title,
                tournamentType: tournament.gameMode
            } 
        });
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress sx={{ color: 'white' }} />
            </Box>
        );
    }
    
    if (error) return <Typography sx={{ color: 'red', textAlign: 'center' }}>{error}</Typography>;
    if (!tournament) return null;

    let playersPerSlot = 1;
    let totalSlots = tournament.maxSlots;

    if (tournament.gameMode === 'Duos') {
        playersPerSlot = 2;
        totalSlots = tournament.maxSlots / 2;
    } else if (tournament.gameMode === 'Squads') {
        playersPerSlot = 4;
        totalSlots = tournament.maxSlots / 4;
    }

    const renderSlots = () => {
        const slotBoxes = [];
        for (let i = 0; i < totalSlots; i++) {
            const playerCheckboxes = [];
            let isSlotSelected = false;

            for (let p = 0; p < playersPerSlot; p++) {
                const key = `${i}-${p}`;
                const isBooked = tournament.bookedSlots.some(
                    slot => slot.slotIndex === i && slot.playerIndex === p
                );
                
                if (selectedSlots[key]) {
                    isSlotSelected = true;
                }

                playerCheckboxes.push(
                    <Box key={key}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={isBooked || !!selectedSlots[key]}
                                    disabled={isBooked}
                                    onChange={() => handleSlotChange(i, p)}
                                    sx={{
                                        color: isBooked ? '#aaa' : '#00e676',
                                        '&.Mui-checked': { color: '#00e676' },
                                    }}
                                />
                            }
                            label={isBooked ? "Booked" : `Player ${p + 1}`}
                            sx={{ color: isBooked ? '#aaa' : 'white' }}
                        />
                    </Box>
                );
            }

            slotBoxes.push(
                <Box
                    key={i}
                    className="slot"
                    sx={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '2px solid',
                        borderColor: isSlotSelected ? '#00e676' : 'transparent',
                        backgroundColor: isSlotSelected ? 'rgba(0, 230, 118, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                    }}
                >
                    <Typography variant="h6" component="strong" sx={{ color: 'white' }}>
                        Slot {i + 1}
                    </Typography>
                    {playerCheckboxes}
                </Box>
            );
        }
        return slotBoxes;
    };

    return (
        <Container sx={{ padding: '30px', textAlign: 'center' }}>
            <Button
                className="back-btn"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/tournaments')}
                sx={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    backgroundColor: '#03a9f4',
                    color: 'white',
                    padding: '8px 14px',
                    fontSize: '14px',
                    borderRadius: '6px',
                    '&:hover': { backgroundColor: '#0288d1' }
                }}
            >
                Back
            </Button>
            
            <Typography variant="h4" component="h1" sx={{ marginBottom: '20px', color: 'white' }}>
                Select Your Slot
            </Typography>

            <Box
                className="slots-container"
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                    gap: '14px',
                    maxWidth: '900px',
                    margin: '0 auto',
                }}
            >
                {renderSlots()}
            </Box>

            <Button
                onClick={handleConfirmBooking}
                sx={{
                    marginTop: '20px',
                    padding: '12px 24px',
                    backgroundColor: '#00c853',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: '#00b347' }
                }}
            >
                Confirm Booking
            </Button>

            {message && (
                <Typography sx={{ color: isError ? '#ff6b6b' : '#00e676', mt: 2, fontWeight: 'bold' }}>
                    {message}
                </Typography>
            )}
        </Container>
    );
};

export default TournamentSlotSelection;