import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();

  const handleSearch = (username) => {
    navigate(`/user/${username}`);
  };

  return (
    <div className="home">
      <div className="home-hero">
        <div className="hero-glow" />
        <h1 className="hero-title">
          <span className="hero-git">Git</span>Scope
        </h1>
        <p className="hero-subtitle">
          Search any GitHub username. Get analytics, roasts, and AI-powered code insights.
        </p>
        <SearchBar onSubmit={handleSearch} />
        <div className="hero-features">
          <div className="feature">
            <span>📊</span>
            <span>Language Analytics</span>
          </div>
          <div className="feature">
            <span>🔥</span>
            <span>AI Roasts</span>
          </div>
          <div className="feature">
            <span>🛡️</span>
            <span>Security Scans</span>
          </div>
          <div className="feature">
            <span>💬</span>
            <span>Code Q&A</span>
          </div>
        </div>
      </div>
    </div>
  );
}
