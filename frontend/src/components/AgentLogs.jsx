import React, { useState } from 'react';
import { Terminal, Copy, Download, Check, Sparkles, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';

export const AgentLogs = ({ logs }) => {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'actions' | 'reasoning' | 'result'
  const [copied, setCopied] = useState(false);

  const filteredLogs = logs.filter((log) => {
    if (activeTab === 'actions') return log.type === 'action' || log.action;
    if (activeTab === 'reasoning') return log.type === 'thought' || log.reasoning;
    if (activeTab === 'result') return log.type === 'complete' || log.result;
    return true;
  });

  const finalResultLog = logs.find((l) => l.type === 'complete' && l.result);

  const handleCopyLogs = () => {
    const text = JSON.stringify(logs, null, 2);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pathfinder-agent-run-${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="glass-panel" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: '520px',
      borderRadius: '18px',
      overflow: 'hidden'
    }}>
      {/* Header Controls */}
      <div style={{
        padding: '12px 18px',
        background: 'rgba(0, 0, 0, 0.4)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={16} color="#818cf8" />
          <span style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '0.02em', color: '#fff' }}>
            Agent Execution Logs ({logs.length})
          </span>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {['all', 'actions', 'reasoning', 'result'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                background: activeTab === tab ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                border: `1px solid ${activeTab === tab ? 'var(--accent-light)' : 'transparent'}`,
                color: activeTab === tab ? '#fff' : 'var(--text-secondary)',
                fontSize: '11px',
                fontWeight: '600',
                textTransform: 'capitalize',
                cursor: 'pointer'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleCopyLogs}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
            title="Copy Logs JSON"
          >
            {copied ? <Check size={15} color="#10b981" /> : <Copy size={15} />}
          </button>
          <button
            onClick={handleExportJSON}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
            title="Download Logs JSON"
          >
            <Download size={15} />
          </button>
        </div>
      </div>

      {/* Log Feed */}
      <div style={{
        flex: 1,
        padding: '16px',
        overflowY: 'auto',
        background: '#040609',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {/* Final Result Card Banner if available */}
        {finalResultLog && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: '10px',
            padding: '14px',
            marginBottom: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', color: '#34d399', fontWeight: 'bold' }}>
              <CheckCircle2 size={16} /> GOAL ACCOMPLISHED FINAL RESULT
            </div>
            <pre style={{ whiteSpace: 'pre-wrap', color: '#ecfdf5', fontSize: '12px' }}>
              {typeof finalResultLog.result === 'object' ? JSON.stringify(finalResultLog.result, null, 2) : String(finalResultLog.result)}
            </pre>
          </div>
        )}

        {filteredLogs.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px' }}>
            <FileText size={36} style={{ opacity: 0.3, marginBottom: '8px' }} />
            <p>No execution logs yet.</p>
          </div>
        ) : (
          filteredLogs.map((log, index) => {
            const isError = log.type === 'error' || log.status === 'error';
            const isAction = log.type === 'action' || log.action;
            const isThought = log.type === 'thought' || log.reasoning;
            const isComplete = log.type === 'complete';

            return (
              <div
                key={index}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderLeft: `3px solid ${isError ? '#ef4444' : isComplete ? '#10b981' : isAction ? '#6366f1' : isThought ? '#f59e0b' : '#3b82f6'}`,
                  padding: '8px 12px',
                  borderRadius: '0 8px 8px 0'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    color: isError ? '#f87171' : isComplete ? '#34d399' : isAction ? '#818cf8' : isThought ? '#fbbf24' : '#60a5fa'
                  }}>
                    [{log.type || log.status || 'EVENT'}] Step {log.step || index + 1}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ''}
                  </span>
                </div>

                {log.message && <p style={{ color: '#e2e8f0', marginBottom: '4px' }}>{log.message}</p>}
                {log.action && (
                  <p style={{ color: '#c084fc' }}>
                    ⚡ Action: <strong>{log.action.type || log.action.action}</strong> {JSON.stringify(log.action.args || log.action.params || {})}
                  </p>
                )}
                {log.reasoning && <p style={{ color: '#fde047', fontStyle: 'italic' }}>💭 Thought: {log.reasoning}</p>}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
