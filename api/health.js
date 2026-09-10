export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const GITHUB_TOKEN = (process.env.GITHUB_TOKEN || '').trim();
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
        tokenLength: GITHUB_TOKEN.length
    };

    try {
        const publicRes = await fetch(
            `https://api.github.com/repos/\( {GITHUB_OWNER}/ \){GITHUB_REPO}`,
            {
                headers: {
                    Accept: 'application/vnd.github+json',
                    'User-Agent': 'four-seven-builder'
                }
            }
        );
        const publicData = await publicRes.json();
        info.publicRepoCheck = publicRes.ok ? 'ok' : 'failed';
        info.publicRepoMessage = publicData.full_name || publicData.message || publicRes.status;
    } catch (error) {
        info.publicRepoCheck = 'error';
        info.publicRepoMessage = error.message;
    }

    if (!GITHUB_TOKEN) {
        info.tokenCheck = 'missing token';
        return res.status(200).json(info);
    }

    try {
        const userRes = await fetch('https://api.github.com/user', {
            headers: {
                Authorization: 'token ' + GITHUB_TOKEN,
                Accept: 'application/vnd.github+json',
                'User-Agent': 'four-seven-builder'
            }
        });
        const userData = await userRes.json();
        info.tokenCheck = userRes.ok ? 'ok' : 'failed';
        info.tokenStatus = userRes.status;
        info.tokenUser = userData.login || null;
        info.tokenMessage = userData.message || 'ok';
    } catch (error) {
        info.tokenCheck = 'error';
        info.tokenMessage = error.message;
    }

    return res.status(200).json(info);
}