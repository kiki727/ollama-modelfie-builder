const TEMPLATES = {
  default: `FROM {{model}}:{{tag}}

# System prompt - defines the model's behavior
SYSTEM """
You are a helpful AI assistant created by the user.
You should be polite, accurate, and concise in your responses.
"""

# Template for chat interactions
TEMPLATE """
{{if .System}}<|system|>
{{.System}}{{end}}
<|user|>
{{.Prompt}}<|assistant|>
{{.Response}}<|end|>
"""

# Parameters
PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER top_k 40
PARAMETER num_ctx 4096
`,

  codellama: `FROM {{model}}:{{tag}}

SYSTEM """
You are an expert code assistant. Your task is to help users write clean, efficient, and well-documented code.
Provide explanations when needed, and suggest improvements where appropriate.
"""

TEMPLATE """
{{if .System}}<|system|>
{{.System}}{{end}}
<|user|>
{{.Prompt}}<|assistant|>
{{.Response}}<|end|>
"""

PARAMETER temperature 0.2
PARAMETER top_p 0.9
PARAMETER top_k 100
PARAMETER num_ctx 8192
`,

  mistral: `FROM {{model}}:{{tag}}

SYSTEM """
You are a helpful AI assistant. Provide clear and concise answers.
"""

TEMPLATE """
[INST] {{.System}}

{{.Prompt}} [/INST] {{.Response}}
"""
`,

  qwen: `FROM {{model}}:{{tag}}

SYSTEM """
You are a helpful AI assistant developed by the user.
"""

TEMPLATE """
<|im_start|>system
{{.System}}<|im_end|>
<|im_start|>user
{{.Prompt}}<|im_end|>
<|im_start|>assistant
{{.Response}}<|im_end|>
"""

PARAMETER temperature 0.7
PARAMETER top_p 0.8
PARAMETER repeat_penalty 1.1
PARAMETER num_ctx 8192
`,

  qwen3: `FROM {{model}}:{{tag}}

SYSTEM """
You are a helpful AI assistant.
"""

TEMPLATE """
<|im_start|>system
{{.System}}<|im_end|>
<|im_start|>user
{{.Prompt}}<|im_end|>
<|im_start|>assistant
{{.Response}}<|im_end|>
"""

PARAMETER temperature 0.7
PARAMETER top_p 0.8
PARAMETER num_ctx 32768
`,

  gemma: `FROM {{model}}:{{tag}}

SYSTEM """
You are a helpful and informative AI assistant.
"""

TEMPLATE """
<start_of_turn>model
{{if .System}}{{.System}}
<eos>
{{end}}<start_of_turn>user
{{.Prompt}}<eos>
<start_of_turn>model
{{.Response}}<eos>
"""
`,

  gemma3: `FROM {{model}}:{{tag}}

SYSTEM """
You are a helpful AI assistant.
"""

TEMPLATE """
{{if .System}}<|system|>
{{.System}}{{end}}
<|user|>
{{.Prompt}}<|end_of_turn|>
<|start_of_turn|>
{{.Response}}<|end_of_turn|>
"""
`,

  deepseek: `FROM {{model}}:{{tag}}

SYSTEM """
You are a helpful AI assistant.
"""

TEMPLATE """
{{if .System}}<|system|>
{{.System}}{{end}}
<|user|>
{{.Prompt}}<|assistant|>
{{.Response}}<|end_of_turn|>
"""
`,

  llama3: `FROM {{model}}:{{tag}}

SYSTEM """
You are a helpful AI assistant.
"""

TEMPLATE """
<|begin_of_text|>{{if .System}}<|start_header_id|>system<|end_header_id|>

{{.System}}<|eot_id|>{{end}}<|start_header_id|>user<|end_header_id|>

{{.Prompt}}<|eot_id|><|start_header_id|>assistant<|end_header_id|>

{{.Response}}<|eot_id|>
"""

PARAMETER temperature 0.7
PARAMETER top_p 0.9
`,

  llama3_1: `FROM {{model}}:{{tag}}

SYSTEM """
You are a helpful AI assistant.
"""

TEMPLATE """
<|begin_of_text|>{{if .System}}<|start_header_id|>system<|end_header_id|>

{{.System}}<|eot_id|>{{end}}<|start_header_id|>user<|end_header_id|>

{{.Prompt}}<|eot_id|><|start_header_id|>assistant<|end_header_id|>

{{.Response}}<|eot_id|>
"""

PARAMETER temperature 0.8
PARAMETER top_p 0.95
`,

  phi: `FROM {{model}}:{{tag}}

SYSTEM """
You are a helpful AI assistant.
"""

TEMPLATE """
<|system|>
{{.System}}<|end|>
<|user|>
{{.Prompt}}<|end|>
<|assistant|>
{{.Response}}<|end|>
"""

PARAMETER temperature 0.7
PARAMETER top_p 0.9
`,

  granite: `FROM {{model}}:{{tag}}

SYSTEM """
You are a helpful AI assistant.
"""

TEMPLATE """
{{if .System}}<|system|>
{{.System}}{{end}}
<|user|>
{{.Prompt}}<|end_of_turn|>
<|model|>
{{.Response}}<|end_of_turn|>
"""

PARAMETER temperature 0.7
PARAMETER top_p 0.9
`,

  nomic: `FROM {{model}}:{{tag}}

# Embedding model - no chat template needed
`,

  llava: `FROM {{model}}:{{tag}}

SYSTEM """
You are a vision-enabled AI assistant. Describe images in detail when asked.
"""

TEMPLATE """
{{if .System}}<|system|>
{{.System}}{{end}}
<|user|>
{{.Prompt}}<|end_of_turn|>
<|assistant|>
{{.Response}}<|end_of_turn|>
"""

PARAMETER temperature 0.7
`
};

function getTemplateForModel(modelName) {
  const lower = modelName.toLowerCase();
  
  if (lower.includes('codellama')) return TEMPLATES.codellama;
  if (lower.includes('mistral') || lower.includes('mixtral')) return TEMPLATES.mistral;
  if (lower.includes('qwen2.5')) return TEMPLATES.qwen;
  if (lower.includes('qwen3')) return TEMPLATES.qwen3;
  if (lower.includes('gemma3')) return TEMPLATES.gemma3;
  if (lower.includes('gemma2')) return TEMPLATES.gemma;
  if (lower.includes('deepseek')) return TEMPLATES.deepseek;
  if (lower.includes('llama3.1') || lower.includes('llama3')) return TEMPLATES.llama3;
  if (lower.includes('phi3.5')) return TEMPLATES.phi;
  if (lower.includes('phi')) return TEMPLATES.phi;
  if (lower.includes('granite3')) return TEMPLATES.granite;
  if (lower.includes('nomic-embed')) return TEMPLATES.nomic;
  if (lower.includes('llava')) return TEMPLATES.llava;
  
  return TEMPLATES.default;
}

function fillTemplate(template, modelName, tag) {
  return template.replace(/\{\{model\}\}/g, modelName)
                 .replace(/\{\{tag\}\}/g, tag);
}