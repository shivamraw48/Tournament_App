// These are the crucial lines that were likely missing
const router = require('express').Router();
const Tournament = require('../models/tournament.model');
const User = require('../models/user.model'); // <-- ADD THIS LINE
const {authMiddleware} = require('../middleware/auth');
const {  adminMiddleware } = require('../middleware/auth');
const Result = require('../models/result.model');

// ROUTE 1: Create a new tournament (This is our updated route)
router.post('/create', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const newTournament = new Tournament({
            title: req.body.title,
            map: req.body.map,
            winningPrize: req.body.winningPrize,
            gameMode: req.body.gameMode,
            entryFee: req.body.entryFee, 
            prizePerKill: req.body.prizePerKill,
            maxSlots: req.body.maxSlots,
            matchTime: req.body.matchTime,
            status: 'Upcoming',
        });

        const savedTournament = await newTournament.save();

        res.status(201).json({ 
            message: 'Tournament created successfully!', 
            tournamentId: savedTournament._id 
        });

    } catch (error) {
        res.status(400).json({ message: 'Error creating tournament', error: error.message });
    }
});
// ROUTE 2: Get all upcoming tournaments
// Handles GET requests to http://localhost:5000/api/tournaments/
router.get('/', async (req, res) => {
    try {
        // Find all tournaments with a status of "Upcoming"
        const tournaments = await Tournament.find({}); // Get ALL tournaments
        
        res.status(200).json(tournaments); // Send the list of tournaments as a JSON array
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tournaments', error: error.message });
    }
});


// ROUTE 3: Book a slot in a tournament
// Handles POST requests to http://localhost:5000/api/tournaments/:id/book
// ROUTE 3: Book a slot in a tournament (NOW PROTECTED)
// NEW ROUTE: Book specific player slots in a tournament
// NEW ROUTE: Book specific player slots in a tournament
router.post('/:id/book-slots', authMiddleware, async (req, res) => {
    try {
        const tournamentId = req.params.id;
        const userId = req.user.id;
        const { slots } = req.body; // Array of { slotIndex, playerIndex, inGameName, inGameId }

        if (!slots || !Array.isArray(slots) || slots.length === 0) {
            return res.status(400).json({ message: "Invalid or empty slot selection." });
        }

        // --- Fetch Tournament FIRST ---
        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
             return res.status(404).json({ message: "Tournament not found" });
        }
        if (tournament.status !== 'Upcoming') {
            return res.status(400).json({ message: "This tournament is not available for booking." });
        }

        // --- Calculate Cost ---
        const totalCost = tournament.entryFee * slots.length;

        // --- Fetch FRESH User Data RIGHT BEFORE Check ---
        const freshUser = await User.findById(userId);
        if (!freshUser) {
            // This should ideally not happen if authMiddleware passed
            return res.status(404).json({ message: "User performing the booking not found." });
        }

        // --- Perform Balance Check ---
        if (freshUser.walletBalance < totalCost) {
            console.log(`Booking Failed: User ${userId} needs ${totalCost}, has ${freshUser.walletBalance}`); // Added logging
            return res.status(400).json({ message: `Insufficient funds. Cost: ${totalCost}, Your Balance: ${freshUser.walletBalance}` });
        }

        // --- Check Slot Availability and Existing Booking ---
        const bookedSlotKeys = new Set(tournament.bookedSlots.map(bs => `${bs.slotIndex}-${bs.playerIndex}`));
        const userAlreadyBooked = tournament.bookedSlots.some(bs => bs.user.equals(userId));

        if (userAlreadyBooked) {
             return res.status(400).json({ message: "You are already registered in this tournament." });
        }

        for (const slot of slots) {
            const slotKey = `${slot.slotIndex}-${slot.playerIndex}`;
            if (bookedSlotKeys.has(slotKey)) {
                return res.status(400).json({ message: `Slot ${slot.slotIndex + 1} (Player ${slot.playerIndex + 1}) is already taken.` });
            }
            // Basic validation for IGN/UID (can be made more strict)
            if (!slot.inGameName || !slot.inGameId) {
                 return res.status(400).json({ message: `In-game details missing for slot ${slot.slotIndex + 1} (Player ${slot.playerIndex + 1}).` });
            }
        }

        // --- All checks passed, process the booking ---

        // 1. Deduct money using the user object we just checked
        freshUser.walletBalance -= totalCost;

        // 2. Add new booking objects
        const newBookings = slots.map(slot => ({
            slotIndex: slot.slotIndex,
            playerIndex: slot.playerIndex,
            user: userId,
            inGameName: slot.inGameName,
            inGameId: slot.inGameId
        }));
        tournament.bookedSlots.push(...newBookings);

        // 3. Save both user and tournament atomically (if possible, though Mongoose doesn't have true transactions easily without replicas)
        // We save the user first, then the tournament. If tournament save fails, money is deducted but booking isn't complete (less ideal, but simpler for now).
        await freshUser.save();
        // Emit wallet update after booking deduction
               req.io.emit('walletUpdate', { userId: freshUser._id, newBalance: freshUser.walletBalance });
        await tournament.save();

        // 4. Emit socket update
        req.io.emit('bookingUpdate', { tournamentId: tournament._id });

        // --- EXPLICITLY CREATE DETAILS OBJECT ---
        const detailsToSend = {
            tournamentName: tournament.title,
            gameMode: tournament.gameMode,
            // Use the 'newBookings' array we created earlier
            players: newBookings.map(b => ({ ign: b.inGameName, uid: b.inGameId })),
            slots: newBookings.map(b => `Slot ${b.slotIndex + 1} - Player ${b.playerIndex + 1}`)
        };

        // --- ADD BACKEND LOGGING ---
        console.log("Sending bookingDetails:", JSON.stringify(detailsToSend, null, 2));
        // -------------------------

        // 5. Send success response with the CORRECT details
        res.status(200).json({
            message: `Successfully booked ${slots.length} slot(s)!`,
            bookingDetails: detailsToSend // Send the object we just created
        });

    } catch (error) {
        console.error("Slot booking error:", error);
        res.status(500).json({ message: "Server error during booking.", error: error.message });
    }
});
// ROUTE 4: Get a single tournament by its ID
// Handles GET requests to http://localhost:5000/api/tournaments/:id
router.get('/:id', async (req, res) => {
    try {
        const tournamentId = req.params.id; // Get the ID from the URL parameter
        const tournament = await Tournament.findById(tournamentId);

        if (!tournament) {
            return res.status(404).json({ message: "Tournament not found" });
        }

        res.status(200).json(tournament); // Send back the single tournament object

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
// ROUTE 5: Submit match results and distribute money (ADMIN ONLY)
// Handles POST requests to http://localhost:5000/api/tournaments/:id/results
// ROUTE 5: Submit match results and distribute money (ADMIN ONLY)
router.post('/:id/results', authMiddleware, adminMiddleware, async (req, res) => {
    const tournamentId = req.params.id;
    // Expect 'results' as an array: [{ bookingId: '...', kills: 5 }, ...]
    const { results } = req.body;

    if (!results || !Array.isArray(results)) {
         return res.status(400).json({ message: 'Invalid results format.' });
    }

    try {
        const tournament = await Tournament.findById(tournamentId).populate('bookedSlots.user', 'username walletBalance'); // Populate user details
        if (!tournament) {
            return res.status(404).json({ message: 'Tournament not found' });
        }
        if (tournament.status === 'Completed') {
            return res.status(400).json({ message: 'Results already submitted.' });
        }

        let totalPrizeDistributed = 0;
        const prizePerKill = tournament.prizePerKill;
        let resultDocs = []; // To store new Result documents

        // Process each submitted result
        for (const playerResult of results) {
            const { bookingId, kills } = playerResult;

            // Find the specific booking entry within the tournament's bookedSlots
            const bookingEntry = tournament.bookedSlots.find(
                slot => slot._id.toString() === bookingId
            );

            if (!bookingEntry) {
                console.warn(`Booking ID ${bookingId} not found in tournament ${tournamentId}. Skipping.`);
                continue; // Skip if booking not found
            }

            if (!bookingEntry.user) {
                console.warn(`User data missing for booking ID ${bookingId}. Skipping.`);
                continue; // Skip if user data somehow missing
            }

            const userId = bookingEntry.user._id;
            const inGameName = bookingEntry.inGameName;
            const currentKills = parseInt(kills) || 0;

            // 1. Calculate prize money
            const prizeMoney = currentKills * prizePerKill;

            if (prizeMoney > 0) {
                // 2. Add money to the user's wallet
                // Use findByIdAndUpdate for atomicity (though balance might be slightly stale, $inc handles it)
                 const updatedUser = await User.findByIdAndUpdate(userId,
                     { $inc: { walletBalance: prizeMoney } },
                     { new: true } // Return the updated document
                 );

                 // Emit wallet update
                 if (updatedUser) {
                    req.io.emit('walletUpdate', { userId: updatedUser._id, newBalance: updatedUser.walletBalance });
                }
             }

            // 3. Prepare the Result document
            resultDocs.push({
                tournament: tournamentId,
                user: userId,
                inGameName: inGameName, // Store IGN
                kills: currentKills,
            });

            totalPrizeDistributed += prizeMoney;
        }

        // 4. Bulk insert all Result documents (more efficient)
        if (resultDocs.length > 0) {
            await Result.insertMany(resultDocs);
        }

        // 5. Mark tournament as Completed
        tournament.status = 'Completed';
        await tournament.save();

        // Emit status update
        req.io.emit('statusUpdate', { tournamentId: tournament._id, newStatus: 'Completed' });

        res.status(200).json({
            message: 'Results submitted and prize money distributed successfully!',
            totalPrizeDistributed: totalPrizeDistributed
        });

    } catch (error) {
        console.error('Error submitting results:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ROUTE 6: Add/Update Room ID and Password (ADMIN ONLY)
router.patch('/:id/room', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { roomID, roomPassword } = req.body;

        if (!roomID || !roomPassword) {
            return res.status(400).json({ message: 'Room ID and Password are required.' });
        }

        const tournament = await Tournament.findByIdAndUpdate(
            req.params.id,
            { roomID: roomID, roomPassword: roomPassword,status: 'Live' },
            { new: true } // Return the updated document
        );

        if (!tournament) {
            return res.status(404).json({ message: 'Tournament not found' });
        }
          req.io.emit('statusUpdate', { tournamentId: tournament._id, newStatus: 'Live' });
        res.status(200).json({ message: 'Room details updated successfully!', tournament });

    } catch (error) {
        console.error('Error updating room details:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
// ROUTE 7: Delete a tournament (ADMIN ONLY)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const tournamentId = req.params.id;
        const deletedTournament = await Tournament.findByIdAndDelete(tournamentId);

        if (!deletedTournament) {
            return res.status(404).json({ message: 'Tournament not found.' });
        }

        // Optional: Also delete related Results if needed (more complex, skip for now)
        // await Result.deleteMany({ tournament: tournamentId });

        res.status(200).json({ message: `Tournament "${deletedTournament.title}" deleted successfully.` });

    } catch (error) {
        console.error('Error deleting tournament:', error);
        res.status(500).json({ message: 'Server error during deletion.', error: error.message });
    }
});
// This line is also crucial for the file to work
// ROUTE 8: Get match results for a specific tournament
router.get('/:id/results', async (req, res) => {
    try {
        const tournamentId = req.params.id;

        // Find the tournament first to ensure it's completed
        const tournament = await Tournament.findById(tournamentId).select('status title'); // Only select needed fields
        if (!tournament) {
            return res.status(404).json({ message: 'Tournament not found.' });
        }
        // Optional: Only show results if the tournament is actually completed
        // if (tournament.status !== 'Completed') {
        //     return res.status(400).json({ message: 'Results are not available for this tournament yet.' });
        // }

        // Find all results associated with this tournament ID
        // Sort by kills descending
        const results = await Result.find({ tournament: tournamentId })
                                    .sort({ kills: -1 }) // Sort by kills, highest first
                                    .select('inGameName kills'); // Select only IGN and kills

        res.status(200).json({
            tournamentTitle: tournament.title,
            results: results
        });

    } catch (error) {
        console.error('Error fetching tournament results:', error);
        res.status(500).json({ message: 'Server error fetching results.', error: error.message });
    }
});
module.exports = router;