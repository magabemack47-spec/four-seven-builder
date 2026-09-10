import express from 'express';
import cors from 'cors';
import healthHandler from './api/health.js';
import buildHandler from './api/build.js';
import statusHandler from './api/build/[jobId].js';
import downloadHandler from './api/download/[jobId].js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('.'));

app.all('/api/health', (req, res) => healthHandler(req, res));
app.all('/api/build', (req, res) => buildHandler(req, res));

app.all('/api/build/:jobId', (req, res) => {
    req.query = { ...(req.query || {}), jobId: req.params.jobId };
    return statusHandler(req, res);
});

app.all('/api/download/:jobId', (req, res) => {
    req.query = { ...(req.query || {}), jobId: req.params.jobId };
    return downloadHandler(req, res);
});

app.use((req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'Endpoint not found: ' + req.path });
    }
    res.status(404).send('Not found');
});

app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
    console.log('FOUR x SEVEN BUILDER API');
    console.log('http://localhost:' + PORT);
});