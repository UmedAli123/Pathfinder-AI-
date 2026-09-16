import React, { useState } from 'react';
import { Eye, Globe, Maximize2, X, Code, Monitor, Loader2, Sparkles } from 'lucide-react';

export const LivePreview = ({ screenshot, currentUrl, title, domElements, status }) => {
  const [activeTab, setActiveTab] = useState('browser'); // 'browser' | 'dom'
  const [isFullscreen, setIsFullscreen] = useState(false);

  const isRunning = status === 'running';

  return (
    <div className="glass-panel" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: '540px',
      borderRadius: '18px',
      overflow: 'hidden'
    }}>
      {/* Mockup Header Bar */}
      <div style={{
        padding: '12px 18px',
        background: 'rgba(0, 0, 0, 0.4)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
          </div>

          {/* Navigation Bar URL */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-color)',
            padding: '5px 14px',
            borderRadius: '20px',
            width: '320px',
            overflow: 'hidden'
          }}>
            <Globe size={13} color="#818cf8" />
            <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {currentUrl || 'https://browser.agent'}
            </span>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setActiveTab('browser')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              background: activeTab === 'browser' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              border: `1px solid ${activeTab === 'browser' ? 'var(--accent-light)' : 'transparent'}`,
              color: activeTab === 'browser' ? '#fff' : 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <Monitor size={14} /> Live Screen
          </button>
          <button
            onClick={() => setActiveTab('dom')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              background: activeTab === 'dom' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              border: `1px solid ${activeTab === 'dom' ? 'var(--accent-light)' : 'transparent'}`,
              color: activeTab === 'dom' ? '#fff' : 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <Code size={14} /> Inspector ({domElements ? domElements.length : 0})
          </button>
          {screenshot && (
            <button
              onClick={() => setIsFullscreen(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '6px'
              }}
              title="Expand Screenshot"
            >
              <Maximize2 size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Body */}
      <div style={{ flex: 1, position: 'relative', background: '#05070a', overflow: 'hidden' }}>
        {activeTab === 'browser' ? (
          screenshot ? (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <img
                src={screenshot.startsWith('data:') ? screenshot : `data:image/png;base64,${screenshot}`}
                alt="Live Page View"
                style={{
                  maxWidth: '100%',
                  maxHeight: '480px',
                  objectFit: 'contain',
                  borderRadius: '4px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                  transition: 'opacity 0.25s ease-in-out',
                  opacity: 1
                }}
              />
              {isRunning && (
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(0,0,0,0.8)',
                  backdropFilter: 'blur(8px)',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: '1px solid var(--accent-light)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  color: '#fff',
                  boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)'
                }}>
                  <Loader2 size={14} className="spin-slow" color="#818cf8" /> Agent Inspecting Page...
                </div>
              )}
            </div>
          ) : (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', color: 'var(--text-muted)' }}>
              <Monitor size={48} style={{ opacity: 0.3 }} />
              <p style={{ fontSize: '14px', fontWeight: '500' }}>Browser View Ready</p>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Launch an agent goal to watch live browser execution.</p>
            </div>
          )
        ) : (
          /* DOM Inspector Tab */
          <div style={{ height: '100%', padding: '16px', overflowY: 'auto' }}>
            <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} color="#818cf8" /> Discovered Interactive DOM Elements
            </h4>
            {domElements && domElements.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {domElements.map((el, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-color)',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                        [{el.id || idx}]
                      </span>
                      <span style={{ color: '#f43f5e', fontWeight: '600' }}>&lt;{el.tag || el.tag_name || 'elem'}&gt;</span>
                      <span style={{ color: '#e2e8f0' }}>{el.text || el.value || '(empty)'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No interactive elements parsed yet.</p>
            )}
          </div>
        )}
      </div>

      {/* Fullscreen Screenshot Modal */}
      {isFullscreen && screenshot && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.9)', backdropFilter: 'blur(12px)',
          zIndex: 2000, display: 'flex', flexDirection: 'column', padding: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>
              Full Resolution View: {title || currentUrl}
            </span>
            <button
              onClick={() => setIsFullscreen(false)}
              style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img
              src={screenshot.startsWith('data:') ? screenshot : `data:image/png;base64,${screenshot}`}
              alt="Fullscreen View"
              style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 0 50px rgba(0,0,0,0.8)' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
