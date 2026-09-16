import React, { useState } from 'react';
import { Search, Sparkles, ArrowRight, BookOpen, ShoppingCart, Newspaper, Cpu, Globe, Filter } from 'lucide-react';
import { PRESET_RECIPES } from './PresetRecipes';

export const RecipesPage = ({ onSelectAndRun }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Search & Research', 'News Aggregation', 'Knowledge Retrieval', 'E-Commerce'];

  const filteredRecipes = PRESET_RECIPES.filter((r) => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.goal.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || r.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Banner */}
      <div className="glass-panel" style={{ padding: '32px', borderRadius: '18px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.05) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-light)', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
          <Sparkles size={16} /> Automation Recipe Library
        </div>
        <h2 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '8px' }}>Pre-Configured AI Agent Tasks</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '640px' }}>
          Select any workflow below to automatically configure Pathfinder AI with optimized prompts, starting URLs, and step limits.
        </p>

        {/* Search & Filter Bar */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '24px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid var(--border-color)',
            padding: '10px 16px',
            borderRadius: '12px',
            flex: 1,
            minWidth: '280px'
          }}>
            <Search size={18} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '14px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  background: selectedCategory === cat ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${selectedCategory === cat ? 'var(--accent-light)' : 'var(--border-color)'}`,
                  color: selectedCategory === cat ? '#fff' : 'var(--text-secondary)',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Recipes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {filteredRecipes.map((recipe) => {
          const Icon = recipe.icon;
          return (
            <div
              key={recipe.id}
              className="glass-panel"
              style={{
                padding: '24px',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between',
                gap: '16px',
                transition: 'all 0.25s ease'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ background: `${recipe.color}25`, padding: '10px', borderRadius: '12px', display: 'flex' }}>
                    <Icon size={22} color={recipe.color} />
                  </div>
                  <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                    {recipe.category}
                  </span>
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>{recipe.title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '14px' }}>
                  {recipe.goal}
                </p>

                <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', gap: '16px', fontFamily: 'monospace' }}>
                  <span>URL: {new URL(recipe.startUrl).hostname}</span>
                  <span>Max Steps: {recipe.maxSteps}</span>
                </div>
              </div>

              <button
                onClick={() => onSelectAndRun(recipe)}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
              >
                <span>Launch Recipe in Playground</span>
                <ArrowRight size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
