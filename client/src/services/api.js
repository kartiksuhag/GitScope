import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

/**
 * Fetch a GitHub user's profile, repos, and language breakdown
 */
export const fetchProfile = (username) => API.get(`/user/${username}`);

/**
 * Run an AI agent scan on a repository
 * @param {string} owner      - repo owner login
 * @param {string} repo       - repo name
 * @param {string} agentType  - "security" | "quality" | "qa"
 * @param {string} question   - optional question for Q&A agent
 */
export const analyzeRepo = (owner, repo, agentType, question = '') =>
  API.post('/analyze-repo', { owner, repo, agentType, question });

/**
 * Health check
 */
export const healthCheck = () => API.get('/health');
