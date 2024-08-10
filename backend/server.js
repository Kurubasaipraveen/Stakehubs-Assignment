const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');  // Add this for CORS handling
const app = express();
const port = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());  // Enable CORS for all routes

// Database setup
const db = new sqlite3.Database('./database.db');

// Initialize the database tables and indexes
function initializeDatabase() {
    db.serialize(() => {
        // Drop tables if they exist
        db.run('DROP TABLE IF EXISTS CompletedOrderTable');
        db.run('DROP TABLE IF EXISTS PendingOrderTable');

        // Create PendingOrderTable
        db.run(`
            CREATE TABLE IF NOT EXISTS PendingOrderTable (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                buyer_qty INTEGER NOT NULL,
                buyer_price REAL NOT NULL,
                seller_price REAL NOT NULL,
                seller_qty INTEGER NOT NULL
            )
        `);

        // Create CompletedOrderTable with additional details
        db.run(`
            CREATE TABLE IF NOT EXISTS CompletedOrderTable (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                buyer_price REAL NOT NULL,
                seller_price REAL NOT NULL,
                buyer_qty INTEGER NOT NULL,
                seller_qty INTEGER NOT NULL,
                qty INTEGER NOT NULL,
                price REAL NOT NULL
            )
        `);

        // Add indexes to speed up queries
        db.run('CREATE INDEX IF NOT EXISTS idx_buyer_price ON PendingOrderTable (buyer_price)');
        db.run('CREATE INDEX IF NOT EXISTS idx_seller_price ON PendingOrderTable (seller_price)');
    });
}

initializeDatabase();

// API to create an order
app.post('/order', (req, res) => {
    const { buyer_qty, buyer_price, seller_price, seller_qty } = req.body;

    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        db.run(
            `INSERT INTO PendingOrderTable (buyer_qty, buyer_price, seller_price, seller_qty) VALUES (?, ?, ?, ?)`,
            [buyer_qty, buyer_price, seller_price, seller_qty],
            function (err) {
                if (err) {
                    db.run('ROLLBACK');
                    return res.status(500).json({ error: err.message });
                }

                checkForMatches();

                db.run('COMMIT');
                res.json({ id: this.lastID });
            }
        );
    });
});

// API to get all orders
app.get('/orders', (req, res) => {
    db.serialize(() => {
        db.all('SELECT * FROM PendingOrderTable', [], (err, pendingOrders) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            db.all('SELECT * FROM CompletedOrderTable', [], (err, completedOrders) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                res.json({ pendingOrders, completedOrders });
            });
        });
    });
});

// Function to check for matches and update orders
function checkForMatches() {
    db.serialize(() => {
        db.all(`SELECT * FROM PendingOrderTable WHERE buyer_price >= seller_price`, (err, rows) => {
            if (err) {
                console.error(err.message);
                return;
            }

            rows.forEach(row => {
                const minQty = Math.min(row.buyer_qty, row.seller_qty);

                db.run(
                    `INSERT INTO CompletedOrderTable (buyer_price, seller_price, buyer_qty, seller_qty, qty, price) VALUES (?, ?, ?, ?, ?, ?)`,
                    [row.buyer_price, row.seller_price, row.buyer_qty, row.seller_qty, minQty, (row.buyer_price + row.seller_price) / 2],
                    function (err) {
                        if (err) {
                            console.error(err.message);
                            return;
                        }

                        if (row.buyer_qty > minQty) {
                            db.run(
                                `UPDATE PendingOrderTable SET buyer_qty = ? WHERE id = ?`,
                                [row.buyer_qty - minQty, row.id]
                            );
                        } else {
                            db.run(`DELETE FROM PendingOrderTable WHERE id = ?`, [row.id]);
                        }

                        if (row.seller_qty > minQty) {
                            db.run(
                                `UPDATE PendingOrderTable SET seller_qty = ? WHERE id = ?`,
                                [row.seller_qty - minQty, row.id]
                            );
                        } else {
                            db.run(`DELETE FROM PendingOrderTable WHERE id = ?`, [row.id]);
                        }
                    }
                );
            });
        });
    });
}

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
