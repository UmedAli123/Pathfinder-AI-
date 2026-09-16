import React, { useState } from 'react';
import { Bot, Key, ShieldCheck, Cpu, History, Sparkles } from 'lucide-react';

export const Header = ({ isConnected, apiKey, onApiKeyChange, onOpenHistory, historyCount }) => {
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey);

  const handleSaveKey = () => {
    onApiKeyChange(tempKey);
    setShowKeyModal(false);
  };

  return (
    <header className="glass-panel" style={{
      padding: '16px 28px',
      marginBottom: '24px',
      display: 'flex',
      justify: 'space-between',
      alignItems: 'center',
      borderRadius: '16px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          background: 'var(--accent-gradient)',
          width: '46px',
          height: '46px',
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          justify: 'center',
          boxShadow: '0 0 24px rgba(99, 102, 241, 0.5)'
        }}>
          <Bot size={26} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{
              fontSize: '22px',
              fontWeight: '800',
              letterSpacing: '-0.03em',
              background: 'linear-gradient(90deg, #ffffff 0%, #cbd5e1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Pathfinder AI
            </h1>
            <span className="badge" style={{
              background: 'rgba(99, 102, 241, 0.15)',
              color: '#a5b4fc',
              border: '1px solid rgba(99, 102, 241, 0.35)'
            }}>
              <Sparkles size={11} /> GROQ + PLAYWRIGHT
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Autonomous AI Web Automation & Browser Reasoning Agent
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Status Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '20px',
          background: isConnected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${isConnected ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: isConnected ? 'var(--success)' : 'var(--danger)',
            boxShadow: isConnected ? '0 0 10px var(--success)' : '0 0 10px var(--danger)',
            display: 'inline-block'
          }} />
          <span style={{ fontSize: '12px', fontWeight: '600', color: isConnected ? 'var(--success)' : 'var(--danger)' }}>
            {isConnected ? 'Backend Connected' : 'Disconnected'}
          </span>
        </div>

        {/* Session History Button */}
        <button
          onClick={onOpenHistory}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
        >
          <History size={16} color="#818cf8" />
          <span>History</span>
          {historyCount > 0 && (
            <span style={{
              background: 'var(--accent-primary)',
              color: '#fff',
              fontSize: '10px',
              fontWeight: '700',
              padding: '1px 6px',
              borderRadius: '10px'
            }}>
              {historyCount}
            </span>
          )}
        </button>

        {/* API Key Modal Button */}
        <button 
          onClick={() => setShowKeyModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
        >
          <Key size={16} color="#818cf8" />
          <span>Groq Key</span>
          <ShieldCheck size={14} color="#10b981" />
        </button>
      </div>

      {showKeyModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-panel" style={{ width: '460px', padding: '28px', borderRadius: '18px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Cpu size={22} color="#6366f1" /> Groq API Configuration
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '18px' }}>
              Provide your Groq API key to power autonomous browser reasoning with Llama 3.3 / Qwen.
            </p>
            <input 
              type="password"
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              placeholder="gsk_..."
              style={{
                width: '100%', padding: '12px 14px', borderRadius: '10px',
                background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-color)',
                color: '#fff', fontSize: '13px', fontFamily: 'monospace', marginBottom: '20px'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => setShowKeyModal(false)}
                style={{ padding: '9px 18px', borderRadius: '8px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveKey}
                className="btn-primary"
                style={{ padding: '9px 22px' }}
              >
                Save Key
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
