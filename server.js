const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const PORT = 3000;

// --- USER REGISTRATION & USER LIST API ---
// Register a new user
app.post('/api/register', (req, res) => {
    const { username, password, role } = req.body;
    if (!username || !password || !role) {
        return res.status(400).json({ error: 'Missing fields' });
    }
    let users = readUsers();
    if (users.length >= 20) {
        return res.status(400).json({ error: 'User limit reached' });
    }
    if (users.some(u => u.username === username)) {
        return res.status(400).json({ error: 'Username exists' });
    }
    users.push({ username, password, role });
    writeUsers(users);
    res.status(201).json({ username, role });
});

// Get all users (for admin or registration check)
app.get('/api/users', (req, res) => {
    res.json(readUsers());
});

app.use(cors());
app.use(bodyParser.json());

const DATA_FILE = 'orders.json';

// Helper to read/write orders
function readOrders() {
    if (!fs.existsSync(DATA_FILE)) return [];
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}
function writeOrders(orders) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(orders, null, 2));
}

// Get all orders
app.get('/orders', (req, res) => {
    res.json(readOrders());
});

// Add a new order
app.post('/orders', (req, res) => {
    const orders = readOrders();
    const order = { id: Date.now(), ...req.body };
    orders.push(order);
    writeOrders(orders);
    res.status(201).json(order);
});

// Delete an order
app.delete('/orders/:id', (req, res) => {
    let orders = readOrders();
    const id = parseInt(req.params.id, 10);
    orders = orders.filter(order => order.id !== id);
    writeOrders(orders);
    res.status(204).end();
});

// Update an order (e.g., status)
app.put('/orders/:id', (req, res) => {
    let orders = readOrders();
    const id = parseInt(req.params.id, 10);
    orders = orders.map(order => order.id === id ? { ...order, ...req.body } : order);
    writeOrders(orders);
    res.json(orders.find(order => order.id === id));
});


// --- ADMIN API for user order counts and user deletion ---
const USERS_FILE = 'users.json';
function readUsers() {
    if (!fs.existsSync(USERS_FILE)) return [];
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
}
function writeUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Get order counts for a list of usernames
app.post('/api/admin/user-order-counts', (req, res) => {
    const { usernames } = req.body;
    const orders = readOrders();
    const counts = {};
    usernames.forEach(username => {
        counts[username] = orders.filter(o => o.username === username).length;
    });
    res.json(counts);
});

// Delete a user and their orders
app.delete('/api/admin/delete-user/:username', (req, res) => {
    const username = req.params.username;
    // Remove user from users.json
    let users = readUsers();
    users = users.filter(u => u.username !== username);
    writeUsers(users);
    // Remove user's orders from orders.json
    let orders = readOrders();
    orders = orders.filter(o => o.username !== username);
    writeOrders(orders);
    res.status(204).end();
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});