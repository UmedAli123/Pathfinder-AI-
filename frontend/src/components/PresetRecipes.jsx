import React from 'react';
import { Search, Globe, ShoppingCart, Newspaper, BookOpen, Sparkles } from 'lucide-react';

export const PRESET_RECIPES = [
  {
    id: 'google_search',
    title: 'Google Top Results',
    category: 'Search & Research',
    icon: Search,
    color: '#6366f1',
    startUrl: 'https://www.google.com',
    goal: 'Search Google for "best laptops 2026" and extract the titles and links of top 3 search results',
    maxSteps: 12
  },
  {
    id: 'hn_tech',
    title: 'HackerNews Top Stories',
    category: 'News Aggregation',
    icon: Newspaper,
    color: '#f59e0b',
    startUrl: 'https://news.ycombinator.com',
    goal: 'Scrape the top 5 trending headlines, point scores, and comments link on Hacker News homepage',
    maxSteps: 10
  },
  {
    id: 'wiki_summary',
    title: 'Wikipedia Topic Summary',
    category: 'Knowledge Retrieval',
    icon: BookOpen,
    color: '#10b981',
    startUrl: 'https://www.wikipedia.org',
    goal: 'Search Wikipedia for "Artificial Intelligence" and extract the first 3 paragraphs of the summary',
    maxSteps: 10
  },
  {
    id: 'ecommerce_check',
    title: 'Product Price Check',
    category: 'E-Commerce',
    icon: ShoppingCart,
    color: '#d946ef',
    startUrl: 'https://www.amazon.com',
    goal: 'Search for "wireless noise canceling headphones" and get title and price of the first item',
    maxSteps: 15
  }
];

export const PresetRecipes = ({ onSelectRecipe, currentGoal }) => {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={14} color="#818cf8" /> Preset Automation Recipes
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
        {PRESET_RECIPES.map((recipe) => {
          const Icon = recipe.icon;
          const isSelected = currentGoal === recipe.goal;
          return (
            <button
              key={recipe.id}
              onClick={() => onSelectRecipe(recipe)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '10px',
                background: isSelected ? 'rgba(99, 102, 241, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${isSelected ? 'var(--accent-light)' : 'rgba(255, 255, 255, 0.08)'}`,
                color: 'var(--text-primary)',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isSelected ? '0 0 15px rgba(99, 102, 241, 0.25)' : 'none'
              }}
            >
              <div style={{ background: `${recipe.color}20`, padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={16} color={recipe.color} />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {recipe.title}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {recipe.category}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
