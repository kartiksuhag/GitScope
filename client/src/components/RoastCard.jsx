import { useState, useEffect } from 'react';
import './RoastCard.css';

export default function RoastCard({ roast, loading }) {
  const [revealed, setRevealed] = useState(false);

  // Reset reveal state when a new roast is loaded
  useEffect(() => {
    setRevealed(false);
  }, [roast]);

  if (!roast && !loading) return null;

  return (
    <div className="roast-card">
      <div className="roast-header">
        <span className="roast-emoji">🔥</span>
        <h3 className="roast-title">Developer Roast</h3>
      </div>
      {loading ? (
        <div className="roast-loading">
          <div className="roast-spinner" />
          <p>Cooking up a roast...</p>
        </div>
      ) : revealed ? (
        <p className="roast-text">{roast}</p>
      ) : (
        <button className="roast-reveal-btn" onClick={() => setRevealed(true)}>
          🫣 Reveal My Roast
        </button>
      )}
    </div>
  );
}
