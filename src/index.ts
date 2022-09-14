import express, { Application, Request, Response } from 'express';
import axios from 'axios';

// Boot express
const app: Application = express();
const port = 3000;

const githubApiUrl = 'https://api.github.com/repos';

interface BitBucketResponse {
    name: string;
    description: string;
    size: number;
    stargazers_count: number;
    watchers_count: number;
    forks_count: number;
    subscribers_count: number;
}
interface RepoReponse {
    name: string;
    description: string;
    size: number;
    stars: number;
    watchers: number;
    forks: number;
    rating: number;
    subscribers: number;
}

function getRating(watchers: number): number {
    if (watchers < 10) {
        return 1;
    } else if (watchers < 50) {
        return 2;
    } else if (watchers < 250) {
        return 3;
    } else if (watchers < 1000) {
        return 4;
    }
    return 5;
}

// Application routing
app.get('/git/:owner/:repo', async (req: Request, res: Response) => {
    if (!req.params.owner || !req.params.repo) {
        res.status(412).send('Invalid request');
    }
    let authHeaders = {};
    if (req.query.token) {
        authHeaders = {
            Authorization: `Bearer ${req.query?.token}`
        };
    }
    await axios
        .get(`${githubApiUrl}/${req.params.owner}/${req.params.repo}`, {
            headers: authHeaders
        })
        .then((response) => response?.data)
        .then((response: BitBucketResponse) => {
            const resp = {
                name: response.name,
                description: response.description,
                size: response.size,
                stars: response.stargazers_count,
                watchers: response.watchers_count,
                forks: response.forks_count,
                subscribers: response.subscribers_count,
                rating: getRating(response.watchers_count)
            } as RepoReponse;
            return res.status(200).send(resp);
        })
        .catch((e: Error) => {
            console.log(e);
            return res.status(400).send(e.message).end();
        });
});

// Start server
app.listen(port, () => console.log(`Server is listening on port ${port}!`));
