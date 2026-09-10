export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
    const GITHUB_OWNER = (process.env.GITHUB_OWNER || '').trim();
    const GITHUB_REPO = (process.env.GITHUB_REPO || '').trim();

    const info = {
        status: 'online',
        version: '2.1',
        creator: 'SELLO',
        timestamp: new Date().toISOString(),
        githubOwner: GITHUB_OWNER || '(missing)',
        githubRepo: GITHUB_REPO || '(missing)',
        tokenPresent: Boolean(GITHUB_TOKEN),
        tokenPrefix: GITHUB_TOKEN ? GITHUB_TOKEN.slice(0, 4) : '(missing)',
        githubCheck: 'not run'
    };

    if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
        info.githubCheck = 'missing env vars';
        return res.status(200).json(info);
    }

    try {
        const response = await fetch(
            `https://api.github.com/repos/\( {GITHUB_OWNER}/ \){GITHUB_REPO}`,
            {
                headers: {
                    Authorization: `Bearer ${GITHUB_TOKEN.trim()}`,
                    Accept: 'application/vnd.github+json',
                    'User-Agent': 'four-seven-builder',
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            }
        );
        const data = await response.json();
        if (response.ok) {
            info.githubCheck = 'ok';
            info.fullName = data.full_name;
            info.defaultBranch = data.default_branch;
        } else {
            info.githubCheck = 'failed';
            info.githubStatus = response.status;
            info.githubMessage = data.message || 'unknown';
        }
    } catch (error) {
        info.githubCheck = 'error';
        info.githubMessage = error.message;
    }

    return res.status(200).json(info);
}