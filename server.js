import express from 'express';
import cors from 'cors';
import healthHandler from './health.js';
import buildHandler from './build.js';
import statusHandler from './build/[jobId].js';
import downloadHandler from './download/[jobId].js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health check
app.all('/api/health', (req, res) => healthHandler(req, res));

// Build endpoint
app.all('/api/build', (req, res) => buildHandler(req, res));

// Status endpoint
app.all('/api/build/:jobId', (req, res) => {
    req.query.jobId = req.params.jobId;
    return statusHandler(req, res);
});

// Download endpoint
app.all('/api/download/:jobId', (req, res) => {
    req.query.jobId = req.params.jobId;
    return downloadHandler(req, res);
});

// Root
app.get('/', (req, res) => {
    res.json({
        name: 'FOUR x SEVEN Builder API',
        creator: 'SELLO',
        version: '2.0',
        status: 'online',
        endpoints: [
            'GET  /api/health',
            'POST /api/build',
            'GET  /api/build/:jobId',
            'GET  /api/download/:jobId'
        ]
    });
});

// 404
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found: ' + req.path });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
    console.log('');
    console.log('◆ FOUR x SEVEN BUILDER API');
    console.log('◆ Created by SELLO');
    console.log('◆ Server running on port ' + PORT);
    console.log('◆ http://localhost:' + PORT);
    console.log('');
});