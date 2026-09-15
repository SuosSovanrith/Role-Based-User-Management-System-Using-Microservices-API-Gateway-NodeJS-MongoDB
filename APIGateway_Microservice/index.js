const express = require('express');
const app = express()

//USE PROXY SERVER TO REDIRECT THE INCOMMING REQUEST
const httpProxy = require('http-proxy')
const proxy = httpProxy.createProxyServer();

const jwt = require('jsonwebtoken')
require('dotenv').config()
const JWT_SECRETE = process.env.JWT_SECRETE;

function authToken(req, res, next) {
    console.log(req.headers.authorization)
    const header = req?.headers.authorization;
    const token = header && header.split(' ')[1];

        // CASE 1: NO TOKEN
    if (!token) {
        return res.status(401).json({ message: 'Please send token' });
    }

    jwt.verify(token, JWT_SECRETE, (err, user) => {
        if (err) {
            // CASE 2: EXPIRED TOKEN
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token has expired' });
            }
            // CASE 3: INVALID TOKEN (bad signature, malformed, etc.)
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
}

function authRole(role) {
    return (req, res, next) => {
        if (!req.user || req.user.role !== role) {
            return res.status(403).json({ message: 'Unauthorized: insufficient role' });
        }
        next();
    }
}

//REDIRECT TO THE USER MICROSERVICE
app.use('/user',authToken, authRole('user'), (req, res) => {
    console.log("INSIDE API GATEWAY USER ROUTE")
    proxy.web(req, res, { target: 'http://localhost:5000' });
})

//REDIRECT TO THE ADMIN MICROSERVICE
app.use('/admin', authToken, authRole('admin'),(req, res) => {
    console.log("INSIDE API GATEWAY admin ROUTE")
    proxy.web(req, res, { target: 'http://localhost:5001' });
})

//REDIRECT TO THE LOGIN(Authentication) MICROSERVICE
app.use('/auth/login', (req, res) => {
    req.url = req.originalUrl;
    proxy.web(req, res, { target: 'http://localhost:5002' });
})

app.listen(4000, () => {
    console.log("API Gateway Service is running on PORT NO : 4000")
})