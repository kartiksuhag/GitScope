import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { analyzeRepo } from '../services/api';
import AgentSelector from '../components/CodeScanner/AgentSelector';
import ScanResults from '../components/CodeScanner/ScanResults';
import QAChat from '../components/CodeScanner/QAChat';
import './ScanPage.css';

export default function ScanPage() {
  const { owner, repo } = useParams();
  const [agentType, setAgentType] = useState('security');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const runAnalysis = async (type) => {
    setLoading(true);
    setResults(null);
    setError(null);
    try {
      const res = await analyzeRepo(owner, repo, type);
      setResults(res.data.result);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAgentSelect = (type) => {
    setAgentType(type);
    setResults(null);
    setError(null);
    
    // Automatically trigger analysis for non-chat agents
    if (type === 'security' || type === 'quality') {
      runAnalysis(type);
    }
  };

  const handleQASend = async (question) => {
    setLoading(true);
    setError(null);
    try {
      const res = await analyzeRepo(owner, repo, 'qa', question);
      setLoading(false);
      return res.data.result;
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to get answer.');
      setLoading(false);
      return null;
    }
  };

  return (
    <div className="scan-page">
      <header className="scan-header">
        <Link to="/" className="logo-link">
          <h1 className="logo"><span className="logo-git">Git</span>Scope</h1>
        </Link>
        <span className="scan-repo-badge">
          📁 {owner} / <strong>{repo}</strong>
        </span>
      </header>

      <main className="scan-main">
        <div className="scan-intro">
          <h2>Codebase Scanner</h2>
          <p>Deploy specialized AI agents to analyze and inspect this repository.</p>
        </div>

        <AgentSelector selected={agentType} onSelect={handleAgentSelect} />

        {error && (
          <div className="scan-error">
            <p>⚠️ {error}</p>
          </div>
        )}

        {agentType !== 'qa' ? (
          <ScanResults results={results} loading={loading} />
        ) : (
          <QAChat onSend={handleQASend} loading={loading} />
        )}
      </main>
    </div>
  );
}
