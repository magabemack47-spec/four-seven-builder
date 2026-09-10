export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { jobId } = req.query;
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_OWNER = process.env.GITHUB_OWNER;
    const GITHUB_REPO = process.env.GITHUB_REPO;

    try {
        const runsUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/runs?per_page=30`;
        const runsResponse = await fetch(runsUrl, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'four-seven-builder'
            }
        });
        const runsData = await runsResponse.json();
        const run = runsData.workflow_runs.find(r => (r.name && r.name.includes(jobId)) || (r.display_title && r.display_title.includes(jobId)));

        if (!run) return res.status(404).json({ error: 'Build not found' });

        const artifactsUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/runs/${run.id}/artifacts`;
        const artResponse = await fetch(artifactsUrl, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'four-seven-builder'
            }
        });
        const artData = await artResponse.json();

        if (!artData.artifacts || artData.artifacts.length === 0) {
            return res.status(404).json({ error: 'No artifacts found yet' });
        }

        const artifact = artData.artifacts[0];
        const downloadResponse = await fetch(artifact.archive_download_url, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'four-seven-builder'
            },
            redirect: 'manual'
        });

        const location = downloadResponse.headers.get('location');
        if (location) res.redirect(302, location);
        else res.status(500).json({ error: 'Could not get download URL' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}