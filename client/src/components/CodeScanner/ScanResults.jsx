import './ScanResults.css';

export default function ScanResults({ results, loading, filesCount }) {
  if (loading) {
    return (
      <div className="scan-results loading-box">
        <div className="scan-spinner" />
        <p>Analyzing {filesCount || 'repository'} code files... (this may take up to 30s)</p>
      </div>
    );
  }

  if (!results) return null;

  const parseFindings = (text) => {
    if (!text) return [];
    
    // Split by lookahead for SEVERITY: or TYPE: or markdown headings like ### Critical / ### High / ### Medium
    const regex = /(?=SEVERITY:|TYPE:|###\s+(CRITICAL|HIGH|MEDIUM|LOW|Critical|High|Medium|Low))/gi;
    const blocks = text.split(regex).map(b => b.trim()).filter(Boolean);
    
    if (blocks.length <= 1 && !text.match(/SEVERITY:|TYPE:|###/i)) {
      return [{
        severity: 'INFO',
        title: 'Analysis Summary',
        content: text
      }];
    }

    return blocks.map((block, idx) => {
      // Detect severity
      let severity = 'INFO';
      const severityMatch = block.match(/severity:\s*(\w+)/i) || block.match(/(CRITICAL|HIGH|MEDIUM|LOW)/i);
      if (severityMatch) {
        severity = severityMatch[1].toUpperCase();
      }

      const lines = block.split('\n');
      let title = lines[0].replace(/^###\s+/, '').trim();
      let content = lines.slice(1).join('\n').trim();

      // Fallback if title is empty
      if (!title) title = `Finding #${idx + 1}`;

      return { severity, title, content };
    });
  };

  const findings = parseFindings(results);

  const getBadgeClass = (severity) => {
    switch (severity) {
      case 'CRITICAL':
      case 'HIGH':
        return 'badge-high';
      case 'MEDIUM':
        return 'badge-medium';
      case 'LOW':
        return 'badge-low';
      default:
        return 'badge-info';
    }
  };

  return (
    <div className="scan-results">
      <h3 className="scan-results-title">Analysis Reports</h3>
      <div className="findings-grid">
        {findings.map((item, idx) => (
          <div key={idx} className={`finding-card border-${item.severity.toLowerCase()}`}>
            <div className="finding-header">
              <span className={`severity-badge ${getBadgeClass(item.severity)}`}>
                {item.severity}
              </span>
              <h4 className="finding-title">{item.title}</h4>
            </div>
            <div className="finding-content">
              {item.content.split('\n').map((line, lIdx) => (
                <p key={lIdx} className="finding-line">{line}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
