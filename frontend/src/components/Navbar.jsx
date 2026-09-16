import React from 'react';
import { Bot, Play, Sparkles, History, Settings, ShieldCheck, Cpu } from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab, isConnected, historyCount }) => {
  const navItems = [
    { id: 'playground', label: 'Playground', icon: Play },
    { id: 'recipes', label: 'Automation Recipes', icon: Sparkles },
    { id: 'history', label: 'History & Analytics', icon: History, badge: historyCount },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="glass-panel" style={{
      padding: '12px 24px',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      justify: 'space-between',
      borderRadius: '16px'
    }}>
      {/* Brand Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          background: 'var(--accent-gradient)',
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justify: 'center',
          boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
        }}>
          <Bot size={24} color="#ffffff" />
        </div>
        <div>
          <h1 style={{
            fontSize: '20px',
            fontWeight: '800',
            letterSpacing: '-0.02em',
            background: 'linear-gradient(90deg, #ffffff 0%, #cbd5e1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            Pathfinder AI
          </h1>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            Autonomous Browser Reasoning Agent
          </span>
        </div>
      </div>

      {/* Center Navigation Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: 'rgba(0, 0, 0, 0.35)',
        padding: '5px',
        borderRadius: '12px',
        border: '1px solid var(--border-color)'
      }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                background: isActive ? 'var(--accent-primary)' : 'transparent',
                border: 'none',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: isActive ? '600' : '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? '0 4px 14px rgba(99, 102, 241, 0.4)' : 'none'
              }}
            >
              <Icon size={16} />
              <span>{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span style={{
                  background: isActive ? 'rgba(255,255,255,0.25)' : 'rgba(99, 102, 241, 0.2)',
                  color: isActive ? '#fff' : 'var(--accent-light)',
                  fontSize: '10px',
                  fontWeight: '700',
                  padding: '1px 6px',
                  borderRadius: '10px'
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Backend Status Indicator */}
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
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
    </nav>
  );
};
