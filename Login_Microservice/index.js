const express = require('express');
const app = express();

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRETE;

const PersonModel = require('./user_schema.js');
const dbconnect = require('./dbconnect.js');

/*
In Postman use the following URL:
localhost:5002/auth/login

{
  "email":"a@gmail.com",
  "password":"abc",
  "role":"student"
}
*/

const VALID_ROLES = ['admin', 'user'];

// LOGIN API
app.post("/auth/login", async (req, res) => {
  const { email, password, role } = req.body;

  // STEP 1: VALIDATE INPUT
  if (!email || !password || !role) {
    return res.status(400).send({ message: 'email, password, and role are required' });
  }
  if (!VALID_ROLES.includes(role)) {
    return res.status(400).send({ message: 'role must be either "admin" or "user"' });
  }

  try {
    // STEP 2: VALIDATE EMAIL + ROLE AGAINST DATABASE
    const user = await PersonModel.findOne({ email: email, role: role });

    if (!user) {
      return res.status(400).send({ message: 'Invalid Email or Password or role' });
    }

    // STEP 3: VALIDATE PASSWORD (compare plaintext against stored hash)
    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(400).send({ message: 'Invalid Email or Password or role' });
    }

    // STEP 4: RETURN JWT
    const token = jwt.sign(
      { email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({ token });

  } catch (err) {
    res.status(500).send({ message: err.message || 'Error during login' });
  }
});

app.listen(5002, () => {
  console.log('Authentication Service Server is running on PORT NO: 5002');
});