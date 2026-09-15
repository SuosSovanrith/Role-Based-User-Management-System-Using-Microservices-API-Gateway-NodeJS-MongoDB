const express = require('express');
const app = express();
app.use(express.json());

const dbconnect = require('./dbconnect.js');
const PersonModel = require('./user_schema.js');

// SEARCH API - search by name or email (partial, case-insensitive match)
app.get('/searchuser', async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).send({ message: 'query parameter is required, e.g. ?query=joe' });
    }

    try {
        const users = await PersonModel.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ]
        }).select('-password'); // never return the password hash

        if (users.length === 0) {
            return res.status(404).send({ message: 'No user found' });
        }

        res.status(200).json(users);
    } catch (err) {
        res.status(500).send({ message: err.message || 'Error searching user' });
    }
});

// VIEW ALL USERS API
app.get('/viewalluser', async (req, res) => {
    try {
        const users = await PersonModel.find().select('-password');
        res.status(200).json(users);
    } catch (err) {
        res.status(500).send({ message: err.message || 'Error retrieving users' });
    }
});

// DELETE USER API - delete by email
app.delete('/deluser', async (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).send({ message: 'email query parameter is required, e.g. ?email=a@gmail.com' });
    }

    try {
        const deletedUser = await PersonModel.findOneAndDelete({ email: email });

        if (!deletedUser) {
            return res.status(404).send({ message: 'User not found' });
        }

        res.status(200).send({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).send({ message: err.message || 'Error deleting user' });
    }
});

app.listen(5001, () =>
    console.log('EXPRESS Server Started at Port No: 5001'));