import React from 'react';
import { Play, Square, Pause, RotateCw, Globe, Target, Sliders, Cpu, Sparkles } from 'lucide-react';
import { PresetRecipes } from './PresetRecipes';

export const GoalInput = ({
  goal,
  setGoal,
  startUrl,
  setStartUrl,
  maxSteps,
  setMaxSteps,
  modelName,
  setModelName,
  status,
  onStart,
  onStop,
  onPause,
  onResume
}) => {
  const isRunning = status === 'running';
  const isPaused = status === 'paused';
  const isIdle = status === 'idle' || status === 'complete' || status === 'stopped' || status === 'error';

  const handleSelectRecipe = (recipe) => {
    setGoal(recipe.goal);
    setStartUrl(recipe.startUrl);
    setMaxSteps(recipe.maxSteps);
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', borderRadius: '18px' }}>
      {/* Preset Templates */}
      <PresetRecipes onSelectRecipe={handleSelectRecipe} currentGoal={goal} />

      {/* Inputs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '18px' }}>
        {/* Goal Input */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            <Target size={15} color="#818cf8" /> Objective / Goal Prompt
          </label>
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            disabled={!isIdle}
            rows={3}
            placeholder="Describe what the agent should accomplish (e.g. Search for product X and extract details)..."
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'rgba(0, 0, 0, 0.35)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '14px',
              lineHeight: '1.5',
              resize: 'none',
              outline: 'none',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)'
            }}
          />
        </div>

        {/* Start URL & Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              <Globe size={15} color="#3b82f6" /> Initial Starting URL
            </label>
            <input
              type="url"
              value={startUrl}
              onChange={(e) => setStartUrl(e.target.value)}
              disabled={!isIdle}
              placeholder="https://..."
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                background: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {/* Model Selector */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px' }}>
                <Cpu size={12} /> Model
              </label>
              <select
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                disabled={!isIdle}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  outline: 'none'
                }}
              >
                <option value="llama-3.3-70b-versatile">Llama 3.3 70B</option>
                <option value="llama3-70b-8192">Llama3 70B</option>
                <option value="mixtral-8x7b-32768">Mixtral 8x7b</option>
                <option value="qwen-2.5-32b">Qwen 2.5 32B</option>
              </select>
            </div>

            {/* Max Steps */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px' }}>
                <Sliders size={12} /> Max Steps: <strong style={{ color: '#fff' }}>{maxSteps}</strong>
              </label>
              <input
                type="range"
                min="3"
                max="30"
                value={maxSteps}
                onChange={(e) => setMaxSteps(Number(e.target.value))}
                disabled={!isIdle}
                style={{ width: '100%', marginTop: '6px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '14px', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Status:</span>
          <span className="badge" style={{
            background: isRunning ? 'rgba(16, 185, 129, 0.15)' : isPaused ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.05)',
            color: isRunning ? 'var(--success)' : isPaused ? 'var(--warning)' : 'var(--text-secondary)',
            border: `1px solid ${isRunning ? 'rgba(16, 185, 129, 0.3)' : isPaused ? 'rgba(245, 158, 11, 0.3)' : 'var(--border-color)'}`
          }}>
            {status.toUpperCase()}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isIdle ? (
            <button
              onClick={onStart}
              className="btn-primary"
              disabled={!goal.trim()}
              style={{ padding: '10px 24px', fontSize: '14px' }}
            >
              <Play size={16} /> Execute Goal
            </button>
          ) : (
            <>
              {isRunning && (
                <button
                  onClick={onPause}
                  className="btn-secondary"
                  style={{ borderColor: 'rgba(245, 158, 11, 0.4)', color: 'var(--warning)' }}
                >
                  <Pause size={16} /> Pause Agent
                </button>
              )}
              {isPaused && (
                <button
                  onClick={onResume}
                  className="btn-primary"
                >
                  <RotateCw size={16} /> Resume Agent
                </button>
              )}
              <button
                onClick={onStop}
                className="btn-secondary"
                style={{ background: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.3)', color: 'var(--danger)' }}
              >
                <Square size={16} /> Stop Execution
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
