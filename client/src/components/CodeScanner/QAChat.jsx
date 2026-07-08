import { useState } from 'react';
import './QAChat.css';

export default function QAChat({ onSend, loading }) {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);

  const handleSend = async () => {
    if (!question.trim() || loading) return;
    const q = question.trim();
    setMessages((prev) => [...prev, { role: 'user', text: q }]);
    setQuestion('');

    const answer = await onSend?.(q);
    if (answer) {
      setMessages((prev) => [...prev, { role: 'ai', text: answer }]);
    }
  };

  return (
    <div className="qa-chat">
      <div className="qa-messages">
        {messages.length === 0 && (
          <p className="qa-empty">Ask anything about this repository...</p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`qa-msg ${msg.role}`}>
            <span className="qa-role">{msg.role === 'user' ? 'You' : 'AI'}</span>
            <p className="qa-text">{msg.text}</p>
          </div>
        ))}
        {loading && (
          <div className="qa-msg ai">
            <span className="qa-role">AI</span>
            <div className="qa-typing">
              <span /><span /><span />
            </div>
          </div>
        )}
      </div>
      <div className="qa-input-row">
        <input
          type="text"
          className="qa-input"
          placeholder="Ask about the code..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button className="qa-send" onClick={handleSend} disabled={!question.trim() || loading}>
          Send
        </button>
      </div>
    </div>
  );
}
