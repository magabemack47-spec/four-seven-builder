export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const jobId = req.query && req.query.jobId;
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_OWNER = process.env.GITHUB_OWNER;
    const GITHUB_REPO = process.env.GITHUB_REPO;

    if (!jobId) return res.status(400).json({ error: 'Job ID required' });
    if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
        return res.status(500).json({ error: 'GitHub is not configured on the server.' });
    }

    try {
        const run = await findRun(GITHUB_OWNER, GITHUB_REPO, GITHUB_TOKEN, jobId);

        if (!run) {
            return res.status(200).json({
                status: 'queued',
                progress: 8,
                statusText: 'Waiting for GitHub Actions...',
                message: 'Your build is queued.',
                log: 'Looking for workflow run ' + jobId
            });
        }

        let status = 'building';
        let progress = 35;
        let statusText = 'Building APK...';
        let message = 'Cordova is compiling your Android project.';

        if (run.status === 'queued' || run.status === 'pending' || run.status === 'waiting') {
            status = 'queued';
            progress = 15;
            statusText = 'Queued on GitHub';
            message = 'GitHub Actions picked up the job.';
        } else if (run.status === 'in_progress') {
            status = 'building';
            progress = 60;
            statusText = 'Building APK...';
            message = 'Installing Android platform and compiling.';
        } else if (run.status === 'completed') {
            if (run.conclusion === 'success') {
                status = 'completed';
                progress = 100;
                statusText = 'Build complete!';
                message = 'APK ready for download.';
            } else {
                status = 'failed';
                progress = 100;
                statusText = 'Build failed';
                message = 'GitHub Actions finished with: ' + (run.conclusion || 'failure');
            }
        }

        let downloadUrl = null;
        if (status === 'completed') {
            const artifacts = await listArtifacts(GITHUB_OWNER, GITHUB_REPO, GITHUB_TOKEN, run.id);
            if (artifacts.length > 0) downloadUrl = '/api/download/' + encodeURIComponent(jobId);
        }

        return res.status(200).json({
            status,
            progress,
            statusText,
            message,
            downloadUrl,
            runUrl: run.html_url,
            log: [
                'Job: ' + jobId,
                'Run: ' + (run.display_title || run.name),
                'Status: ' + run.status,
                run.conclusion ? 'Result: ' + run.conclusion : 'Still running'
            ].join('\n')
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

async function findRun(owner, repo, token, jobId) {
    const response = await fetch(
        `https://api.github.com/repos/\( {owner}/ \){repo}/actions/runs?per_page=50&event=repository_dispatch`,
        { headers: githubHeaders(token) }
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Could not list workflow runs.');
    const runs = data.workflow_runs || [];
    return runs.find((r) => {
        const hay = [r.name, r.display_title, r.head_branch, r.path].filter(Boolean).join(' ');
        return hay.includes(jobId);
    }) || null;
}

async function listArtifacts(owner, repo, token, runId) {
    const response = await fetch(
        `https://api.github.com/repos/\( {owner}/ \){repo}/actions/runs/${runId}/artifacts`,
        { headers: githubHeaders(token) }
    );
    const data = await response.json();
    return data.artifacts || [];
}

function githubHeaders(token) {
    return {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'four-seven-builder',
        'X-GitHub-Api-Version': '2022-11-28'
    };
}