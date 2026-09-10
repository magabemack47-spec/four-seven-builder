export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const jobId = req.query && req.query.jobId;
    const GITHUB_TOKEN = (process.env.GITHUB_TOKEN || '').trim();
    const GITHUB_OWNER = 'magabemack47-spec';
    const GITHUB_REPO = 'four-seven-builder';

    if (!jobId) return res.status(400).json({ error: 'Job ID required' });
    if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
        return res.status(500).json({ error: 'GitHub is not configured on the server.' });
    }

    try {
        const runsResponse = await fetch(
            `https://api.github.com/repos/\( {GITHUB_OWNER}/ \){GITHUB_REPO}/actions/runs?per_page=50&event=repository_dispatch`,
            { headers: githubHeaders(GITHUB_TOKEN) }
        );
        const runsData = await runsResponse.json();
        const run = (runsData.workflow_runs || []).find((r) => {
            const hay = [r.name, r.display_title].filter(Boolean).join(' ');
            return hay.includes(jobId);
        });

        if (!run) return res.status(404).json({ error: 'Build not found' });

        const artResponse = await fetch(
            `https://api.github.com/repos/\( {GITHUB_OWNER}/ \){GITHUB_REPO}/actions/runs/${run.id}/artifacts`,
            { headers: githubHeaders(GITHUB_TOKEN) }
        );
        const artData = await artResponse.json();
        const artifacts = artData.artifacts || [];
        const artifact = artifacts.find((a) => a.name.includes(jobId)) || artifacts[0];

        if (!artifact) return res.status(404).json({ error: 'No APK artifact found yet.' });

        const downloadResponse = await fetch(artifact.archive_download_url, {
            headers: githubHeaders(GITHUB_TOKEN),
            redirect: 'manual'
        });

        const location = downloadResponse.headers.get('location');
        if (location) {
            res.setHeader('Cache-Control', 'no-store');
            return res.redirect(302, location);
        }

        if (!downloadResponse.ok) {
            return res.status(500).json({ error: 'GitHub did not return a download URL.' });
        }

        const buf = Buffer.from(await downloadResponse.arrayBuffer());
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', 'attachment; filename="' + jobId + '.zip"');
        return res.status(200).send(buf);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

function githubHeaders(token) {
    return {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'four-seven-builder',
        'X-GitHub-Api-Version': '2022-11-28'
    };
}