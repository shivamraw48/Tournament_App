const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// This is the blueprint for our user data
const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true, // Removes whitespace from both ends
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },

    
    
    walletBalance: {
        type: Number,
        default: 0 // New users start with a balance of 0
    },
    
    isAdmin: {
        type: Boolean,
        default: false // New users are not admins
    },
}, {
    timestamps: true, // Automatically adds 'createdAt' and 'updatedAt' fields
});


const User = mongoose.model('User', userSchema);

module.exports = User; // Export the model so we can use it in other files