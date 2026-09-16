import React from 'react';
import { History, X, CheckCircle, AlertCircle, Clock, ExternalLink, Trash2 } from 'lucide-react';

export const SessionHistory = ({ isOpen, onClose, history, onClearHistory, onLoadSession }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      justify: 'flex-end',
      zIndex: 1000
    }}>
      <div className="glass-panel" style={{
        width: '420px',
        height: '100%',
        borderRadius: '0',
        borderLeft: '1px solid var(--border-color)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <History size={20} color="#818cf8" />
            <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Execution History</h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px', fontSize: '14px' }}>
              <Clock size={36} style={{ opacity: 0.4, marginBottom: '12px' }} />
              <p>No agent sessions recorded yet.</p>
              <p style={{ fontSize: '12px', marginTop: '4px' }}>Run a goal to save session records.</p>
            </div>
          ) : (
            history.map((item) => {
              const isSuccess = item.status === 'completed';
              return (
                <div
                  key={item.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="badge" style={{
                      background: isSuccess ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: isSuccess ? 'var(--success)' : 'var(--danger)',
                      border: `1px solid ${isSuccess ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                    }}>
                      {isSuccess ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                      {item.status.toUpperCase()}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                    {item.goal}
                  </p>

                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', gap: '12px' }}>
                    <span>Url: {new URL(item.startUrl || 'https://google.com').hostname}</span>
                    <span>Steps: {item.stepCount || 0}</span>
                  </div>

                  {item.result && (
                    <div style={{
                      background: 'rgba(0,0,0,0.3)',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      color: '#a7f3d0',
                      maxHeight: '60px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {typeof item.result === 'object' ? JSON.stringify(item.result) : String(item.result)}
                    </div>
                  )}

                  <button
                    onClick={() => onLoadSession(item)}
                    style={{
                      marginTop: '4px',
                      alignSelf: 'flex-start',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--accent-light)',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <ExternalLink size={12} /> Reload Goal
                  </button>
                </div>
              );
            })
          )}
        </div>

        {history.length > 0 && (
          <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={onClearHistory}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                color: 'var(--danger)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Trash2 size={14} /> Clear History
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
