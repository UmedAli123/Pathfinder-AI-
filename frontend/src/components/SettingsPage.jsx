import React, { useState } from 'react';
import { Settings, Cpu, Key, Globe, Sliders, ShieldCheck, Check, Sparkles } from 'lucide-react';

export const SettingsPage = ({
  apiKey,
  onApiKeyChange,
  modelName,
  setModelName,
  maxSteps,
  setMaxSteps,
  startUrl,
  setStartUrl
}) => {
  const [tempKey, setTempKey] = useState(apiKey);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveAll = () => {
    onApiKeyChange(tempKey);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-panel" style={{ padding: '32px', borderRadius: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <Settings size={24} color="#6366f1" />
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '800' }}>Agent & System Settings</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Configure your Groq LLM API Key, reasoning model, and execution parameters.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Groq API Key */}
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '700', color: '#fff', marginBottom: '6px' }}>
              <Key size={16} color="#818cf8" /> Groq API Secret Key
            </label>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Used to power fast browser reasoning with Llama 3.3 70B & Qwen models via Groq API.
            </p>
            <input
              type="password"
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              placeholder="gsk_..."
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '10px',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid var(--border-color)',
                color: '#fff',
                fontFamily: 'monospace',
                fontSize: '13px',
                outline: 'none'
              }}
            />
          </div>

          {/* Model Selection */}
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '700', color: '#fff', marginBottom: '6px' }}>
              <Cpu size={16} color="#3b82f6" /> Primary Reasoning LLM Model
            </label>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Select the LLM model for parsing DOM element structures and deciding browser actions.
            </p>
            <select
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '10px',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid var(--border-color)',
                color: '#fff',
                fontSize: '14px',
                outline: 'none'
              }}
            >
              <option value="llama-3.3-70b-versatile">Llama 3.3 70B Versatile (Recommended)</option>
              <option value="llama3-70b-8192">Llama 3 70B (High Accuracy)</option>
              <option value="mixtral-8x7b-32768">Mixtral 8x7B (32k Context)</option>
              <option value="qwen-2.5-32b">Qwen 2.5 32B</option>
            </select>
          </div>

          {/* Default Starting URL & Step Limit */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '700', color: '#fff', marginBottom: '6px' }}>
                <Globe size={16} color="#10b981" /> Default Starting URL
              </label>
              <input
                type="url"
                value={startUrl}
                onChange={(e) => setStartUrl(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '700', color: '#fff', marginBottom: '6px' }}>
                <Sliders size={16} color="#f59e0b" /> Default Max Steps: <strong>{maxSteps}</strong>
              </label>
              <input
                type="range"
                min="5"
                max="30"
                value={maxSteps}
                onChange={(e) => setMaxSteps(Number(e.target.value))}
                style={{ width: '100%', marginTop: '12px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '14px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
          {savedSuccess && (
            <span style={{ fontSize: '13px', color: 'var(--success)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Check size={16} /> Settings saved successfully!
            </span>
          )}
          <button
            onClick={handleSaveAll}
            className="btn-primary"
            style={{ padding: '12px 28px', fontSize: '14px' }}
          >
            <ShieldCheck size={16} /> Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
