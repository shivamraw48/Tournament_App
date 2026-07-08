const router = require('express').Router();
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // 1. Import jsonwebtoken
const Tournament = require('../models/tournament.model');
const { authMiddleware } = require('../middleware/auth')
// ROUTE 1: Handle new user registration (NOW WITH TOKEN)
router.post('/register', async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
        });

        const savedUser = await newUser.save();

        // 2. CREATE A TOKEN after successful registration
        const token = jwt.sign(
            { id: savedUser._id, username: savedUser.username ,isAdmin: savedUser.isAdmin},
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Token expires in 1 hour
        );
        
        // 3. SEND THE TOKEN back to the client
        res.status(201).json({ 
            message: 'User registered successfully!', 
            token: token,
            username: savedUser.username 
        });

    } catch (error) {
        res.status(400).json({ message: 'Error registering user', error: error.message });
    }
});


// ROUTE 2: Handle user login (NOW WITH TOKEN)
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // 2. CREATE A TOKEN after successful login
        const token = jwt.sign(
            { id: user._id, username: user.username ,isAdmin: user.isAdmin},
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // 3. SEND THE TOKEN back to the client
        res.status(200).json({ 
            message: 'Login successful!',
            token: token,
            username: user.username
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
// ROUTE 3: Add funds to a user's wallet (for testing)
// This handles PATCH requests to http://localhost:5000/api/users/add-funds
router.patch('/add-funds', async (req, res) => {
    try {
        const { userId, amount } = req.body;

        // Find the user and update their wallet by adding the new amount
        // The { new: true } option tells Mongoose to return the updated user document
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $inc: { walletBalance: amount } }, // $inc is a MongoDB operator to increment a value
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

       // Re-fetch user to get the absolute latest balance after update
const userAfterUpdate = await User.findById(userId);
if (userAfterUpdate) {
     req.io.emit('walletUpdate', { userId: userAfterUpdate._id, newBalance: userAfterUpdate.walletBalance });
     // Send updated balance back in response too
     res.status(200).json({
         message: "Funds added successfully",
         newBalance: userAfterUpdate.walletBalance,
     });
} else {
     // Handle case where user might not be found after update (unlikely)
     res.status(404).json({ message: "User not found after update" });
}
// REMOVE the old res.status(200).json(...) line from this route

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// ROUTE 4: Get logged-in user's profile and booked tournaments
// Handles GET requests to http://localhost:5000/api/users/profile
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        // 1. Get user details (from the middleware)
        // We select('-password') to exclude the hashed password from the response
        const user = await User.findById(req.user.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 2. Find all tournaments the user has booked
       const bookedTournaments = await Tournament.find({ 'bookedSlots.user': req.user.id });
        // 3. Send back the combined data
        res.status(200).json({
            user: user,
            bookedTournaments: bookedTournaments
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
// ROUTE 5: Get a user's public profile (username) by their ID
// This is a helper for the admin panel
router.get('/profile-by-id/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('username');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
module.exports = router;