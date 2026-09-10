export const config = { api: { bodyParser: false } };

const MAX_BYTES = 3.5 * 1024 * 1024;

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_OWNER = process.env.GITHUB_OWNER;
    const GITHUB_REPO = process.env.GITHUB_REPO;

    if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
        return res.status(500).json({
            error: 'GitHub is not configured. Set GITHUB_TOKEN, GITHUB_OWNER, and GITHUB_REPO in Vercel environment variables.'
        });
    }

    try {
        const chunks = [];
        let total = 0;
        for await (const chunk of req) {
            total += chunk.length;
            if (total > MAX_BYTES) {
                return res.status(413).json({
                    error: 'Project is too large for Vercel Hobby (max about 3.5 MB). Use a smaller HTML file or ZIP.'
                });
            }
            chunks.push(chunk);
        }
        const body = Buffer.concat(chunks);

        const contentType = req.headers['content-type'] || '';
        const boundaryMatch = contentType.match(/boundary=([^;]+)/i);
        if (!boundaryMatch) return res.status(400).json({ error: 'Invalid content type. Expected multipart form data.' });

        const parsed = parseMultipart(body, boundaryMatch[1].trim().replace(/^["']|["']$/g, ''));
        const appName = sanitizeAppName(parsed.fields.appName || 'MyApp');
        const packageName = sanitizePackage(parsed.fields.packageName || 'com.fourseven.myapp');
        const projectType = parsed.fields.projectType === 'game' ? 'game' : 'app';
        const projectFile = parsed.files.project;

        if (!projectFile || !projectFile.data || !projectFile.data.length) {
            return res.status(400).json({ error: 'No project file received.' });
        }

        const safeFileName = sanitizeFileName(projectFile.filename || 'index.html');
        const jobId = 'job-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
        const repoPath = `jobs/\( {jobId}/ \){safeFileName}`;
        const projectBase64 = projectFile.data.toString('base64');

        const putResponse = await fetch(
            `https://api.github.com/repos/\( {GITHUB_OWNER}/ \){GITHUB_REPO}/contents/${repoPath}`,
            {
                method: 'PUT',
                headers: githubHeaders(GITHUB_TOKEN),
                body: JSON.stringify({
                    message: `chore: queue ${jobId}`,
                    content: projectBase64,
                    branch: 'main'
                })
            }
        );

        const putData = await putResponse.json();
        if (!putResponse.ok) {
            throw new Error(putData.message || 'Failed to upload project to GitHub.');
        }

        const commitSha = putData.commit && putData.commit.sha;

        const ghResponse = await fetch(
            `https://api.github.com/repos/\( {GITHUB_OWNER}/ \){GITHUB_REPO}/dispatches`,
            {
                method: 'POST',
                headers: githubHeaders(GITHUB_TOKEN),
                body: JSON.stringify({
                    event_type: 'build-apk',
                    client_payload: {
                        jobId,
                        appName,
                        packageName,
                        projectType,
                        projectFileName: safeFileName,
                        projectPath: repoPath,
                        commitSha
                    }
                })
            }
        );

        if (!ghResponse.ok) {
            const err = await ghResponse.text();
            throw new Error('GitHub trigger failed: ' + err);
        }

        return res.status(200).json({
            success: true,
            jobId,
            status: 'queued'
        });
    } catch (error) {
        return res.status(500).json({ error: error.message || 'Could not start the build.' });
    }
}

function githubHeaders(token) {
    return {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'User-Agent': 'four-seven-builder',
        'X-GitHub-Api-Version': '2022-11-28'
    };
}

function sanitizeAppName(name) {
    const cleaned = String(name).replace(/[^\w\s.-]/g, '').trim().slice(0, 40);
    return cleaned || 'MyApp';
}

function sanitizePackage(name) {
    const cleaned = String(name).toLowerCase().replace(/[^a-z0-9._]/g, '');
    if (/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(cleaned)) return cleaned;
    return 'com.fourseven.app';
}

function sanitizeFileName(name) {
    const base = String(name).split(/[/\\]/).pop() || 'index.html';
    const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, '_');
    if (/\.(html|htm|zip)$/i.test(cleaned)) return cleaned;
    return cleaned + '.html';
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
        else fields[name] = data.toString().replace(/\r\n$/, '');
    }
    return { fields, files };
}