import React, { useState } from 'react';
import { History, CheckCircle, AlertCircle, Clock, Trash2, Download, ExternalLink, Activity, BarChart2, Check, FileText } from 'lucide-react';

export const HistoryPage = ({ history, onClearHistory, onLoadSession }) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);

  const totalRuns = history.length;
  const completedRuns = history.filter((h) => h.status === 'completed').length;
  const successRate = totalRuns > 0 ? Math.round((completedRuns / totalRuns) * 100) : 0;
  const avgSteps = totalRuns > 0 ? Math.round(history.reduce((acc, h) => acc + (h.stepCount || 0), 0) / totalRuns) : 0;

  const filteredHistory = history.filter((h) => {
    if (filterStatus === 'completed') return h.status === 'completed';
    if (filterStatus === 'stopped') return h.status === 'stopped' || h.status === 'error';
    return true;
  });

  const handleExportAllJSON = () => {
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pathfinder-full-history-${Date.now()}.json`;
    a.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Metrics Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '12px', borderRadius: '12px' }}>
            <Activity size={24} color="#818cf8" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>Total Executions</div>
            <div style={{ fontSize: '26px', fontWeight: '800', color: '#fff' }}>{totalRuns}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '12px', borderRadius: '12px' }}>
            <CheckCircle size={24} color="#10b981" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>Success Rate</div>
            <div style={{ fontSize: '26px', fontWeight: '800', color: '#10b981' }}>{successRate}%</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.2)', padding: '12px', borderRadius: '12px' }}>
            <BarChart2 size={24} color="#f59e0b" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>Avg Steps / Task</div>
            <div style={{ fontSize: '26px', fontWeight: '800', color: '#f59e0b' }}>{avgSteps}</div>
          </div>
        </div>
      </div>

      {/* Main History Table Container */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <History size={22} color="#818cf8" />
            <h2 style={{ fontSize: '20px', fontWeight: '700' }}>Execution Records</h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Filter Buttons */}
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '8px' }}>
              {['all', 'completed', 'stopped'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '6px',
                    background: filterStatus === st ? 'var(--accent-primary)' : 'transparent',
                    border: 'none',
                    color: filterStatus === st ? '#fff' : 'var(--text-secondary)',
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'capitalize',
                    cursor: 'pointer'
                  }}
                >
                  {st}
                </button>
              ))}
            </div>

            {history.length > 0 && (
              <>
                <button
                  onClick={handleExportAllJSON}
                  className="btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                >
                  <Download size={14} /> Export JSON
                </button>
                <button
                  onClick={onClearHistory}
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: 'var(--danger)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Trash2 size={14} /> Clear
                </button>
              </>
            )}
          </div>
        </div>

        {/* History Table */}
        {filteredHistory.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '48px 0' }}>
            <Clock size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <p style={{ fontSize: '15px' }}>No session logs recorded yet.</p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Run goals in the Playground to populate history records.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredHistory.map((item) => {
              const isSuccess = item.status === 'completed';
              return (
                <div
                  key={item.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'space-between',
                    gap: '16px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                    <span className="badge" style={{
                      background: isSuccess ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: isSuccess ? 'var(--success)' : 'var(--danger)',
                      border: `1px solid ${isSuccess ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                      padding: '6px 12px'
                    }}>
                      {isSuccess ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                      {item.status.toUpperCase()}
                    </span>

                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                        {item.goal}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', gap: '16px' }}>
                        <span>Target: {new URL(item.startUrl || 'https://google.com').hostname}</span>
                        <span>Steps: {item.stepCount || 0}</span>
                        <span>Time: {new Date(item.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {item.result && (
                      <button
                        onClick={() => setSelectedItem(item)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid var(--border-color)',
                          color: '#fff',
                          padding: '8px 14px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <FileText size={14} /> View Result
                      </button>
                    )}

                    <button
                      onClick={() => onLoadSession(item)}
                      className="btn-primary"
                      style={{ padding: '8px 14px', fontSize: '12px' }}
                    >
                      <ExternalLink size={14} /> Load Goal
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Result Output Modal */}
      {selectedItem && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
          zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
        }}>
          <div className="glass-panel" style={{ width: '600px', padding: '28px', borderRadius: '18px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>
              Output Result: {selectedItem.goal}
            </h3>
            <pre style={{
              background: 'rgba(0, 0, 0, 0.5)',
              padding: '16px',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              color: '#34d399',
              fontFamily: 'monospace',
              fontSize: '13px',
              maxHeight: '320px',
              overflowY: 'auto',
              whiteSpace: 'pre-wrap'
            }}>
              {typeof selectedItem.result === 'object' ? JSON.stringify(selectedItem.result, null, 2) : String(selectedItem.result)}
            </pre>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                onClick={() => setSelectedItem(null)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
