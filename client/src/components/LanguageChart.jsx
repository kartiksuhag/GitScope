import './LanguageChart.css';

const COLORS = [
  '#8b5cf6', '#6d28d9', '#a78bfa', '#c4b5fd',
  '#7c3aed', '#5b21b6', '#ddd6fe', '#ede9fe',
  '#4c1d95', '#6366f1',
];

export default function LanguageChart({ languages }) {
  if (!languages || languages.length === 0) {
    return null;
  }

  return (
    <div className="language-chart">
      <h3 className="chart-title">Language Breakdown</h3>
      <div className="bar-chart-container">
        {languages.slice(0, 8).map((lang, i) => (
          <div key={lang.name} className="chart-row">
            <div className="chart-label">
              <span className="lang-name">{lang.name}</span>
              <span className="lang-pct">{lang.percentage}%</span>
            </div>
            <div className="bar-bg">
              <div
                className="bar-fill"
                style={{
                  width: `${lang.percentage}%`,
                  background: COLORS[i % COLORS.length],
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
