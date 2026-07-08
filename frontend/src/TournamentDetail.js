import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from './api/axiosConfig';
import socket from './socket';
import { AuthContext } from './context/AuthContext';

import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const TournamentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTournament = React.useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get(`/api/tournaments/${id}`);
            setTournament(response.data);
            setError(null);
        } catch (err) {
            console.error("Error fetching tournament details:", err);
            setError('Could not fetch tournament details.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchTournament();
    }, [fetchTournament]);

    useEffect(() => {
        socket.on('bookingUpdate', (data) => {
            if (data.tournamentId === id) {
                fetchTournament();
            }
        });

        return () => {
            socket.off('bookingUpdate');
        };
    }, [id, fetchTournament]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress sx={{ color: 'white' }} />
            </Box>
        );
    }

    if (error) {
        return <Typography sx={{ color: 'red', textAlign: 'center', mt: 4 }}>{error}</Typography>;
    }

    if (!tournament) {
        return null;
    }

    const { title, map, gameMode, entryFee, prizePerKill, winningPrize, matchTime, bookedSlots, maxSlots, status } = tournament;
    const isFull = bookedSlots.length >= maxSlots;
    const canJoin = status === 'Upcoming' && !isFull;

    return (
        <Container sx={{ padding: '30px', textAlign: 'center', color: 'white' }}>
            <Box sx={{ width: '100%', textAlign: 'left', mb: 2 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/tournaments')}
                    sx={{
                        backgroundColor: '#03a9f4',
                        color: 'white',
                        padding: '8px 14px',
                        fontSize: '14px',
                        borderRadius: '6px',
                        '&:hover': { backgroundColor: '#0288d1' }
                    }}
                >
                    Back to List
                </Button>
            </Box>

            <Paper sx={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                padding: '30px',
                borderRadius: '12px',
                color: 'white',
                maxWidth: '600px',
                margin: '0 auto',
                textAlign: 'left'
            }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
                    {title}
                </Typography>
                
                <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)', my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography><strong>Map:</strong> {map}</Typography>
                    <Typography><strong>Mode:</strong> {gameMode}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography><strong>Entry Fee:</strong> ₹{entryFee}</Typography>
                    <Typography><strong>Prize/Kill:</strong> ₹{prizePerKill}</Typography>
                </Box>

                <Typography sx={{ mb: 1 }}><strong>Winning Prize:</strong> ₹{winningPrize}</Typography>

                <Typography sx={{ mb: 2 }}>
                    <strong>Time:</strong> {new Date(matchTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </Typography>

                <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)', my: 2 }} />

                <Typography variant="h6" sx={{ color: '#ffc107', fontWeight: 'bold', mb: 2 }}>
                    Slots Filled: {bookedSlots.length} / {maxSlots}
                </Typography>

                {user && (
                    <Box sx={{ textAlign: 'center', mt: 3 }}>
                       {canJoin ? (
                           <Button
                               component={Link}
                               to={`/tournaments/${id}/select-slot`}
                               variant="contained"
                               sx={{
                                   backgroundColor: '#ffc107',
                                   color: 'black',
                                   fontWeight: 'bold',
                                   padding: '10px 25px',
                                   '&:hover': { backgroundColor: '#e0a800' }
                               }}
                           >
                               Join Now
                           </Button>
                       ) : (
                           <Typography sx={{ fontStyle: 'italic', color: '#ccc' }}>
                               {isFull ? 'Tournament Full' : `Booking for this tournament has ${status === 'Completed' ? 'ended' : 'started'}.`}
                           </Typography>
                       )}
                    </Box>
                )}
                 {!user && (
                    <Typography sx={{ textAlign: 'center', mt: 3, fontStyle: 'italic', color: '#ccc' }}>
                        Please log in to join.
                    </Typography>
                 )}
            </Paper>
        </Container>
    );
};

export default TournamentDetail;