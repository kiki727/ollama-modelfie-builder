const express = require('express');
const cors = require('cors');
const path = require('path');
const chalk = require('chalk');
const ollamaHelper = require('./lib/ollama-helper');

const app = express();
let serverInstance = null;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/ollama-status', async (req, res) => {
  try {
    const ollamaInfo = await ollamaHelper.findOllama();
    res.json({
      found: ollamaInfo.found,
      path: ollamaInfo.path || null,
      models: ollamaInfo.models || []
    });
  } catch (err) {
    res.json({
      found: false,
      path: null,
      models: [],
      error: err.message
    });
  }
});

app.get('/api/models', async (req, res) => {
  try {
    const ollamaInfo = await ollamaHelper.findOllama();
    
    let models = [];
    
    if (ollamaInfo.found && ollamaInfo.models && ollamaInfo.models.length > 0) {
      models = ollamaInfo.models.map(m => ({
        name: m.name,
        tags: m.tags || ['latest'],
        source: 'installed'
      }));
      
      models = models.filter(m => 
        !m.tags.some(tag => tag.toLowerCase().includes('cloud'))
      );
    }
    
    res.json({ models });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/create-model', async (req, res) => {
  const { modelName, modelfileContent } = req.body;
  
  if (!modelName || !modelfileContent) {
    return res.status(400).json({ error: 'Missing modelName or modelfileContent' });
  }
  
  try {
    const result = await ollamaHelper.createModel(modelName, modelfileContent);
    res.json({ success: true, output: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/model-parameters/:modelName', async (req, res) => {
  const { modelName } = req.params;
  
  if (!modelName) {
    return res.status(400).json({ error: 'Missing modelName' });
  }
  
  try {
    const params = ollamaHelper.getModelParameters(modelName);
    res.json({ parameters: params });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/model-modelfile/:modelName', async (req, res) => {
  const { modelName } = req.params;
  
  if (!modelName) {
    return res.status(400).json({ error: 'Missing modelName' });
  }
  
  try {
    const ollamaPath = ollamaHelper.findOllamaPath();
    if (!ollamaPath) {
      return res.status(400).json({ error: 'Ollama not found' });
    }
    
    const { execSync } = require('child_process');
    const fullName = modelName.includes(':') ? modelName : `${modelName}:latest`;
    const output = execSync(
      `"${ollamaPath}" show ${fullName} --modelfile`,
      { encoding: 'utf8', timeout: 30000, windowsHide: true }
    );
    
    res.json({ modelfile: output });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function start(port = 3000) {
  serverInstance = app.listen(port, () => {
    console.log(chalk.green('  ✓ Server running at: ') + chalk.cyan(`http://localhost:${port}`));
    console.log(chalk.gray('\n  Press Ctrl+C to stop the server\n'));
  });
}

function stop() {
  if (serverInstance) {
    serverInstance.close();
  }
}

module.exports = { app, start, stop };