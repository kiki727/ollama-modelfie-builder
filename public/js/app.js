class ModelfileApp {
  constructor() {
    this.currentStep = 1;
    this.selectedModel = null;
    this.selectedTag = null;
    this.currentTemplate = '';
    this.modelParameters = {
      num_ctx: 4096,
      top_k: 40,
      top_p: 0.9,
      temperature: 0.7
    };
    this.models = [];
    this.init();
  }

  async init() {
    this.bindElements();
    this.bindEvents();
    await this.checkOllamaStatus();
    await this.loadModels();
  }

  bindElements() {
    this.modelSelect = document.getElementById('modelSelect');
    this.tagSelect = document.getElementById('tagSelect');
    this.tagGroup = document.getElementById('tagGroup');
    this.modelInfo = document.getElementById('modelInfo');
    this.modelSource = document.getElementById('modelSource');
    this.nextBtn = document.getElementById('nextBtn');
    this.backBtn = document.getElementById('backBtn');
    this.saveBtn = document.getElementById('saveBtn');
    this.formatBtn = document.getElementById('formatBtn');
    this.resetBtn = document.getElementById('resetBtn');
    this.copyBtn = document.getElementById('copyBtn');
    this.step1 = document.getElementById('step1');
    this.step2 = document.getElementById('step2');
    this.saveModal = document.getElementById('saveModal');
    this.modelNameInput = document.getElementById('modelName');
    this.downloadBtn = document.getElementById('downloadBtn');
    this.clipboardBtn = document.getElementById('clipboardBtn');
    this.createOllamaBtn = document.getElementById('createOllamaBtn');
    this.closeModal = document.getElementById('closeModal');
    this.exportResult = document.getElementById('exportResult');
    this.resultMessage = document.getElementById('resultMessage');
    this.ollamaStatus = document.getElementById('ollamaStatus');
    this.toast = document.getElementById('toast');
    this.toastMessage = document.getElementById('toastMessage');
    this.parametersPanel = document.getElementById('parametersPanel');
    this.parametersHeader = document.getElementById('parametersHeader');
    this.parametersContent = document.getElementById('parametersContent');
    this.paramNumCtx = document.getElementById('paramNumCtx');
    this.paramTopK = document.getElementById('paramTopK');
    this.paramTopP = document.getElementById('paramTopP');
    this.paramTopPValue = document.getElementById('paramTopPValue');
    this.paramTemperature = document.getElementById('paramTemperature');
    this.paramTemperatureValue = document.getElementById('paramTemperatureValue');
  }

  bindEvents() {
    this.modelSelect.addEventListener('change', () => this.onModelChange());
    this.tagSelect.addEventListener('change', () => this.onTagChange());
    this.nextBtn.addEventListener('click', () => this.goToStep2());
    this.backBtn.addEventListener('click', () => this.goToStep1());
    this.saveBtn.addEventListener('click', () => this.showSaveModal());
    this.formatBtn.addEventListener('click', () => this.formatModelfile());
    this.resetBtn.addEventListener('click', () => this.resetTemplate());
    this.copyBtn.addEventListener('click', () => this.copyToClipboard());
    this.closeModal.addEventListener('click', () => this.hideSaveModal());
    this.saveModal.addEventListener('click', (e) => {
      if (e.target === this.saveModal) this.hideSaveModal();
    });
    this.downloadBtn.addEventListener('click', () => this.downloadModelfile());
    this.clipboardBtn.addEventListener('click', () => this.copyContent());
    this.createOllamaBtn.addEventListener('click', () => this.createInOllama());
    this.parametersHeader.addEventListener('click', () => this.toggleParameters());
    this.paramNumCtx.addEventListener('change', () => this.updateParameter('num_ctx'));
    this.paramTopK.addEventListener('change', () => this.updateParameter('top_k'));
    this.paramTopP.addEventListener('input', (e) => this.updateParameter('top_p', e.target.value));
    this.paramTemperature.addEventListener('input', (e) => this.updateParameter('temperature', e.target.value));
  }

  async checkOllamaStatus() {
    const statusDot = this.ollamaStatus.querySelector('.status-dot');
    const statusText = this.ollamaStatus.querySelector('.status-text');
    
    statusDot.className = 'status-dot loading';
    statusText.textContent = 'Checking Ollama...';

    const status = await fetchOllamaStatus();
    
    if (status.found) {
      statusDot.className = 'status-dot active';
      statusText.textContent = 'Ollama Connected';
    } else {
      statusDot.className = 'status-dot inactive';
      statusText.textContent = 'Ollama Not Found';
    }
  }

  async loadModels() {
    this.models = await fetchModels();
    
    this.modelSelect.innerHTML = '<option value="">Select a model...</option>';
    
    const installedModels = this.models.filter(m => m.source === 'installed');
    
    if (installedModels.length > 0) {
      installedModels.forEach(m => {
        const option = document.createElement('option');
        option.value = JSON.stringify(m);
        option.textContent = m.name;
        this.modelSelect.appendChild(option);
      });
    } else {
      const noModelsOption = document.createElement('option');
      noModelsOption.disabled = true;
      noModelsOption.textContent = 'No local models found';
      this.modelSelect.appendChild(noModelsOption);
    }
  }

  onModelChange() {
    const value = this.modelSelect.value;
    
    if (!value) {
      this.tagGroup.style.display = 'none';
      this.modelInfo.style.display = 'none';
      this.nextBtn.disabled = true;
      return;
    }

    const model = JSON.parse(value);
    this.selectedModel = model;
    
    this.tagSelect.innerHTML = '';
    model.tags.forEach(tag => {
      const option = document.createElement('option');
      option.value = tag;
      option.textContent = tag;
      this.tagSelect.appendChild(option);
    });
    
    if (model.tags.length > 0) {
      this.tagSelect.value = model.tags[0];
      this.selectedTag = model.tags[0];
    }
    
    this.tagGroup.style.display = 'block';
    this.modelInfo.style.display = 'block';
    this.modelSource.textContent = model.source === 'installed' ? 'Installed (Ollama)' : 'Popular (Fallback)';
    this.modelSource.className = 'info-value ' + model.source;
    
    this.nextBtn.disabled = false;
  }

  onTagChange() {
    this.selectedTag = this.tagSelect.value;
  }

  async loadModelParameters() {
    if (!this.selectedModel) return;
    
    const modelName = this.selectedModel.name;
    const params = await fetchModelParameters(modelName);
    
    if (params) {
      this.modelParameters = params;
    }
    
    this.paramNumCtx.value = this.modelParameters.num_ctx;
    this.paramTopK.value = this.modelParameters.top_k;
    this.paramTopP.value = this.modelParameters.top_p;
    this.paramTopPValue.textContent = this.modelParameters.top_p.toFixed(2);
    this.paramTemperature.value = this.modelParameters.temperature;
    this.paramTemperatureValue.textContent = this.modelParameters.temperature.toFixed(1);
  }

  toggleParameters() {
    this.parametersPanel.classList.toggle('collapsed');
  }

  updateParameter(name, value) {
    if (name === 'num_ctx') {
      this.modelParameters.num_ctx = parseInt(this.paramNumCtx.value) || 4096;
    } else if (name === 'top_k') {
      this.modelParameters.top_k = parseInt(this.paramTopK.value) || 40;
    } else if (name === 'top_p') {
      this.modelParameters.top_p = parseFloat(value);
      this.paramTopPValue.textContent = this.modelParameters.top_p.toFixed(2);
    } else if (name === 'temperature') {
      this.modelParameters.temperature = parseFloat(value);
      this.paramTemperatureValue.textContent = this.modelParameters.temperature.toFixed(1);
    }
    
    this.updateModelfileParameters();
  }

  updateModelfileParameters() {
    let content = getEditorContent();
    const params = this.modelParameters;
    
    const paramNames = ['num_ctx', 'top_k', 'top_p', 'temperature'];
    
    for (const name of paramNames) {
      const paramRegex = new RegExp(`PARAMETER ${name} [\\d.]+`);
      const newLine = `PARAMETER ${name} ${params[name]}`;
      
      if (paramRegex.test(content)) {
        content = content.replace(paramRegex, newLine);
      } else {
        content += '\n' + newLine;
      }
    }
    
    editor.setValue(content);
  }

  async goToStep2() {
    if (!this.selectedModel || !this.selectedTag) return;
    
    let modelfileContent = null;
    
    try {
      modelfileContent = await fetchModelModelfile(this.selectedModel.name);
    } catch (err) {
      console.log('Could not load modelfile from model, using predefined template');
    }
    
    if (modelfileContent) {
      const baseModelMatch = modelfileContent.match(/^FROM\s+(.+)$/m);
      if (baseModelMatch) {
        modelfileContent = modelfileContent.replace(
          /^FROM\s+.+$/m,
          `FROM ${this.selectedModel.name}:${this.selectedTag}`
        );
      }
      initEditor(modelfileContent);
    } else {
      this.currentTemplate = getTemplateForModel(this.selectedModel.name);
      const filledTemplate = fillTemplate(this.currentTemplate, this.selectedModel.name, this.selectedTag);
      initEditor(filledTemplate);
    }
    
    this.step1.style.display = 'none';
    this.step2.style.display = 'block';
    this.currentStep = 2;
    
    this.loadModelParameters();
  }

  goToStep1() {
    this.step2.style.display = 'none';
    this.step1.style.display = 'block';
    this.currentStep = 1;
  }

  formatModelfile() {
    formatModelfile();
    this.showToast('Modelfile formatted');
  }

  resetTemplate() {
    const filledTemplate = fillTemplate(this.currentTemplate, this.selectedModel.name, this.selectedTag);
    resetEditor(filledTemplate);

    this.modelParameters = {
      num_ctx: 4096,
      top_k: 40,
      top_p: 0.9,
      temperature: 0.7
    };

    this.paramNumCtx.value = 4096;
    this.paramTopK.value = 40;
    this.paramTopP.value = 0.9;
    this.paramTopPValue.textContent = '0.90';
    this.paramTemperature.value = 0.7;
    this.paramTemperatureValue.textContent = '0.7';

    this.updateModelfileParameters();

    this.showToast('Editor i parametri resetovani');
  }

  copyToClipboard() {
    const content = getEditorContent();
    navigator.clipboard.writeText(content).then(() => {
      this.showToast('Copied to clipboard');
    });
  }

  showSaveModal() {
    this.modelNameInput.value = '';
    this.exportResult.style.display = 'none';
    this.saveModal.style.display = 'flex';
    this.modelNameInput.focus();
  }

  hideSaveModal() {
    this.saveModal.style.display = 'none';
  }

  downloadModelfile() {
    const name = this.modelNameInput.value.trim();
    if (!name) {
      this.showExportError('Please enter a model name');
      return;
    }

    const content = getEditorContent();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Modelfile';
    a.click();
    URL.revokeObjectURL(url);
    
    this.showExportSuccess(`Modelfile "${name}" downloaded successfully`);
  }

  copyContent() {
    const name = this.modelNameInput.value.trim();
    if (!name) {
      this.showExportError('Please enter a model name');
      return;
    }

    const content = getEditorContent();
    navigator.clipboard.writeText(content).then(() => {
      this.showExportSuccess(`Modelfile copied to clipboard`);
    });
  }

  async createInOllama() {
    const name = this.modelNameInput.value.trim();
    if (!name) {
      this.showExportError('Please enter a model name');
      return;
    }

    const content = getEditorContent();
    
    this.createOllamaBtn.disabled = true;
    this.createOllamaBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> Creating...';
    
    try {
      const result = await createOllamaModel(name, content);
      
      if (result.success) {
        this.showExportSuccess(`Model "${name}" created in Ollama!`);
      } else {
        this.showExportError(result.error || 'Failed to create model');
      }
    } catch (err) {
      this.showExportError(err.message || 'Failed to create model');
    } finally {
      this.createOllamaBtn.disabled = false;
      this.createOllamaBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg> Create in Ollama`;
    }
  }

  showExportSuccess(message) {
    this.exportResult.style.display = 'block';
    this.resultMessage.className = 'result-message success';
    this.resultMessage.textContent = message;
  }

  showExportError(message) {
    this.exportResult.style.display = 'block';
    this.resultMessage.className = 'result-message error';
    this.resultMessage.textContent = message;
  }

  showToast(message) {
    this.toastMessage.textContent = message;
    this.toast.classList.add('show');
    setTimeout(() => {
      this.toast.classList.remove('show');
    }, 3000);
  }

  handleSave() {
    this.showSaveModal();
  }
}

window.ModelfileApp = ModelfileApp;

document.addEventListener('DOMContentLoaded', () => {
  new ModelfileApp();
});