const express = require('express');
var app = express();

var bodyParser = require("body-parser");
app.use(bodyParser.json());

const bcrypt = require('bcrypt');
const dbconnect = require('./dbconnect.js');
const PersonModel = require('./user_schema.js');

/*
In Postman use the following URL:
localhost:5003/register/userregister

{
  "name":"Joe",
  "email":"a@gmail.com",
  "password":"abc",
  "mobile": 12345678,
  "role": "user"
}
*/

function uniqueid(min, max) {
  return Math.floor(
    Math.random() * (max - min + 1) + min
  );
}

const SALT_ROUNDS = 10;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// REG API
app.post('/register/userregister', async (req, res) => {
  console.log("REG API EXECUTED");

  const { name, email, password, mobile, role } = req.body;

  // STEP 1: VALIDATE INPUT
  if (!name || !email || !password) {
    return res.status(400).send({ message: 'name, email, and password are required' });
  }
  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).send({ message: 'Invalid email format' });
  }
  if (password.length < 6) {
    return res.status(400).send({ message: 'Password must be at least 6 characters' });
  }

  try {
    // STEP 2: CHECK EMAIL (explicit pre-check)
    const existingUser = await PersonModel.findOne({ email: email });
    if (existingUser) {
      return res.status(409).send({ message: 'Email already registered' });
    }

    // STEP 3: HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // STEP 4: STORE IN MONGODB
    const pobj = new PersonModel({
      _id: uniqueid(1000, 9999),
      name: name,
      email: email,
      password: hashedPassword,
      phone: mobile,
      role: role
    });

    await pobj.save();

    // STEP 5: RETURN SUCCESS
    res.status(200).send({ message: 'DOCUMENT INSERTED IN MONGODB DATABASE' });

  } catch (err) {
    // Safety net: catches the rare race-condition duplicate that slips past findOne
    if (err.code === 11000) {
      return res.status(409).send({ message: 'Email already registered' });
    }
    res.status(500).send({ message: err.message || 'Error in Employee Save' });
  }
});

// START THE EXPRESS SERVER. 5003 is the PORT NUMBER
app.listen(5003, () => console.log('EXPRESS Server Started at Port No: 5003'));