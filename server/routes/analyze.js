import express from 'express';
import dotenv from 'dotenv';
import { AGENT_PROMPTS } from '../agents/prompts.js';
import { callGemini } from '../services/ai.js';

/**
 * Try Gemini 2.0 Flash; on rate-limit (429) fall back to 1.5 Flash.
 */
// 🟩 REPLACE WITH THIS NEW ROBUST FALLBACK LOGIC:
async function callGeminiWithFallback(systemPrompt, userPrompt) {
  try {
    // 1. Try cloud Gemini 2.5 Flash first (stable production tier)
    return await callGemini(systemPrompt, userPrompt, 'gemini-2.5-flash');
  } catch (err) {
    console.warn(`[Analyze] Gemini API issue (${err.message || err}), routing to local Ollama fallback...`);
    
    try {
      // 2. If Google Cloud fails or rate-limits, hit your local hardware machine!
      return await callOllama(systemPrompt, userPrompt);
    } catch (ollamaErr) {
      // 3. Fallback error if both are down
      throw new Error(`Analysis engine pipeline failure. Gemini Cloud & Local Ollama are both unavailable.`);
    }
  }
}

dotenv.config();

const router = express.Router();

const GITHUB_API = 'https://api.github.com';
const HEADERS = {
  Accept: 'application/vnd.github+json',
  ...(process.env.GITHUB_TOKEN && {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  }),
};

// File extensions to include in the analysis
const ALLOWED_EXTENSIONS = new Set([
  '.js', '.jsx', '.ts', '.tsx',
  '.py', '.go', '.rs', '.java',
  '.c', '.cpp', '.h', '.rb',
  '.php', '.cs', '.swift', '.kt',
]);

// Folders to skip
const SKIP_DIRS = ['node_modules', 'dist', 'build', '.git', '__pycache__', 'vendor', '.next'];

const MAX_FILES = 20;
const MAX_FILE_SIZE = 50000; // 50 KB per file

/**
 * Fetch the full recursive file tree for a repo from GitHub
 */
async function fetchFileTree(owner, repo) {
  const url = `${GITHUB_API}/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to fetch file tree for ${owner}/${repo}: ${body}`);
  }
  const data = await res.json();
  return data.tree || [];
}

/**
 * Fetch the base64 content of a single file blob and decode to utf-8 string
 */
async function fetchFileContent(owner, repo, filePath) {
  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${filePath}`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.content || data.encoding !== 'base64') return null;
  return Buffer.from(data.content, 'base64').toString('utf-8');
}

/**
 * POST /api/analyze-repo
 * Body: { owner, repo, agentType, question? }
 */
router.post('/analyze-repo', async (req, res) => {
  const { owner, repo, agentType, question } = req.body;

  // ── Validation ─────────────────────────────────────
  if (!owner || !repo) {
    return res.status(400).json({ error: 'owner and repo are required' });
  }
  if (!agentType || !AGENT_PROMPTS[agentType]) {
    return res.status(400).json({
      error: `Invalid agentType. Must be one of: ${Object.keys(AGENT_PROMPTS).join(', ')}`,
    });
  }

  try {
    console.log(`[Analyze] ${owner}/${repo} — agent: ${agentType}`);

    // ── Step 1: Get file tree ───────────────────────
    const tree = await fetchFileTree(owner, repo);

    // ── Step 2: Filter to relevant code files ───────
    const candidates = tree.filter((item) => {
      if (item.type !== 'blob') return false;
      if (item.size && item.size > MAX_FILE_SIZE) return false;

      // Skip banned directories
      const segments = item.path.split('/');
      if (segments.some((seg) => SKIP_DIRS.includes(seg))) return false;

      // Check extension
      const ext = '.' + item.path.split('.').pop().toLowerCase();
      return ALLOWED_EXTENSIONS.has(ext);
    });

    // ── Step 3: Slice to max files ──────────────────
    const filesToFetch = candidates.slice(0, MAX_FILES);
    console.log(`[Analyze] ${filesToFetch.length} files selected from ${candidates.length} candidates`);

    // ── Step 4: Fetch all file contents in parallel ─
    const fileContents = await Promise.all(
      filesToFetch.map(async (item) => {
        const content = await fetchFileContent(owner, repo, item.path);
        return content ? { path: item.path, content } : null;
      })
    );

    const validFiles = fileContents.filter(Boolean);

    if (validFiles.length === 0) {
      return res.status(404).json({ error: 'No readable code files found in this repository.' });
    }

    // ── Step 5: Build combined code context ─────────
    const codeContext = validFiles
      .map((f) => `\n\n// ===== FILE: ${f.path} =====\n${f.content}`)
      .join('');

    // ── Step 6: Build prompt for agent ──────────────
    const systemPrompt = AGENT_PROMPTS[agentType];

    let userPrompt;
    if (agentType === 'qa' && question) {
      userPrompt = `Repository: ${owner}/${repo}\nQuestion: ${question}\n\nCode context:\n${codeContext}`;
    } else {
      userPrompt = `Analyze the following repository: ${owner}/${repo}\n\nFiles analyzed (${validFiles.length}):\n${validFiles.map((f) => `- ${f.path}`).join('\n')}\n\nCode:\n${codeContext}`;
    }

    // ── Step 7: Call AI ─────────────────────────────────────────────
    const result = await callGeminiWithFallback(systemPrompt, userPrompt);

    // ── Step 8: Return result ───────────────────────
    res.json({
      owner,
      repo,
      agentType,
      filesAnalyzed: validFiles.length,
      filePaths: validFiles.map((f) => f.path),
      result,
    });
  } catch (err) {
    console.error('[Analyze] Error:', err.message);
    res.status(500).json({ error: err.message || 'Analysis failed' });
  }
});

// ── Keep the legacy POST / stub for backwards compat ─
router.post('/', async (req, res) => {
  res.status(301).json({
    error: 'Endpoint moved. Use POST /api/analyze-repo',
  });
});

export default router;
