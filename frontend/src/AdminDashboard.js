import React, { useState, useEffect } from 'react';
import api from './api/axiosConfig';
import { useNavigate } from 'react-router-dom';

import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const AdminDashboard = () => {
    const [createFormData, setCreateFormData] = useState({
        title: '', map: 'Bermuda', winningPrize: 100, gameMode: 'Solos',
        entryFee: 10, prizePerKill: 2, maxSlots: 48, matchTime: '',
    });
    const [createMessage, setCreateMessage] = useState('');
    const [createLoading, setCreateLoading] = useState(false);


const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [selectedDeleteTournament, setSelectedDeleteTournament] = useState('');
    const [deleteMessage, setDeleteMessage] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [tournaments, setTournaments] = useState([]);
    const [selectedTournament, setSelectedTournament] = useState(null);
    const [results, setResults] = useState([]);
    const [resultsMessage, setResultsMessage] = useState('');
    const [resultsLoading, setResultsLoading] = useState(false);
    const [fetchPlayersLoading, setFetchPlayersLoading] = useState(false);

    const [selectedRoomTournament, setSelectedRoomTournament] = useState('');
    const [roomDetails, setRoomDetails] = useState({ roomID: '', roomPassword: '' });
    const [roomMessage, setRoomMessage] = useState('');
    const [roomLoading, setRoomLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchTournaments = async () => {
            try {
                const res = await api.get('/api/tournaments/');
                setTournaments(res.data);
            } catch (error) {
                console.error("Error fetching tournaments", error);
            }
        };
        fetchTournaments();
    }, []);


    const onCreateChange = e => setCreateFormData({ ...createFormData, [e.target.name]: e.target.value });
    const onCreateSubmit = async e => {
        e.preventDefault(); setCreateMessage(''); setCreateLoading(true);
        try {
            const response = await api.post('/api/tournaments/create', {
                ...createFormData,
                matchTime: new Date(createFormData.matchTime).toISOString()
            });
            setCreateMessage(response.data.message);
            setCreateFormData({ title: '', map: 'Bermuda', winningPrize: 100, gameMode: 'Solos', entryFee: 10, prizePerKill: 2, maxSlots: 48, matchTime: '' });
        } catch (error) { setCreateMessage(error.response?.data?.message || 'Error creating tournament');
        } finally { setCreateLoading(false); }
    };
    const handleDeleteTournament = () => {
    if (!selectedDeleteTournament) {
        setDeleteMessage('Please select a tournament to delete.');
        return;
    }
    setOpenConfirmDialog(true);
};
const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
};

const handleConfirmDelete = async () => {
    setOpenConfirmDialog(false);
    setDeleteMessage('');
    setDeleteLoading(true);
    try {
        const response = await api.delete(`/api/tournaments/${selectedDeleteTournament}`);
        setDeleteMessage(response.data.message);
        setSelectedDeleteTournament('');
        const updatedTournaments = await api.get('/api/tournaments/');
        setTournaments(updatedTournaments.data);
    } catch (error) {
        setDeleteMessage(error.response?.data?.message || 'Error deleting tournament');
    } finally {
        setDeleteLoading(false);
    }
};
    const handleTournamentSelect = async (e) => {
        const tournamentId = e.target.value;
        setResultsMessage('');
        if (!tournamentId) { setSelectedTournament(null); setResults([]); return; }
        setFetchPlayersLoading(true);
        try {
            const res = await api.get(`/api/tournaments/${tournamentId}`);
            const fetchedTournament = res.data;
            setSelectedTournament(fetchedTournament);
          
        const playerResults = fetchedTournament.bookedSlots.map(slot => ({
            bookingId: slot._id,
            userId: slot.user,
            inGameName: slot.inGameName,
            kills: 0
        }));
        setResults(playerResults);
            setResults(playerResults);
        } catch (error) { console.error("Error fetching tournament details", error); setSelectedTournament(null); setResults([]);
        } finally { setFetchPlayersLoading(false); }
    };

    const handleKillChange = (bookingId, kills) => {
    setResults(prevResults =>
        prevResults.map(player =>
            player.bookingId === bookingId
                ? { ...player, kills: parseInt(kills) || 0 }
                : player
        )
    );
};
    const onResultsSubmit = async e => {
        e.preventDefault(); setResultsMessage(''); setResultsLoading(true);
        try {
            const payload = {
            results: results.map(r => ({ bookingId: r.bookingId, kills: r.kills }))
        };
            const res = await api.post(`/api/tournaments/${selectedTournament._id}/results`, payload);
            setResultsMessage(res.data.message);
            setSelectedTournament(null);
            setResults([]);
            const updatedTournaments = await api.get('/api/tournaments/');
            setTournaments(updatedTournaments.data);
        } catch (error) { setResultsMessage(error.response?.data?.message || 'Error submitting results');
        } finally { setResultsLoading(false); }
    };

    const handleRoomTournamentSelect = (e) => {
        const tournamentId = e.target.value;
        setSelectedRoomTournament(tournamentId); setRoomMessage('');
        const tournament = tournaments.find(t => t._id === tournamentId);
        if (tournament) { setRoomDetails({ roomID: tournament.roomID || '', roomPassword: tournament.roomPassword || '' }); }
        else { setRoomDetails({ roomID: '', roomPassword: '' }); }
    };
    const onRoomChange = e => setRoomDetails({ ...roomDetails, [e.target.name]: e.target.value });
    const onRoomSubmit = async e => {
        e.preventDefault(); if (!selectedRoomTournament) { setRoomMessage('Please select a tournament.'); return; }
        setRoomMessage(''); setRoomLoading(true);
        try {
            const response = await api.patch(`/api/tournaments/${selectedRoomTournament}/room`, roomDetails);
            setRoomMessage(response.data.message);
             const updatedTournaments = await api.get('/api/tournaments/');
             setTournaments(updatedTournaments.data);
        } catch (error) { setRoomMessage(error.response?.data?.message || 'Error updating room details');
        } finally { setRoomLoading(false); }
    };

    const paperStyle = {
        background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)',
        padding: { xs: '20px', md: '30px' }, borderRadius: '12px', color: 'white',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5)', mb: 3
    };
     const inputStyles = {
        '& .MuiInputBase-root': { backgroundColor: 'rgba(255, 255, 255, 0.15)', borderRadius: '6px', color: 'white' },
        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' },
        '& label.Mui-focused': { color: 'white' }, '& label': { color: '#ccc' },
        '& .MuiInputBase-input': { color: 'white' }, my: 1
    };
const tournamentToDelete = tournaments.find(t => t._id === selectedDeleteTournament);
    return (
        <Container sx={{ padding: '30px', color: 'white' }}>
            <Box sx={{ width: '100%', textAlign: 'left', mb: 3 }}>
                 <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/home')} sx={{ backgroundColor: '#03a9f4', color: 'white', padding: '8px 14px', fontSize: '14px', borderRadius: '6px', '&:hover': { backgroundColor: '#0288d1' } }}>
                     Back to Home
                 </Button>
            </Box>

             <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 3, textAlign: 'center' }}>
                 Admin Dashboard
             </Typography>

            <Paper component="form" sx={paperStyle} onSubmit={onCreateSubmit}>
                <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 2 }}>Create New Tournament</Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12}><TextField fullWidth label="Title" name="title" value={createFormData.title} onChange={onCreateChange} required sx={inputStyles} /></Grid>
                    <Grid item xs={12} sm={6}><TextField fullWidth label="Map" name="map" value={createFormData.map} onChange={onCreateChange} required sx={inputStyles} /></Grid>
                    <Grid item xs={12} sm={6}><TextField fullWidth label="Winning Prize (₹)" type="number" name="winningPrize" value={createFormData.winningPrize} onChange={onCreateChange} required sx={inputStyles} /></Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth sx={inputStyles}>
                             <InputLabel id="gameMode-label" sx={{color: '#ccc'}}>Game Mode</InputLabel>
                             <Select labelId="gameMode-label" name="gameMode" value={createFormData.gameMode} label="Game Mode" onChange={onCreateChange} sx={{'.MuiSelect-icon': {color: 'white'}, color: 'white'}}>
                                 <MenuItem value="Solos">Solos</MenuItem> <MenuItem value="Duos">Duos</MenuItem> <MenuItem value="Squads">Squads</MenuItem>
                             </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}><TextField fullWidth label="Entry Fee (₹)" type="number" name="entryFee" value={createFormData.entryFee} onChange={onCreateChange} required sx={inputStyles} /></Grid>
                    <Grid item xs={12} sm={6}><TextField fullWidth label="Prize Per Kill (₹)" type="number" name="prizePerKill" value={createFormData.prizePerKill} onChange={onCreateChange} required sx={inputStyles} /></Grid>
                    <Grid item xs={12} sm={6}><TextField fullWidth label="Max Slots" type="number" name="maxSlots" value={createFormData.maxSlots} onChange={onCreateChange} required sx={inputStyles} /></Grid>
                    <Grid item xs={12}>
                        <TextField fullWidth type="datetime-local" label="Match Time" name="matchTime" value={createFormData.matchTime} onChange={onCreateChange} required InputLabelProps={{ shrink: true }} sx={inputStyles} />
                    </Grid>
                </Grid>
                <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }} disabled={createLoading}>
                    {createLoading ? <CircularProgress size={24} /> : 'Create Tournament'}
                </Button>
                {createMessage && <Typography sx={{ color: createMessage.includes('Error') ? 'red' : 'lightgreen', mt: 1 }}>{createMessage}</Typography>}
            </Paper>

            <Divider sx={{ my: 4, bgcolor: 'rgba(255,255,255,0.2)' }} />

            <Paper component="form" sx={paperStyle} onSubmit={onResultsSubmit}>
                 <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 2 }}>Submit Match Results</Typography>
                 <FormControl fullWidth sx={inputStyles}>
                     <InputLabel id="select-tournament-results-label" sx={{color: '#ccc'}}>Select Tournament</InputLabel>
                     <Select labelId="select-tournament-results-label" label="Select Tournament" value={selectedTournament?._id || ''} onChange={handleTournamentSelect} sx={{'.MuiSelect-icon': {color: 'white'}, color: 'white'}}>
                         <MenuItem value=""><em>Select a tournament</em></MenuItem>
                         {tournaments.filter(t => t.status === 'Upcoming' || t.status === 'Live').map(t => (
                             <MenuItem key={t._id} value={t._id}>{t.title} ({t.status})</MenuItem>
                         ))}
                     </Select>
                 </FormControl>

                 {fetchPlayersLoading && <CircularProgress size={24} sx={{mt: 2}} />}

                 {selectedTournament && results.length > 0 && (
                     <Box sx={{ mt: 2, maxHeight: 300, overflowY: 'auto' }}>
                         <Typography variant="h6" sx={{ mb: 1 }}>Players in {selectedTournament.title}</Typography>
                         {results.map(player => (
                         <Grid container spacing={1} alignItems="center" key={player.bookingId}>
                             <Grid item xs={6}><Typography sx={{textAlign: 'right'}}>{player.inGameName}:</Typography></Grid>
                             <Grid item xs={6}>
                                 <TextField type="number" label="Kills" size="small" variant="outlined" value={player.kills}
                                     onChange={(e) => handleKillChange(player.bookingId, e.target.value)}
                                     InputProps={{ inputProps: { min: 0 } }} sx={inputStyles}
                                 />
                             </Grid>
                         </Grid>
                     ))}
                         <Button type="submit" variant="contained" color="success" sx={{ mt: 2 }} disabled={resultsLoading}>
                             {resultsLoading ? <CircularProgress size={24} /> : 'Submit Results & Distribute'}
                         </Button>
                     </Box>
                 )}
                 {selectedTournament && results.length === 0 && !fetchPlayersLoading && <Typography sx={{mt: 2, color: '#ccc'}}>No players booked for this tournament.</Typography>}
                 {resultsMessage && <Typography sx={{ color: resultsMessage.includes('Error') ? 'red' : 'lightgreen', mt: 1 }}>{resultsMessage}</Typography>}
            </Paper>

            <Divider sx={{ my: 4, bgcolor: 'rgba(255,255,255,0.2)' }} />

            <Paper component="form" sx={paperStyle} onSubmit={onRoomSubmit}>
                <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 2 }}>Update Room Details</Typography>
                <FormControl fullWidth sx={inputStyles}>
                     <InputLabel id="select-tournament-room-label" sx={{color: '#ccc'}}>Select Tournament</InputLabel>
                     <Select labelId="select-tournament-room-label" label="Select Tournament" value={selectedRoomTournament} onChange={handleRoomTournamentSelect} sx={{'.MuiSelect-icon': {color: 'white'}, color: 'white'}}>
                         <MenuItem value=""><em>Select Tournament to Update</em></MenuItem>
                         {tournaments.filter(t => t.status === 'Upcoming' || t.status === 'Live').map(t => (
                             <MenuItem key={t._id} value={t._id}>{t.title} ({t.status})</MenuItem>
                         ))}
                     </Select>
                </FormControl>

                {selectedRoomTournament && (
                    <Box sx={{mt: 2}}>
                        <TextField fullWidth label="Room ID" name="roomID" value={roomDetails.roomID} onChange={onRoomChange} required sx={inputStyles} />
                        <TextField fullWidth label="Room Password" name="roomPassword" value={roomDetails.roomPassword} onChange={onRoomChange} required sx={inputStyles} />
                        <Button type="submit" variant="contained" color="primary" sx={{ mt: 1 }} disabled={roomLoading}>
                            {roomLoading ? <CircularProgress size={24} /> : 'Update Room Details'}
                        </Button>
                    </Box>
                )}
                 {roomMessage && <Typography sx={{ color: roomMessage.includes('Error') ? 'red' : 'lightgreen', mt: 1 }}>{roomMessage}</Typography>}
            </Paper>
            <Divider sx={{ my: 4, bgcolor: 'rgba(255,255,255,0.2)' }} />

            <Paper sx={paperStyle}>
                 <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 2 }}>Delete Tournament</Typography>
                 <FormControl fullWidth sx={inputStyles}>
                     <InputLabel id="select-tournament-delete-label" sx={{color: '#ccc'}}>Select Tournament to Delete</InputLabel>
                     <Select
                         labelId="select-tournament-delete-label"
                         label="Select Tournament to Delete"
                         value={selectedDeleteTournament}
                         onChange={(e) => { setSelectedDeleteTournament(e.target.value); setDeleteMessage(''); }}
                         sx={{'.MuiSelect-icon': {color: 'white'}, color: 'white'}}
                     >
                         <MenuItem value=""><em>Select a tournament...</em></MenuItem>
                         {tournaments.map(t => (
                             <MenuItem key={t._id} value={t._id}>{t.title} ({t.status})</MenuItem>
                         ))}
                     </Select>
                 </FormControl>

                 <Button
                    variant="contained"
                    color="error"
                    sx={{ mt: 2 }}
                    disabled={!selectedDeleteTournament || deleteLoading}
                    onClick={handleDeleteTournament}
                 >
                    {deleteLoading ? <CircularProgress size={24} color="inherit"/> : 'Delete Selected Tournament'}
                 </Button>
                 {deleteMessage && <Typography sx={{ color: deleteMessage.includes('Error') ? 'red' : 'lightgreen', mt: 1 }}>{deleteMessage}</Typography>}
            </Paper>
             <Dialog
            open={openConfirmDialog}
            onClose={handleCloseConfirmDialog}
            PaperProps={{
                style: {
                    backgroundColor: '#2c2c2c',
                    color: 'white',
                    borderRadius: '12px'
                }
            }}
        >
            <DialogTitle sx={{ fontWeight: 'bold' }}>Confirm Deletion</DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ color: '#ccc' }}>
                    Are you sure you want to permanently delete the tournament
                    <strong> "{tournamentToDelete?.title || 'this tournament'}"</strong>?
                    This action cannot be undone.
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ padding: '16px 24px' }}>
                <Button onClick={handleCloseConfirmDialog} sx={{ color: '#ccc' }}>
                    Cancel
                </Button>
                <Button onClick={handleConfirmDelete} color="error" variant="contained" autoFocus>
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
        </Container>
    );
};

export default AdminDashboard;