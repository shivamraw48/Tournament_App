import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from './api/axiosConfig';
import { AuthContext } from './context/AuthContext';
import { jwtDecode } from 'jwt-decode';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Modal from '@mui/material/Modal';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';

const TournamentList = () => {
    const { user } = useContext(AuthContext);
    const [allTournaments, setAllTournaments] = useState([]);
    const [filteredTournaments, setFilteredTournaments] = useState([]);
    const [userBookings, setUserBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('Upcoming');
    const navigate = useNavigate();

    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [idPassModalOpen, setIdPassModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

const [resultsModalOpen, setResultsModalOpen] = useState(false);
const [selectedTournamentResults, setSelectedTournamentResults] = useState({ title: '', results: [] });
const [resultsLoading, setResultsLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const tournamentsRes = await api.get('/api/tournaments/');
                setAllTournaments(tournamentsRes.data);

                if (user) {
                    const profileRes = await api.get('/api/users/profile');
                    setUserBookings(profileRes.data.bookedTournaments.map(t => t._id));
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    useEffect(() => {
        let filtered = [];
        if (statusFilter === 'Upcoming') {
             filtered = allTournaments.filter(t => t.status === 'Upcoming');
        } else if (statusFilter === 'Ongoing') {
             filtered = allTournaments.filter(t => t.status === 'Live');
        } else if (statusFilter === 'Completed') {
             filtered = allTournaments.filter(t => t.status === 'Completed');
        }
        setFilteredTournaments(filtered);
    }, [statusFilter, allTournaments]);

const handleOpenResultsModal = async (tournament) => {
    setResultsLoading(true);
    setResultsModalOpen(true);
    try {
        const res = await api.get(`/api/tournaments/${tournament._id}/results`);
        setSelectedTournamentResults({
            title: res.data.tournamentTitle,
            results: res.data.results
        });
    } catch (error) {
        console.error("Error fetching results:", error);
        setSelectedTournamentResults({ title: tournament.title, results: [] });
    } finally {
        setResultsLoading(false);
    }
};

const handleCloseResultsModal = () => {
    setResultsModalOpen(false);
    setSelectedTournamentResults({ title: '', results: [] });
};
    const handleOpenDetailsModal =async (tournament) => {
        if (!user) return;

    try {
        const res = await api.get(`/api/tournaments/${tournament._id}`);
        const fullTournament = res.data;

        const loggedInUserId = jwtDecode(user.token).id;
        const userSlots = fullTournament.bookedSlots.filter(
            slot => slot.user === loggedInUserId
        );

        if (userSlots.length > 0) {
            setSelectedBooking({
                tournamentName: fullTournament.title,
                players: userSlots,
            });
            setDetailsModalOpen(true);
        } else {
            console.error("User is marked as booked, but no slots found in details.");
        }
    }catch (error) {
                console.error("Error fetching full details for modal:", error);
            }
        };
        
    

    const handleOpenIdPassModal = (tournament) => {
        setSelectedBooking({
            roomID: tournament.roomID,
            roomPassword: tournament.roomPassword
        });
        setIdPassModalOpen(true);
    };

    const handleCloseModal = () => {
        setDetailsModalOpen(false);
        setIdPassModalOpen(false);
        setSelectedBooking(null);
    };

    const formatDateTime = (isoDate) => {
         const date = new Date(isoDate);
         const day = date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
         const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
         return { day, time };
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress sx={{ color: 'white' }} /></Box>;
    }

    const modalStyle = {
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 350, bgcolor: '#fff', color: '#000', borderRadius: '10px',
        boxShadow: 24, p: 3, textAlign: 'left'
    };


    return (
        <Container sx={{ padding: '30px', textAlign: 'center' }}>
            <Box sx={{ width: '100%', textAlign: 'left', mb: 2 }}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/home')} sx={{ backgroundColor: '#03a9f4', color: 'white', padding: '8px 14px', fontSize: '14px', borderRadius: '6px', '&:hover': { backgroundColor: '#0288d1' } }}>
                    Back
                </Button>
            </Box>

            <Typography variant="h5" component="h1" sx={{ marginBottom: '10px', fontWeight: 'bold' }}>My Tournaments</Typography>
            <Box className="top-buttons" sx={{ margin: '10px 0' }}>
                 <Button onClick={() => setStatusFilter('Upcoming')} sx={{ padding: '10px 18px', margin: '5px', borderRadius: '6px', fontSize: '14px', backgroundColor: '#4caf50', color: 'white', '&:hover': {backgroundColor: '#388e3c'} }}>Upcoming</Button>
                 <Button onClick={() => setStatusFilter('Ongoing')} sx={{ padding: '10px 18px', margin: '5px', borderRadius: '6px', fontSize: '14px', backgroundColor: '#ffc107', color: 'black', '&:hover': {backgroundColor: '#e0a800'} }}>Ongoing</Button>
                 <Button onClick={() => setStatusFilter('Completed')} sx={{ padding: '10px 18px', margin: '5px', borderRadius: '6px', fontSize: '14px', backgroundColor: '#ff6f61', color: 'white', '&:hover': {backgroundColor: '#e65c50'} }}>Completed</Button>
            </Box>
            <Typography variant="h5" component="h1" sx={{ margin: '20px 0 10px 0', fontWeight: 'bold' }}>All Tournaments</Typography>
            <Box className="filter-buttons" sx={{ margin: '10px 0' }}>
                 <Button sx={{ padding: '10px 18px', margin: '5px', borderRadius: '6px', fontSize: '14px', backgroundColor: '#00bcd4', color: 'white', '&:hover': {backgroundColor: '#0097a7'} }}>FULL MAP</Button>
                 <Button sx={{ padding: '10px 18px', margin: '5px', borderRadius: '6px', fontSize: '14px', backgroundColor: '#00bcd4', color: 'white', '&:hover': {backgroundColor: '#0097a7'} }}>CLASH SQUAD</Button>
            </Box>


            <Box className="tournament-list" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginTop: '20px' }}>
                {filteredTournaments.length > 0 ? (
                    filteredTournaments.map(tournament => {
                        const { day, time } = formatDateTime(tournament.matchTime);
                        const isFull = tournament.bookedSlots.length >= tournament.maxSlots;
const loggedInUserId = user ? jwtDecode(user.token).id : null;
const isUserBooked = loggedInUserId && tournament.bookedSlots.some(slot => slot.user === loggedInUserId);
                        return (
                            <Box key={tournament._id} className="tournament-card" sx={{ background: 'rgba(255, 255, 255, 0.1)', padding: '12px', borderRadius: '10px', width: '300px', boxShadow: '0 3px 10px rgba(0, 0, 0, 0.3)', textAlign: 'left' }}>
                                <Box className="tournament-image" sx={{ width: '100%', height: '100px', backgroundColor: '#444', borderRadius: '8px', marginBottom: '6px' }} />
                                <Typography variant="h6" component="h3" sx={{ margin: '8px 0', fontSize: '18px', fontWeight: 'bold', textAlign: 'center' }}>{tournament.title}</Typography>
                                <Box className="tournament-details" sx={{ fontSize: '13px', marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                     <Typography component="p" sx={{ width: '48%', margin: '2px 0' }}>Entry: ₹{tournament.entryFee}</Typography>
                                     <Typography component="p" sx={{ width: '48%', margin: '2px 0' }}>Per Kill: ₹{tournament.prizePerKill}</Typography>
                                     <Typography component="p" sx={{ width: '48%', margin: '2px 0' }}>Map: {tournament.map}</Typography>
                                     <Typography component="p" sx={{ width: '48%', margin: '2px 0' }}>Winning: ₹{tournament.winningPrize}</Typography>
                                     <Typography component="p" sx={{ width: '48%', margin: '2px 0' }}>Type: {tournament.gameMode}</Typography>
                                     <Typography component="p" sx={{ width: '48%', margin: '2px 0' }}>Date: {day}</Typography>
                                     <Typography component="p" sx={{ width: '48%', margin: '2px 0' }}>Time: {time}</Typography>
                                     <Typography component="p" sx={{ width: '100%', margin: '2px 0', fontWeight: 'bold', color: '#ffc107' }}>Joined: {tournament.bookedSlots.length} / {tournament.maxSlots}</Typography>
                                </Box>

                            <Box sx={{ textAlign: 'center', mt: 1, display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                {tournament.status === 'Completed' ? (
                                    <Button
                                        onClick={() => handleOpenResultsModal(tournament)}
                                        variant="contained"
                                        size="small"
                                        sx={{ backgroundColor: '#6c757d', '&:hover': { backgroundColor: '#5a6268' }, padding: '6px 12px', borderRadius: '6px', fontSize: '13px' }}
                                    >
                                        Match Results
                                    </Button>
                                ) : isUserBooked ? (
                                    <>
                                        <Button
                                            onClick={() => handleOpenDetailsModal(tournament)}
                                            size="small" variant="outlined"
                                            sx={{ color: '#03a9f4', borderColor: '#03a9f4', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', '&:hover': { backgroundColor: 'rgba(3, 169, 244, 0.1)', borderColor: '#03a9f4' } }}
                                        >
                                            View Details
                                        </Button>
                                        <Button
                                            className="show-id-btn"
                                            onClick={() => handleOpenIdPassModal(tournament)}
                                            disabled={!tournament.roomID || tournament.status !== 'Live'}
                                            sx={{ backgroundColor: '#4caf50', color: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', '&:hover': { backgroundColor: '#388e3c' }, '&.Mui-disabled': { backgroundColor: 'grey' } }}
                                        >
                                            Show ID/Pass
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        component={Link}
                                        to={`/tournaments/${tournament._id}/select-slot`}
                                        className="join-btn"
                                        disabled={isFull || tournament.status !== 'Upcoming'}
                                        sx={{ marginTop: '10px', backgroundColor: (isFull || tournament.status !== 'Upcoming') ? 'gray' : '#ffc107', color: 'black', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '14px', cursor: 'pointer', '&:hover': { backgroundColor: (isFull || tournament.status !== 'Upcoming') ? 'gray' : '#e0a800' } }}
                                    >
                                        Join
                                    </Button>
                                )}
                            </Box>

                            </Box>
                        );
                    })
                ) : (
                    <Typography sx={{ width: '100%', textAlign: 'center', fontSize: '18px', marginTop: '30px' }}>No {statusFilter.toLowerCase()} tournaments found.</Typography>
                )}
            </Box>

            <Modal open={detailsModalOpen} onClose={handleCloseModal}>
                <Paper sx={modalStyle}>
                     <IconButton onClick={handleCloseModal} sx={{ position: 'absolute', top: 8, right: 8, background: '#f44336', color: 'white', padding: '5px', '&:hover':{ background: '#d32f2f'} }}> <CloseIcon fontSize="small"/> </IconButton>
                    <Typography variant="h6" component="h3" sx={{ mb: 2 }}>Your Booking Details</Typography>
            <List dense sx={{ maxHeight: '200px', overflowY: 'auto' }}>
                {selectedBooking?.players?.map((playerSlot, index) => (
                    <ListItem key={index} divider>
                        <ListItemText
                            primary={`Slot ${playerSlot.slotIndex + 1} - Player ${playerSlot.playerIndex + 1}`}
                            secondary={`IGN: ${playerSlot.inGameName} | UID: ${playerSlot.inGameId}`}
                            primaryTypographyProps={{ fontWeight: 'bold' }}
                        />
                    </ListItem>
                ))}
            </List>
                </Paper>
            </Modal>

            <Modal open={idPassModalOpen} onClose={handleCloseModal}>
                <Paper sx={modalStyle}>
                     <IconButton onClick={handleCloseModal} sx={{ position: 'absolute', top: 8, right: 8, background: '#f44336', color: 'white', padding: '5px', '&:hover':{ background: '#d32f2f'} }}> <CloseIcon fontSize="small"/> </IconButton>
                    <Typography variant="h6" component="h3" sx={{ mb: 2 }}>Room ID & Password</Typography>
                    <Typography><strong>Room ID:</strong> {selectedBooking?.roomID || "Not Available Yet"}</Typography>
                    <Typography><strong>Password:</strong> {selectedBooking?.roomPassword || "Not Available Yet"}</Typography>
                </Paper>
            </Modal>
        <Modal open={resultsModalOpen} onClose={handleCloseResultsModal}>
            <Paper sx={{...modalStyle, width: 400}}>
                 <IconButton onClick={handleCloseResultsModal} sx={{ position: 'absolute', top: 8, right: 8, background: '#f44336', color: 'white', padding: '5px', '&:hover':{ background: '#d32f2f'} }}> <CloseIcon fontSize="small"/> </IconButton>
                <Typography variant="h6" component="h3" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Match Results: {selectedTournamentResults.title}
                </Typography>
                {resultsLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                     <List dense sx={{ maxHeight: '400px', overflowY: 'auto' }}>
                         {selectedTournamentResults.results?.length > 0 ? (
                             selectedTournamentResults.results.map((result, index) => (
                                 <ListItem key={index} divider sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                     <ListItemText
                                         primary={`${index + 1}. ${result.inGameName}`}
                                         primaryTypographyProps={{ fontWeight: 'bold' }}
                                     />
                                     <Typography sx={{ fontWeight: 'bold', color: '#ffc107' }}>
                                         {result.kills} Kills
                                     </Typography>
                                 </ListItem>
                             ))
                         ) : (
                            <Typography sx={{ textAlign: 'center', fontStyle: 'italic', color: '#666' }}>
                                No results found for this tournament.
                            </Typography>
                         )}
                     </List>
                )}
            </Paper>
        </Modal>
     </Container>
    );
};

export default TournamentList;