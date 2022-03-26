// Imports
const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
var fetchUser = require("../middleware/fetchUser")

const JWT_SECRET = "M3M0S1FY1SAG00DW3851T3"

// ROUTE 1
// Create a user using: POST "/auth/createUser"
router.post('/createUser', [
    body('name', 'Name must be atleast 2 characters long').isLength({ min: 2 }),
    body('email', 'Enter a valid email address').isEmail(),
    body('password', 'Password must be atleast 5 characters long').isLength({ min: 5 }),
], async (req, res) => {
    // Validating the user inputs
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        success = false;
        return res.status(400).json({ errors: errors.array() });
    };

    try {
        // Making sure that the email always remains unique.
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            success = false;
            return res.status(400).json({
                error: "Error occured as you tried to input a duplicate email. Please refrain from doing so."
            })
        }

        //  Generating hashes and salts
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);

        // Creating the user with the final, correct values
        user = await User.create({
            name: req.body.name,
            password: secPass,
            email: req.body.email,
        })

        // Creating a JWT; JSON Web Token.
        const data = {
            user: {
                id: user.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ authToken, success })
    } catch (error) {
        // Code executed when an internal error occurs.
        console.error(error.message);
        res.status("500").send("There appears to be an internal server error.");
    }

});

// ROUTE 2
// Authenticate a user using: POST "/auth/login"
router.post('/login', [
    body('email', 'Enter a valid email address').isEmail(),
    body('password', 'Password must not be blank').exists(),
], async (req, res) => {
    // Validating the user inputs
    const errors = validationResult(req);
    let success = false;
    if (!errors.isEmpty()) {
        success = false;
        return res.status(400).json({ errors: errors.array() });
    };

    const { email, password } = req.body;

    try {
        // Checking whether a user by the given email exists. If not, an error is being given.
        let user = await User.findOne({ email });
        if (!user) {
            success = false
            return res.status(400).json({
                error: "Error occured as the credentials you tried to login with are invalid. Please recheck the entered credentials.",
                success
            })
        }

        // If yes, the passwords are being compared
        const passwordCompare = await bcrypt.compare(password, user.password)

        // Giving an error if the password is invalid
        if (!passwordCompare) {
            success = false
            return res.status(400).json({
                error: "Error occured as the credentials you tried to login with are invalid. Please recheck the entered credentials.",
                success
            })
        }

        // Signing a JWT token now that the credentials are correct. 
        const data = {
            user: {
                id: user.id
            }
        }

        const authToken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authToken })

    } catch (error) {
        // Informing the user incase of an internal error
        console.error(error.message);
        res.status("500").send("There appears to be an internal server error.");
    }
})

// ROUTE 3
// Getting user credentials after login is completed.
router.post('/getUserCredentials', fetchUser, async (req, res) => {
    try {
        userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.send(user)

    } catch (error) {
        // Informing the user incase of an internal error
        console.error(error.message);
        res.status("500").send("There appears to be an internal server error.");
    }
})

module.exports = router;