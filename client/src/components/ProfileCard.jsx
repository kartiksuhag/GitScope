import './ProfileCard.css';

export default function ProfileCard({ user }) {
  if (!user) return null;

  return (
    <div className="profile-card">
      <div className="profile-card-glow" />
      <img src={user.avatar_url} alt={user.login} className="profile-avatar" />
      <div className="profile-info">
        <h2 className="profile-name">{user.name || user.login}</h2>
        <p className="profile-username">@{user.login}</p>
        {user.bio && <p className="profile-bio">{user.bio}</p>}
        <div className="profile-stats">
          <div className="stat">
            <span className="stat-value">{user.public_repos}</span>
            <span className="stat-label">Repos</span>
          </div>
          <div className="stat">
            <span className="stat-value">{user.followers}</span>
            <span className="stat-label">Followers</span>
          </div>
          <div className="stat">
            <span className="stat-value">{user.following}</span>
            <span className="stat-label">Following</span>
          </div>
        </div>
        {user.location && (
          <p className="profile-location">
            📍 {user.location}
          </p>
        )}
      </div>
    </div>
  );
}
