const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DB_FILE = path.join(__dirname, 'database.json');

// Memory fallback cache because Render Free Tier deletes local files on spin-down
let memoryLogs = [];

// Load existing files on boot up if they exist
if (fs.existsSync(DB_FILE)) {
    try {
        memoryLogs = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch (e) {
        memoryLogs = [];
    }
}

// API to save a rickrolled user
app.post('/api/rickroll', (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const newEntry = {
        name: name,
        timestamp: new Date().toISOString()
    };
    
    // Add to both systems
    memoryLogs.push(newEntry);
    
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(memoryLogs, null, 2));
    } catch(e) {
        console.log("Local disk save skipped, holding in runtime memory.");
    }
    
    res.status(200).json({ success: true });
});

// API for the admin panel to fetch logs
app.get('/api/admin-logs', (req, res) => {
    res.json(memoryLogs);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
