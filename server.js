const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DB_FILE = path.join(__dirname, 'database.json');

// Helper to read data
function readData() {
    if (!fs.existsSync(DB_FILE)) return [];
    try {
        return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch (e) {
        return [];
    }
}

// API to save a rickrolled user
app.post('/api/rickroll', (req, { body, status }) => {
    const { name } = body;
    if (!name) return status(400).json({ error: 'Name is required' });

    const logs = readData();
    const newEntry = {
        name: name,
        timestamp: new Date().toISOString()
    };
    logs.push(newEntry);
    
    fs.writeFileSync(DB_FILE, JSON.stringify(logs, null, 2));
    status(200).json({ success: true });
});

// API for the admin panel to fetch logs
app.get('/api/admin-logs', (req, res) => {
    res.json(readData());
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));