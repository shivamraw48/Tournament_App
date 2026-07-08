const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tournamentSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    // NEW: Added a field for the map
    map: {
        type: String,
        required: true,
        trim: true,
    },
    // NEW: Added the main winning prize
    winningPrize: {
        type: Number,
        required: true,
        default: 0,
    },
    gameMode: {
        type: String,
        required: true,
        enum: ['Solos', 'Duos', 'Squads'],
    },
    entryFee: {
        type: Number,
        required: true,
        default: 0,
    },
    prizePerKill: {
        type: Number,
        required: true,
        default: 0,
    },
    maxSlots: {
        type: Number,
        required: true,
        default: 48, // Updated default to 48
    },
    // --- ADD THESE TWO FIELDS ---
    roomID: { 
        type: String, 
        trim: true,
        default: null // Default to null when tournament is created
    },
    roomPassword: { 
        type: String, 
        trim: true,
        default: null
    },
    // ----------------------------
    bookedSlots: [
        {
            slotIndex: { type: Number, required: true },
            playerIndex: { type: Number, required: true },
            user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
            
            // --- ADD THESE TWO LINES ---
            inGameName: { type: String, required: true },
            inGameId: { type: String, required: true }
        }
    ],
    matchTime: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: ['Upcoming', 'Live', 'Completed', 'Cancelled'],
        default: 'Upcoming',
    },
}, {
    timestamps: true,
});

const Tournament = mongoose.model('Tournament', tournamentSchema);

module.exports = Tournament;