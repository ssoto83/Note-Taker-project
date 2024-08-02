const express = require('express');
const path = require('path');
const fs = require('fs');
// const { v4: uuidv4 } = require('uuid');

// Initialize express
const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({extended: true }));
app.use(express.static('public'));

//file path to store notes
const notesFilePath = path.join(__dirname, 'db',  'db_json');

const generateId = () => '_' + Math.random().toString(36).substr(2, 9);

// To get the notes
app.get('/api/notes', (req, res) => {
    fs.readFile(notesFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to read notes.'});
        } else {
            res.json(JSON.parse(data));
        }
    });
});


// Save a note
app.post('/api/notes', (req, res) => {
    const newNote = { id: generateId(), ...req.body };

    fs.readFile(notesFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to read the note.'});
        } else {
            const notes = JSON.parse(data);
            notes.push(newNote);
            fs.writeFile(notesFilePath, JSON.stringify(notes, null, 2), (err) => {
                if (err) {
                    res.status(500).json({ error: 'Failed to save the note.' });
                } else { 
                    res.status(201).json(newNote);
                }
            });
        }
    });
});

// Delete a note by ID
app.delete('/api/notes/:id', (req, res) => {
    const noteId = req.params.id;

    fs.readFile(notesFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to read notes.' });
        } else {
            let notes = JSON.parse(data);
            notes = notes.filter(note => noteId);

            fs.writeFile(notesFilePath, JSON.stringify(notes, null, 2), (err) => {
                if (err) {
                    console.error(err);
                    res.status(500).json({ error: 'Failed to delete note.' });
                } else {
                    res.status(204).end();
                }
            });
        }
    });
});

// Main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Notes page
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'notes.html'));
});

app.listen(PORT, () => {
    console.log(`server is running on http://localhost:${PORT}`);
});