const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

// Initialize database and start server
function initializeDatabase() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(':memory:', (err) => {
            if (err) {
                reject(err);
                return;
            }
            
            // Create quotes table
            db.run(`CREATE TABLE quotes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                quote TEXT NOT NULL,
                author TEXT NOT NULL
            )`, (err) => {
                if (err) {
                    reject(err);
                    return;
                }

                // Insert some inspirational quotes
                const quotes = [
                    ["The only way to do great work is to love what you do.", "Steve Jobs"],
                    ["Innovation distinguishes between a leader and a follower.", "Steve Jobs"],
                    ["Stay hungry, stay foolish.", "Steve Jobs"],
                    ["The future belongs to those who believe in the beauty of their dreams.", "Eleanor Roosevelt"],
                    ["Success is not final, failure is not fatal: it is the courage to continue that counts.", "Winston Churchill"],
                    ["The only limit to our realization of tomorrow will be our doubts of today.", "Franklin D. Roosevelt"],
                    ["Everything you've ever wanted is on the other side of fear.", "George Addair"],
                    ["The best way to predict the future is to create it.", "Peter Drucker"],
                    ["Don't watch the clock; do what it does. Keep going.", "Sam Levenson"],
                    ["The only person you are destined to become is the person you decide to be.", "Ralph Waldo Emerson"]
                ];

                const insertQuote = db.prepare('INSERT INTO quotes (quote, author) VALUES (?, ?)');
                quotes.forEach(quote => {
                    insertQuote.run(quote[0], quote[1]);
                });
                insertQuote.finalize(() => {
                    resolve(db);
                });
            });
        });
    });
}

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Initialize database and start server
initializeDatabase()
    .then(db => {
        // API endpoint for random quote
        app.get('/api/quote', (req, res) => {
            db.get('SELECT quote, author FROM quotes ORDER BY RANDOM() LIMIT 1', (err, row) => {
                if (err) {
                    console.error('Error fetching quote:', err);
                    res.status(500).json({ error: 'Failed to fetch quote' });
                    return;
                }
                res.json(row);
            });
        });

        // Serve index.html for the root route
        app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'public', 'index.html'));
        });

        // Start the server
        app.listen(port, () => {
            console.log(`Server is running at http://localhost:${port}`);
        });
    })
    .catch(err => {
        console.error('Failed to initialize database:', err);
        process.exit(1);
    });
