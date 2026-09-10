export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
        const GITHUB_OWNER = process.env.GITHUB_OWNER;
        const GITHUB_REPO = process.env.GITHUB_REPO;

        if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
            return res.status(500).json({ error: 'GitHub not configured. Add GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO to Vercel env vars.' });
        }

        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        const body = Buffer.concat(chunks);

        const contentType = req.headers['content-type'] || '';
        const boundaryMatch = contentType.match(/boundary=(.+)$/);
        if (!boundaryMatch) return res.status(400).json({ error: 'Invalid content type' });
        const boundary = boundaryMatch[1];

        const parsed = parseMultipart(body, boundary);
        const appName = parsed.fields.appName || 'MyApp';
        const packageName = parsed.fields.packageName || 'com.fourseven.myapp';
        const projectType = parsed.fields.projectType || 'app';
        const projectFile = parsed.files.project;

        if (!projectFile) return res.status(400).json({ error: 'No project file received' });

        const projectBase64 = projectFile.data.toString('base64');
        const projectFileName = projectFile.filename;
        const jobId = 'job-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);

        const ghResponse = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/dispatches`, {
            method: 'POST',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
                'User-Agent': 'four-seven-builder'
            },
            body: JSON.stringify({
                event_type: 'build-apk',
                client_payload: { jobId, appName, packageName, projectType, projectFileName, projectBase64 }
            })
        });

        if (!ghResponse.ok) {
            const err = await ghResponse.text();
            throw new Error('GitHub trigger failed: ' + err);
        }

        return res.status(200).json({
            success: true,
            jobId,
            status: 'queued',
            message: 'Build started on GitHub Actions',
            statusUrl: `/api/build/${jobId}`,
            downloadUrl: `/api/download/${jobId}`
        });

    } catch (error) {
        console.error('Build error:', error);
        return res.status(500).json({ error: error.message });
    }
}

function parseMultipart(buffer, boundary) {
    const fields = {};
    const files = {};
    const boundaryBuffer = Buffer.from('--' + boundary);
    const parts = [];
    let start = 0;

    while (true) {
        const index = buffer.indexOf(boundaryBuffer, start);
        if (index === -1) break;
        if (start > 0) parts.push(buffer.slice(start, index - 2));
        start = index + boundaryBuffer.length + 2;
    }

    for (const part of parts) {
        const headerEnd = part.indexOf('\r\n\r\n');
        if (headerEnd === -1) continue;
        const headers = part.slice(0, headerEnd).toString();
        const data = part.slice(headerEnd + 4);
        const nameMatch = headers.match(/name="([^"]+)"/);
        const filenameMatch = headers.match(/filename="([^"]+)"/);
        if (!nameMatch) continue;
        const name = nameMatch[1];
        if (filenameMatch) files[name] = { filename: filenameMatch[1], data };
        else fields[name] = data.toString();
    }
    return { fields, files };
}