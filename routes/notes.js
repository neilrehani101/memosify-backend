const express = require('express');
const router = express.Router();
var fetchUser = require("../middleware/fetchUser")
const Note = require('../models/Notes');
const { body, validationResult } = require('express-validator');
const mongoose = require("mongoose")

// *Route 1: Fetching all memos from MongoDB
router.get('/fetchAllMemos', fetchUser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id });
        res.json(notes);
    } catch (error) {
        // Code executed when an internal error occurs.
        console.error(error.message);
        res.status("500").send("There appears to be an internal server error.");
    }

});

// *Route 2: Creating and storing a memo
router.post('/addMemo', fetchUser, [
    body('title', 'Title length must be atleast 3 characters long').isLength({ min: 3 }),
    body('description', 'Description must be atleast 5 characters long').isLength({ min: 5 }),
], async (req, res) => {
    try {
        const { title, description, tag } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        };

        const note = new Note({
            title,
            description,
            tag,
            user: req.user.id
        });
        const savedNote = await note.save()

        res.json(savedNote);
    } catch (error) {
        // Code executed when an internal error occurs.
        console.error(error.message);
        if (error) {
            return res.status("500").send("There appears to be an internal server error.");

        }
    }
})

// *Route 3: Updating a memo created by the user
router.put('/updateMemo/:id', fetchUser, async (req, res) => {
    const { title, description, tag } = req.body;
    try {
        const newNote = {};
        if (title) {
            newNote.title = title;
        }
        if (description) {
            newNote.description = description;
        }
        if (tag) {
            newNote.tag = tag;
        }
        let note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).send("An error occured as the memo was nowhere to be found.")
        }
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("You are unauthorized to update this memo")
        }

        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
        res.json({ note });
    } catch (error) {
        // Code executed when an internal error occurs.
        console.error(error.message);
    }
    // const note = Note.findByIdAndUpdate()
})


// *Route 3: Updating a memo created by the user
router.delete('/deleteMemo/:id', fetchUser, async (req, res) => {
    // const {title, description, tag} = req.body;
    // const newNote = {};
    // if (title) {
    //     newNote.title = title;
    // }
    // if (description) {
    //     newNote.description = description;
    // }
    // if (tag) {
    //     newNote.tag = tag;
    // }
    try {
        let note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).send("An error occured as the memo was nowhere to be found.")
        }
        if (note.user.toString() != req.user.id) {
            return res.status(401).send("You are unauthorized to delete this memo")
        }

        note = await Note.findByIdAndDelete(req.params.id)
        res.json({ msg: "Done!" })
    } catch (error) {
        // Code executed when an internal error occurs.
        console.error(error.message);
        res.status("500").send("There appears to be an internal server error.");
    }

    // const note = Note.findByIdAndUpdate()
})

module.exports = router;