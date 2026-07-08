import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchProfile } from '../services/api';
import ProfileCard from '../components/ProfileCard';
import RepoList from '../components/RepoList';
import LanguageChart from '../components/LanguageChart';
import RoastCard from '../components/RoastCard';
import SearchBar from '../components/SearchBar';
import './Profile.css';

export default function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchProfile(username)
      .then((res) => {
        if (isMounted) {
          setData(res.data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error(err);
          setError(err.response?.data?.error || 'Failed to load developer profile');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [username]);

  const handleSearch = (newUsername) => {
    navigate(`/user/${newUsername}`);
  };

  return (
    <div className="profile-page">
      <header className="profile-header">
        <Link to="/" className="logo-link">
          <h1 className="logo"><span className="logo-git">Git</span>Scope</h1>
        </Link>
        <div className="header-search">
          <SearchBar onSubmit={handleSearch} />
        </div>
      </header>

      <main className="profile-main">
        {loading && (
          <div className="profile-loading">
            <div className="profile-spinner" />
            <p>Scoping @{username}...</p>
          </div>
        )}

        {error && (
          <div className="profile-error">
            <p>⚠️ {error}</p>
            <Link to="/" className="back-btn">Go back home</Link>
          </div>
        )}

        {!loading && !error && data && (
          <div className="profile-content">
            <ProfileCard user={data.profile} />
            <RoastCard roast={data.roast} loading={loading} />
            <LanguageChart languages={data.languages} />
            <RepoList repos={data.repos} />
          </div>
        )}
      </main>
    </div>
  );
}
