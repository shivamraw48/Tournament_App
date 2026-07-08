const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const resultSchema = new Schema({
    tournament: {
        type: Schema.Types.ObjectId,
        ref: 'Tournament',
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    kills: {
        type: Number,
        required: true,
        default: 0,
    },
    inGameName: {
        type: String,
        required: true,
        trim: true
    },
    // We can add rank later if we want (e.g., "1st", "2nd")
    // rank: {
    //     type: Number,
    //     default: 0
    // }
}, {
    timestamps: true,
});

const Result = mongoose.model('Result', resultSchema);

module.exports = Result;