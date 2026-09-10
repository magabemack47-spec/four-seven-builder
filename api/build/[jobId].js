export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { jobId } = req.query;
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_OWNER = process.env.GITHUB_OWNER;
    const GITHUB_REPO = process.env.GITHUB_REPO;

    if (!jobId) return res.status(400).json({ error: 'Job ID required' });

    try {
        const runsUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/runs?per_page=30`;
        const response = await fetch(runsUrl, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'four-seven-builder'
            }
        });
        const data = await response.json();
        const runs = data.workflow_runs || [];
        const run = runs.find(r => (r.name && r.name.includes(jobId)) || (r.display_title && r.display_title.includes(jobId)));

        if (!run) {
            return res.status(200).json({
                status: 'queued',
                progress: 5,
                statusText: 'Waiting for GitHub Actions...',
                message: 'Your build is queued.'
            });
        }

        let status = 'building';
        let progress = 30;
        let statusText = 'Building APK...';

        if (run.status === 'queued') {
            status = 'queued'; progress = 10; statusText = 'Queued on GitHub';
        } else if (run.status === 'in_progress') {
            status = 'building'; progress = 60; statusText = 'Building APK...';
        } else if (run.status === 'completed') {
            if (run.conclusion === 'success') {
                status = 'completed'; progress = 100; statusText = 'Build complete!';
            } else {
                status = 'failed'; progress = 100; statusText = 'Build failed';
            }
        }

        let downloadUrl = null;
        if (status === 'completed') {
            const artifactsUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/runs/${run.id}/artifacts`;
            const artResponse = await fetch(artifactsUrl, {
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'four-seven-builder'
                }
            });
            const artData = await artResponse.json();
            if (artData.artifacts && artData.artifacts.length > 0) {
                downloadUrl = `/api/download/${jobId}`;
            }
        }

        return res.status(200).json({ status, progress, statusText, message: statusText, downloadUrl, runUrl: run.html_url });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}