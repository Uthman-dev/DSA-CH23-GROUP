
const express = require('express');
const SocialNetwork = require('./system');
const path = require('path');

const app = express();
const sn = new SocialNetwork();

// Seed some data (same as CLI)
try {
    sn.addUser('@alice', 'Alice');
    sn.addUser('@bob', 'Bob');
    sn.addUser('@charlie', 'Charlie');
    sn.addUser('@diana', 'Diana');
    sn.addFriend('@alice', '@bob');
    sn.addFriend('@bob', '@charlie');
    sn.addFriend('@charlie', '@diana');
} catch (e) {
    // ignore
}

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        res.sendStatus(204);
        return;
    }
    next();
});

// Serve static frontend files (adjust path if needed)
app.use(express.static(path.join(__dirname, '../Frontend')));

// API endpoints
app.post('/api/add-user', (req, res) => {
    const { id, name } = req.body;
    try {
        sn.addUser(id, name);
        res.json({ success: true, message: `User ${name} (${id}) added` });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

app.post('/api/add-friend', (req, res) => {
    const { id1, id2 } = req.body;
    try {
        sn.addFriend(id1, id2);
        res.json({ success: true, message: `Connected ${id1} and ${id2}` });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

app.post('/api/undo', (req, res) => {
    const result = sn.undoLastFriend();
    res.json({ success: true, message: result });
});

app.get('/api/users', (req, res) => {
    const users = sn.getAllUsers();
    res.json({ users });
});

app.get('/api/state', (req, res) => {
    res.json({ state: sn.getState() });
});

app.get('/api/friends/:userId', (req, res) => {
    const { userId } = req.params;
    try {
        const friends = sn.getFriends(userId);
        res.json({ userId, friends });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/recommendations', (req, res) => {
    const { userId, k = 3 } = req.body;
    try {
        const recs = sn.getTopKRecommendations(userId, k);
        res.json({ recommendations: recs });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/search', (req, res) => {
    const { userId, targetId } = req.body;
    try {
        const index = sn.searchFriend(userId, targetId);
        res.json({ userId, targetId, index });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});