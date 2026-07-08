import express from 'express';
import { getUser, getRepos, getLanguages } from '../services/github.js';
import { checkCache, saveCache } from '../services/cache.js';
import { generateRoast } from '../services/roast.js';

const router = express.Router();

router.get('/:username', async (req, res) => {
  const { username } = req.params;

  try {
    // 1. Check cache first
    const cachedData = await checkCache(username);
    if (cachedData) {
      console.log(`[Cache Hit] Returning data for ${username}`);
      return res.json(cachedData);
    }

    console.log(`[Cache Miss] Fetching from GitHub for ${username}`);
    
    // 2. Fetch profile and repos from GitHub API
    let profile, repos;
    try {
      [profile, repos] = await Promise.all([
        getUser(username),
        getRepos(username)
      ]);
    } catch (err) {
      if (err.message.includes('not found')) {
        return res.status(404).json({ error: `GitHub user @${username} not found.` });
      }
      throw err;
    }

    // 3. Fetch languages for all repos in parallel
    const languagePromises = repos.map(async (repo) => {
      try {
        return await getLanguages(repo.owner.login, repo.name);
      } catch (err) {
        console.warn(`Failed to fetch languages for ${repo.name}:`, err.message);
        return {};
      }
    });
    const languagesList = await Promise.all(languagePromises);

    // 4. Sum language bytes
    const languageStats = {};
    let totalBytes = 0;

    languagesList.forEach((languagesData) => {
      for (const [lang, bytes] of Object.entries(languagesData)) {
        languageStats[lang] = (languageStats[lang] || 0) + bytes;
        totalBytes += bytes;
      }
    });

    // 5. Calculate percentage and sort
    const languages = Object.entries(languageStats)
      .map(([name, bytes]) => ({
        name,
        bytes,
        percentage: totalBytes > 0 ? parseFloat(((bytes / totalBytes) * 100).toFixed(1)) : 0
      }))
      .sort((a, b) => b.bytes - a.bytes);

    // 6. Generate roast
    const roast = generateRoast(profile, repos);

    const data = {
      profile,
      repos,
      languages,
      roast
    };

    // 7. Save to cache
    await saveCache(username, data);

    // 8. Return response
    res.json(data);
  } catch (err) {
    console.error('User route error:', err.message);
    res.status(500).json({ error: 'Failed to fetch user data from GitHub' });
  }
});

export default router;
