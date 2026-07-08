import dotenv from 'dotenv';
dotenv.config();

const GITHUB_API = 'https://api.github.com';
const HEADERS = {
  Accept: 'application/vnd.github+json',
  ...(process.env.GITHUB_TOKEN && {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  }),
};

export async function getUser(username) {
  const res = await fetch(`${GITHUB_API}/users/${username}`, { headers: HEADERS });
  if (!res.ok) throw new Error(`GitHub user not found: ${username}`);
  return res.json();
}

export async function getRepos(username) {
  const res = await fetch(
    `${GITHUB_API}/users/${username}/repos?sort=stars&per_page=10`,
    { headers: HEADERS }
  );
  if (!res.ok) throw new Error(`Failed to fetch repos for: ${username}`);
  return res.json();
}

export async function getLanguages(owner, repo) {
  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/languages`,
    { headers: HEADERS }
  );
  if (!res.ok) return {};
  return res.json();
}
