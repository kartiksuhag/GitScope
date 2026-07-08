/**
 * Generate a savage, deterministic roast based on GitHub user and repo statistics.
 * @param {Object} user - The GitHub user profile object
 * @param {Array} repos - List of the user's public repositories
 * @returns {string} The roast text
 */
export function generateRoast(user, repos) {
  if (!user) return "Can't roast a ghost. Give me a real user.";

  const roasts = [];

  const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
  const followerCount = user.followers || 0;
  const publicRepos = user.public_repos || 0;
  const accountAgeYears = new Date().getFullYear() - new Date(user.created_at).getFullYear();
  
  const lastActiveDate = repos.length > 0 
    ? new Date(repos.reduce((latest, r) => Math.max(latest, new Date(r.pushed_at || r.updated_at).getTime()), 0))
    : new Date(user.updated_at);
  const lastActiveMonths = (new Date() - lastActiveDate) / (1000 * 60 * 60 * 24 * 30);

  // 1. Bio Roast
  if (!user.bio) {
    roasts.push("No bio? Trying to look mysterious, or is your personality just an empty repository?");
  } else if (user.bio.length < 15) {
    roasts.push(`"${user.bio}" - that's your bio? You put less effort into that than you do into writing commit messages.`);
  } else {
    roasts.push(`"${user.bio}"... wow, real profound. I'm sure tech recruiters are swooning over that level of philosophical depth.`);
  }

  // 2. Stars Roast
  if (totalStars === 0) {
    roasts.push("You have literally zero stars across all repos. Even your mom forgot to star your code.");
  } else if (totalStars < 10) {
    roasts.push(`A whopping ${totalStars} stars! Don't spend all that developer fame in one place, rockstar.`);
  } else if (totalStars > 500) {
    roasts.push("Over 500 stars. Let me guess, you got lucky on Hacker News once, and now your ego is completely unmanageable.");
  } else {
    roasts.push(`You have ${totalStars} stars. Not bad, but you're still a long way from ever being featured on GitHub's trending page.`);
  }

  // 3. Followers Roast
  if (followerCount === 0) {
    roasts.push("Zero followers. This isn't a profile, it's a digital graveyard.");
  } else if (followerCount < 5) {
    roasts.push(`Under 5 followers. You and your 4 alt accounts must have a fantastic time star-trading.`);
  } else if (followerCount > 1000) {
    roasts.push(`With ${followerCount} followers, how does it feel to be micro-famous on the geeks' LinkedIn?`);
  } else {
    roasts.push(`You have ${followerCount} followers. Enough to feel important, not enough for anyone to actually notice when you push broken code.`);
  }

  // 4. Account Age Roast
  if (accountAgeYears > 10) {
    roasts.push(`Your account is ${accountAgeYears} years old. You're basically a GitHub dinosaur. You probably still miss jQuery and CVS.`);
  } else if (accountAgeYears < 2) {
    roasts.push("Your account is relatively new. Fresh out of a bootcamp or did you just discover Git last week?");
  }

  // 5. Repos Roast
  if (publicRepos === 0) {
    roasts.push("Zero public repositories. Either you're hiding top-secret government projects, or you just don't code.");
  } else if (publicRepos > 80) {
    roasts.push(`You have ${publicRepos} public repos. Do you actually write code, or do you just hit 'new repository' every time you have a fleeting thought?`);
  }

  // 6. Last Activity Roast
  if (lastActiveMonths > 6) {
    roasts.push("No commits or updates in over 6 months. Did you finally get a life, or did you just forget your password?");
  } else if (lastActiveMonths < 0.1) {
    roasts.push("Recently active... pushing directly to main, I assume?");
  }

  // Combine selected roasts
  const mainRoast = roasts.slice(0, 4).join(" ");
  const compliment = `Overall: ${user.login} is proof that you can type a lot without actually saying anything. But hey, at least you're not using SVN!`;
  
  return `${mainRoast} ${compliment}`;
}
