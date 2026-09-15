const express = require('express');
const app = express();
app.use(express.json());

const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT_SECRETE = process.env.JWT_SECRETE;

const dbconnect = require('./dbconnect.js');
const PersonModel = require('./user_schema.js');

// Middleware: identify the calling user from the JWT
// (Gateway already verified the token; we decode it here to know WHICH user is calling)
function identifyUser(req, res, next) {
    const header = req.headers.authorization;
    const token = header && header.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Please send token' });
    }

    jwt.verify(token, JWT_SECRETE, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = decoded; // { email, role }
        next();
    });
}

// VIEW PROFILE API
app.get('/viewprofile', identifyUser, async (req, res) => {
    try {
        const user = await PersonModel.findOne({ email: req.user.email }).select('-password');

        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (err) {
        res.status(500).send({ message: err.message || 'Error retrieving profile' });
    }
});

// UPDATE PROFILE API
app.put('/updateprofile', identifyUser, async (req, res) => {
    const { name, phone } = req.body;

    // Only allow updating name and phone — email, password, and role
    // should never be changed through this endpoint
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;

    if (Object.keys(updates).length === 0) {
        return res.status(400).send({ message: 'Provide at least one field to update: name or phone' });
    }

    try {
        const updatedUser = await PersonModel.findOneAndUpdate(
            { email: req.user.email },
            { $set: updates },
            { new: true, runValidators: true } // return the document AFTER update
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).send({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (err) {
        res.status(500).send({ message: err.message || 'Error updating profile' });
    }
});

// START THE EXPRESS SERVER
app.listen(5000, () =>
    console.log('EXPRESS Server Started at Port No: 5000'));