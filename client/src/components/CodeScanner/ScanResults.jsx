import './ScanResults.css';

export default function ScanResults({ results, loading, filesCount }) {
  if (loading) {
    return (
      <div className="scan-results loading-box">
        <div className="scan-spinner" />
        <p>Analyzing repository code files... (this may take up to 30s)</p>
      </div>
    );
  }

  if (!results) return null;

  const parseFindings = (text) => {
    if (!text) return [];

    // Split findings by "---" separator or lookahead for "SEVERITY:"
    const blocks = text.split(/(?:---|(?=SEVERITY:))/gi)
      .map((b) => b.trim())
      .filter(Boolean);

    const parsed = [];

    for (const block of blocks) {
      if (!block.toUpperCase().includes('SEVERITY:')) {
        continue;
      }

      const severityMatch = block.match(/SEVERITY:\s*(CRITICAL|HIGH|MEDIUM|LOW|INFO)/i);
      const titleMatch = block.match(/TITLE:\s*(.*)/i);
      const descMatch = block.match(/DESCRIPTION:\s*([\s\S]*)/i);

      const severity = severityMatch ? severityMatch[1].toUpperCase() : 'INFO';
      const title = titleMatch ? titleMatch[1].trim() : 'Code Inspection Item';
      
      let description = descMatch ? descMatch[1].trim() : '';
      // Trim off any trailing prompt leftovers if they exist
      const cleanDesc = description.split(/(?:TITLE:|SEVERITY:|---)/i)[0].trim();

      parsed.push({
        severity,
        title,
        content: cleanDesc,
      });
    }

    if (parsed.length === 0) {
      return [
        {
          severity: 'INFO',
          title: 'Analysis Summary',
          content: text,
        },
      ];
    }

    return parsed;
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
