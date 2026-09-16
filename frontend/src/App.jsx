import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Navbar } from './components/Navbar';
import { GoalInput } from './components/GoalInput';
import { LivePreview } from './components/LivePreview';
import { AgentLogs } from './components/AgentLogs';
import { RecipesPage } from './components/RecipesPage';
import { HistoryPage } from './components/HistoryPage';
import { SettingsPage } from './components/SettingsPage';
import { AgentWebSocket } from './services/websocket';

export function App() {
  const [wsService] = useState(() => new AgentWebSocket());
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('playground'); // 'playground' | 'recipes' | 'history' | 'settings'

  const [apiKey, setApiKey] = useState(() => localStorage.getItem('groq_api_key') || '');
  const [goal, setGoal] = useState('Search Google for "best laptops 2026" and return top 3 result titles');
  const [startUrl, setStartUrl] = useState('https://www.google.com');
  const [maxSteps, setMaxSteps] = useState(15);
  const [modelName, setModelName] = useState('llama-3.3-70b-versatile');

  const [status, setStatus] = useState('idle');
  const [screenshot, setScreenshot] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');
  const [title, setTitle] = useState('');
  const [domElements, setDomElements] = useState([]);
  const [logs, setLogs] = useState([]);
  const [finalResult, setFinalResult] = useState(null);

  // Session History State (Persisted in localStorage)
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('pathfinder_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleApiKeyChange = (newKey) => {
    setApiKey(newKey);
    try {
      localStorage.setItem('groq_api_key', newKey);
    } catch (e) {
      console.error('Failed to store API key in localStorage:', e);
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem('pathfinder_history', JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save history:', e);
    }
  }, [history]);

  useEffect(() => {
    wsService.connect()
      .then(() => setIsConnected(true))
      .catch((err) => {
        console.error("Connection failed:", err);
        setIsConnected(false);
      });

    const unsubscribe = wsService.subscribe((msg) => {
      if (msg.status) setStatus(msg.status);
      if (msg.screenshot) setScreenshot(msg.screenshot);
      if (msg.url) setCurrentUrl(msg.url);
      if (msg.title) setTitle(msg.title);
      if (msg.dom_elements) setDomElements(msg.dom_elements);

      setLogs((prev) => [...prev, msg]);

      if (msg.type === 'complete' && msg.result) {
        setFinalResult(msg.result);
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });

        // Save session record
        setHistory((prev) => [{
          id: Date.now(),
          timestamp: new Date().toISOString(),
          status: 'completed',
          result: msg.result,
          stepCount: msg.step || 15
        }, ...prev.slice(0, 19)]);
      }
    });

    return () => {
      unsubscribe();
      wsService.close();
    };
  }, [wsService]);

  const handleStart = () => {
    setLogs([]);
    setFinalResult(null);
    setStatus('running');
    setActiveTab('playground');
    wsService.startAgent({
      goal,
      start_url: startUrl,
      max_steps: maxSteps,
      groq_api_key: apiKey,
      model_name: modelName
    });
  };

  const handleStop = () => {
    wsService.stopAgent();
    setStatus('stopped');
  };

  const handlePause = () => {
    wsService.pauseAgent();
    setStatus('paused');
  };

  const handleResume = () => {
    wsService.resumeAgent();
    setStatus('running');
  };

  const handleSelectRecipeAndRun = (recipe) => {
    setGoal(recipe.goal);
    setStartUrl(recipe.startUrl);
    setMaxSteps(recipe.maxSteps);
    setActiveTab('playground');
  };

  const handleLoadSession = (session) => {
    setGoal(session.goal);
    if (session.startUrl) setStartUrl(session.startUrl);
    setActiveTab('playground');
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('pathfinder_history');
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 32px' }}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isConnected={isConnected}
        historyCount={history.length}
      />

      {/* Dynamic Multi-Page View Rendering */}
      {activeTab === 'playground' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <GoalInput
            goal={goal}
            setGoal={setGoal}
            startUrl={startUrl}
            setStartUrl={setStartUrl}
            maxSteps={maxSteps}
            setMaxSteps={setMaxSteps}
            modelName={modelName}
            setModelName={setModelName}
            status={status}
            onStart={handleStart}
            onStop={handleStop}
            onPause={handlePause}
            onResume={handleResume}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', minHeight: '540px' }}>
            <LivePreview
              screenshot={screenshot}
              currentUrl={currentUrl}
              title={title}
              domElements={domElements}
              status={status}
            />

            <AgentLogs
              logs={logs}
            />
          </div>
        </div>
      )}

      {activeTab === 'recipes' && (
        <RecipesPage
          onSelectAndRun={handleSelectRecipeAndRun}
        />
      )}

      {activeTab === 'history' && (
        <HistoryPage
          history={history}
          onClearHistory={handleClearHistory}
          onLoadSession={handleLoadSession}
        />
      )}

      {activeTab === 'settings' && (
        <SettingsPage
          apiKey={apiKey}
          onApiKeyChange={handleApiKeyChange}
          modelName={modelName}
          setModelName={setModelName}
          maxSteps={maxSteps}
          setMaxSteps={setMaxSteps}
          startUrl={startUrl}
          setStartUrl={setStartUrl}
        />
      )}
    </div>
  );
}

export default App;
