import { useNavigate } from 'react-router-dom';
import './RepoList.css';

export default function RepoList({ repos, onRepoClick }) {
  const navigate = useNavigate();

  if (!repos || repos.length === 0) {
    return <p className="repo-empty">No public repositories found.</p>;
  }

  const handleScanClick = (e, repo) => {
    e.stopPropagation();
    navigate(`/scan/${repo.owner.login}/${repo.name}`);
  };

  return (
    <div className="repo-list">
      <h3 className="repo-list-title">Top Repositories</h3>
      <div className="repo-grid">
        {repos.map((repo) => (
          <div
            key={repo.id}
            className="repo-card"
            onClick={() => onRepoClick?.(repo)}
          >
            <div className="repo-card-header">
              <h4 className="repo-name">{repo.name}</h4>
              {repo.language && (
                <span className="repo-lang">{repo.language}</span>
              )}
            </div>
            {repo.description && (
              <p className="repo-desc">{repo.description}</p>
            )}
            <div className="repo-card-footer">
              <div className="repo-meta">
                <span>⭐ {repo.stargazers_count}</span>
                <span>🍴 {repo.forks_count}</span>
              </div>
              <button
                className="scan-repo-btn"
                onClick={(e) => handleScanClick(e, repo)}
              >
                🛡️ Scan
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
