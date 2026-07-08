import './AgentSelector.css';

const AGENTS = [
  {
    id: 'security',
    icon: '🛡️',
    name: 'Security Scan',
    desc: 'Find vulnerabilities, hardcoded secrets, and unsafe patterns',
  },
  {
    id: 'quality',
    icon: '✨',
    name: 'Code Quality',
    desc: 'Architecture, style, performance, and best practices review',
  },
  {
    id: 'qa',
    icon: '💬',
    name: 'Q&A Chat',
    desc: 'Ask questions about the codebase using AI',
  },
];

export default function AgentSelector({ selected, onSelect }) {
  return (
    <div className="agent-selector">
      {AGENTS.map((agent) => (
        <button
          key={agent.id}
          className={`agent-btn ${selected === agent.id ? 'active' : ''}`}
          onClick={() => onSelect(agent.id)}
        >
          <span className="agent-icon">{agent.icon}</span>
          <span className="agent-name">{agent.name}</span>
          <span className="agent-desc">{agent.desc}</span>
        </button>
      ))}
    </div>
  );
}
