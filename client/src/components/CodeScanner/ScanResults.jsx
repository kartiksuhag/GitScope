import './ScanResults.css';

// Strip markdown symbols from AI output
const clean = (text = '') =>
  text
    .replace(/\*\*/g, '')
    .replace(/#{1,6}\s*/g, '')
    .replace(/^\s*[-*•]\s*/gm, '')
    .replace(/`/g, '')
    .trim();

const parseFindings = (text) => {
  if (!text) return { summary: null, findings: [] };

  const blocks = text
    .split(/(?:---|(?=SEVERITY:))/gi)
    .map((b) => b.trim())
    .filter(Boolean);

  const findings = [];
  let rawSummary = null;

  for (const block of blocks) {
    if (!block.toUpperCase().includes('SEVERITY:')) {
      // Treat orphan blocks as summary if no findings found yet
      if (!rawSummary && block.length > 20) rawSummary = clean(block);
      continue;
    }

    const severityMatch = block.match(/SEVERITY:\s*(CRITICAL|HIGH|MEDIUM|LOW|INFO)/i);
    const titleMatch = block.match(/TITLE:\s*(.*)/i);
    const descMatch = block.match(/DESCRIPTION:\s*([\s\S]*)/i);

    const severity = severityMatch ? severityMatch[1].toUpperCase() : 'INFO';
    const title = titleMatch ? clean(titleMatch[1]) : 'Finding';
    let description = descMatch ? descMatch[1] : '';
    description = clean(description.split(/(?:TITLE:|SEVERITY:|---)/i)[0]);

    findings.push({ severity, title, description });
  }

  return { summary: rawSummary, findings };
};

const SEVERITY_CONFIG = {
  CRITICAL: { label: 'Critical', color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: '#ef4444', badge: 'badge-critical' },
  HIGH:     { label: 'High',     color: '#f97316', bg: 'rgba(249,115,22,0.08)', border: '#f97316', badge: 'badge-high' },
  MEDIUM:   { label: 'Medium',   color: '#eab308', bg: 'rgba(234,179,8,0.08)',  border: '#eab308', badge: 'badge-medium' },
  LOW:      { label: 'Low',      color: '#22c55e', bg: 'rgba(34,197,94,0.08)',  border: '#22c55e', badge: 'badge-low' },
  INFO:     { label: 'Info',     color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)', border: '#8b5cf6', badge: 'badge-info' },
};

export default function ScanResults({ results, loading }) {
  if (loading) {
    return (
      <div className="scan-loading">
        <div className="scan-spinner" />
        <p className="scan-loading-text">Analyzing repository files...</p>
        <p className="scan-loading-sub">AI agents are reviewing your code. This may take up to 30s.</p>
      </div>
    );
  }

  if (!results) return null;

  const { summary, findings } = parseFindings(results);
  const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  findings.forEach((f) => { if (counts[f.severity] !== undefined) counts[f.severity]++; });

  return (
    <div className="scan-results">

      {/* ── Header Summary Bar ───────────────────────── */}
      <div className="report-header">
        <div className="report-header-left">
          <h2 className="report-title">Analysis Report</h2>
          <p className="report-subtitle">{findings.length} issue{findings.length !== 1 ? 's' : ''} found across the codebase</p>
        </div>
        <div className="report-counts">
          {Object.entries(counts).map(([level, count]) => (
            count > 0 && (
              <div key={level} className={`count-pill count-${level.toLowerCase()}`}>
                <span className="count-number">{count}</span>
                <span className="count-label">{level}</span>
              </div>
            )
          ))}
        </div>
      </div>

      {/* ── Summary Block ──────────────────────────────── */}
      {summary && (
        <div className="summary-block">
          <span className="block-label">Overview</span>
          <p className="summary-text">{summary}</p>
        </div>
      )}

      {/* ── Findings ──────────────────────────────────── */}
      {findings.length > 0 && (
        <div className="findings-section">
          <span className="block-label">Findings</span>
          <div className="findings-list">
            {findings.map((item, idx) => {
              const cfg = SEVERITY_CONFIG[item.severity] || SEVERITY_CONFIG.INFO;
              return (
                <div
                  key={idx}
                  className="finding-card"
                  style={{ borderLeftColor: cfg.border, background: cfg.bg }}
                >
                  <div className="finding-top">
                    <span
                      className="finding-badge"
                      style={{ color: cfg.color, borderColor: cfg.color, background: `${cfg.color}18` }}
                    >
                      {cfg.label}
                    </span>
                    <h3 className="finding-title" style={{ color: cfg.color }}>
                      {item.title}
                    </h3>
                  </div>
                  <p className="finding-desc">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
