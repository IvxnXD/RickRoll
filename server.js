const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB Atlas using an Environment Variable for security
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error("CRITICAL CONFIG ERROR: MONGO_URI environment variable is missing!");
} else {
    mongoose.connect(MONGO_URI)
        .then(() => console.log('Successfully connected to Cloud Database.'))
        .catch(err => console.error('Database connection failure:', err));
}

// Setup a permanent Schema structure
const logSchema = new mongoose.Schema({
    name: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});
const Log = mongoose.model('Log', logSchema);

// API to save a rickrolled user safely to the cloud
app.post('/api/rickroll', async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    try {
        const newEntry = new Log({ name });
        await newEntry.save();
        res.status(200).json({ success: true });
    } catch (err) {
        console.error("DB Save Error:", err);
        res.status(500).json({ error: 'Database storage failed' });
    }
});

// API for the admin panel to fetch both logs and total calculations
app.get('/api/admin-logs', async (req, res) => {
    try {
        const logs = await Log.find().sort({ timestamp: -1 });
        const count = await Log.countDocuments();
        res.json({ logs, total: count });
    } catch (err) {
        res.status(500).json({ error: 'Database retrieval failed' });
    }
});

app.listen(PORT, () => console.log(`Server executing safely on port ${PORT}`));
