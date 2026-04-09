const { execSync, exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const FALLBACK_MODELS = [
  { name: "llama3", tags: ["latest", "8b", "8b-instruct-q4_0"] },
  { name: "llama3.1", tags: ["latest", "8b", "70b"] },
  { name: "mistral", tags: ["latest", "7b"] },
  { name: "mixtral", tags: ["latest", "8x7b"] },
  { name: "phi3", tags: ["latest", "3.8b", "14b"] },
  { name: "phi3.5", tags: ["latest", "3.8b-mini"] },
  { name: "codellama", tags: ["latest", "7b", "13b", "34b"] },
  { name: "qwen2.5", tags: ["latest", "7b", "14b", "32b"] },
  { name: "qwen2.5-coder", tags: ["latest", "2b", "7b", "14b"] },
  { name: "qwen3", tags: ["latest", "4b", "8b", "14b"] },
  { name: "gemma2", tags: ["latest", "2b", "9b", "27b"] },
  { name: "gemma3", tags: ["latest", "1b", "4b"] },
  { name: "granite3", tags: ["latest", "8b"] },
  { name: "granite3-dense", tags: ["latest", "8b"] },
  { name: "nomic-embed-text", tags: ["latest", "v1.5"] },
  { name: "llava", tags: ["latest", "1.6", "1.7"] },
  { name: "llava-llama3", tags: ["latest"] },
  { name: "deepseek-r1", tags: ["latest", "1.6b", "7b", "14b", "70b"] },
  { name: "deepseek-coder-v2", tags: ["latest", "16b"] },
  { name: "aya", tags: ["latest", "8b", "35b"] },
];

function getFallbackModels() {
  return FALLBACK_MODELS;
}

function findOllamaPath() {
  const platform = os.platform();
  
  try {
    if (platform === 'win32') {
      const result = execSync('where.exe ollama', { encoding: 'utf8', timeout: 5000 });
      const ollamaPath = result.trim().split('\n')[0];
      if (ollamaPath && fs.existsSync(ollamaPath)) {
        return ollamaPath;
      }
    } else {
      const result = execSync('which ollama', { encoding: 'utf8', timeout: 5000 });
      const ollamaPath = result.trim();
      if (ollamaPath && fs.existsSync(ollamaPath)) {
        return ollamaPath;
      }
    }
  } catch (e) {
  }
  
  const commonPaths = platform === 'win32' 
    ? [
        path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Ollama', 'ollama.exe'),
        path.join(process.env.PROGRAMFILES || 'C:\\Program Files', 'Ollama', 'ollama.exe'),
        'C:\\Ollama\\ollama.exe',
      ]
    : [
        '/usr/local/bin/ollama',
        '/usr/bin/ollama',
        path.join(os.homedir(), 'ollama'),
      ];
  
  for (const p of commonPaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  
  return null;
}

function parseModelList(output) {
  const models = [];
  const lines = output.trim().split('\n');
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = line.split(/\s+/);
    if (parts.length >= 2) {
      const nameWithTag = parts[0];
      const size = parts[parts.length - 1];
      
      const colonIndex = nameWithTag.indexOf(':');
      if (colonIndex !== -1) {
        const name = nameWithTag.substring(0, colonIndex);
        const tag = nameWithTag.substring(colonIndex + 1);
        
        const existing = models.find(m => m.name === name);
        if (existing) {
          if (!existing.tags.includes(tag)) {
            existing.tags.push(tag);
          }
        } else {
          models.push({ name, tags: [tag], size });
        }
      } else {
        if (!models.find(m => m.name === nameWithTag)) {
          models.push({ name: nameWithTag, tags: ['latest'], size });
        }
      }
    }
  }
  
  return models;
}

async function findOllama() {
  const ollamaPath = findOllamaPath();
  
  if (!ollamaPath) {
    return { found: false, path: null, models: [] };
  }
  
  try {
    const output = execSync(`"${ollamaPath}" list`, { 
      encoding: 'utf8', 
      timeout: 10000,
      windowsHide: true 
    });
    
    const models = parseModelList(output);
    
    return {
      found: true,
      path: ollamaPath,
      models
    };
  } catch (err) {
    return {
      found: true,
      path: ollamaPath,
      models: [],
      error: err.message
    };
  }
}

function createModel(modelName, modelfileContent) {
  return new Promise((resolve, reject) => {
    const ollamaPath = findOllamaPath();
    
    if (!ollamaPath) {
      return reject(new Error('Ollama not found. Please install Ollama first.'));
    }
    
    const tempFile = path.join(os.tmpdir(), `modelfile-${Date.now()}`);
    
    fs.writeFileSync(tempFile, modelfileContent, 'utf8');
    
    try {
      const output = execSync(
        `"${ollamaPath}" create ${modelName} -f "${tempFile}"`,
        { 
          encoding: 'utf8', 
          timeout: 300000,
          windowsHide: true 
        }
      );
      
      fs.unlinkSync(tempFile);
      
      resolve(output);
    } catch (err) {
      try {
        fs.unlinkSync(tempFile);
      } catch (e) {}
      
      reject(err);
    }
  });
}

const DEFAULT_PARAMETERS = {
  num_ctx: 4096,
  top_k: 40,
  top_p: 0.9,
  temperature: 0.7
};

function getModelParameters(modelName) {
  const ollamaPath = findOllamaPath();
  
  if (!ollamaPath) {
    return { ...DEFAULT_PARAMETERS };
  }
  
  try {
    const fullName = modelName.includes(':') ? modelName : `${modelName}:latest`;
    const output = execSync(
      `"${ollamaPath}" show ${fullName}`,
      { 
        encoding: 'utf8', 
        timeout: 10000,
        windowsHide: true 
      }
    );
    
    const params = { ...DEFAULT_PARAMETERS };
    const lines = output.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('PARAMETER ')) {
        const match = trimmed.match(/^PARAMETER\s+(\w+)\s+(.+)$/);
        if (match) {
          const paramName = match[1].toLowerCase();
          const paramValue = match[2];
          
          if (paramName === 'num_ctx') {
            params.num_ctx = parseInt(paramValue) || DEFAULT_PARAMETERS.num_ctx;
          } else if (paramName === 'top_k') {
            params.top_k = parseInt(paramValue) || DEFAULT_PARAMETERS.top_k;
          } else if (paramName === 'top_p') {
            params.top_p = parseFloat(paramValue) || DEFAULT_PARAMETERS.top_p;
          } else if (paramName === 'temperature') {
            params.temperature = parseFloat(paramValue) || DEFAULT_PARAMETERS.temperature;
          }
        }
      }
    }
    
    return params;
  } catch (err) {
    return { ...DEFAULT_PARAMETERS };
  }
}

module.exports = {
  findOllama,
  getFallbackModels,
  createModel,
  getModelParameters
};