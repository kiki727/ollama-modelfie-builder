const API_BASE = '/api';

async function fetchOllamaStatus() {
  try {
    const response = await fetch(`${API_BASE}/ollama-status`);
    return await response.json();
  } catch (err) {
    return { found: false, models: [], error: err.message };
  }
}

async function fetchModels() {
  try {
    const response = await fetch(`${API_BASE}/models`);
    const data = await response.json();
    return data.models || [];
  } catch (err) {
    console.error('Failed to fetch models:', err);
    return [];
  }
}

async function createOllamaModel(modelName, modelfileContent) {
  try {
    const response = await fetch(`${API_BASE}/create-model`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ modelName, modelfileContent })
    });
    const data = await response.json();
    return data;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function fetchModelParameters(modelName) {
  try {
    const response = await fetch(`${API_BASE}/model-parameters/${encodeURIComponent(modelName)}`);
    const data = await response.json();
    return data.parameters || null;
  } catch (err) {
    console.error('Failed to fetch model parameters:', err);
    return null;
  }
}