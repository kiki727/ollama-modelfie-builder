const TEMPLATES = {
  default: `FROM {{model}}:{{tag}}

# System prompt - defines the model's behavior
SYSTEM """
You are a helpful AI assistant created by the user.
You should be polite, accurate, and concise in your responses.
"""

# ChatML template - works with most models
TEMPLATE """
<|im_start|>system
{{.System}}<|im_end|>
<|im_start|>user
{{.Prompt}}<|im_end|>
<|im_start|>assistant
{{.Response}}<|im_end|>
"""

# Parameters
PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER top_k 40
PARAMETER num_ctx 4096
PARAMETER stop "<|im_start|>"
PARAMETER stop "<|im_end|>"
`,

  codellama: `FROM {{model}}:{{tag}}

SYSTEM """
You are an expert code assistant. Your task is to help users write clean, efficient, and well-documented code.
Provide explanations when needed, and suggest improvements where appropriate.
"""

# Llama 2/CodeLlama template
TEMPLATE """
<|begin_of_text|>{{ if .System }}<|start_header_id|>system<|end_header_id|>
{{ .System }}<|eot_id|>{{ end }}<|start_header_id|>user<|end_header_id|>
{{ .Prompt }}<|eot_id|><|start_header_id|>assistant<|end_header_id|>
{{ .Response }}<|eot_id|>
"""

PARAMETER temperature 0.2
PARAMETER top_p 0.9
PARAMETER top_k 100
PARAMETER num_ctx 8192
PARAMETER stop "<|start_header_id|>"
PARAMETER stop "<|end_header_id|>"
PARAMETER stop "<|eot_id|>"
`,

  mistral: `FROM {{model}}:{{tag}}

SYSTEM """
You are a helpful AI assistant. Provide clear and concise answers.
"""

# Mistral v3 template with proper tokenization
TEMPLATE """
<s>[INST] {{ if .System }}{{ .System }}
{{ end }}{{ .Prompt }} [/INST]{{ if .Response }}
{{ .Response }}</s>{{ end }}
"""

PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER num_ctx 8192
PARAMETER stop "[INST]"
PARAMETER stop "[/INST]"
PARAMETER stop "</s>"
`,

  qwen: `FROM {{model}}:{{tag}}

SYSTEM """
You are a helpful AI assistant developed by the user.
"""

# Qwen template
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
PARAMETER stop "<|im_start|>"
PARAMETER stop "<|im_end|>"
`,

  qwen3: `FROM {{model}}:{{tag}}

SYSTEM """
You are a helpful AI assistant.
"""

# Qwen3 template
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
PARAMETER stop "<|im_start|>"
PARAMETER stop "<|im_end|>"
`,

  gemma: `FROM {{model}}:{{tag}}

SYSTEM """
You are a helpful and informative AI assistant.
"""

# Gemma 2 template
TEMPLATE """
{{- if .System }}<start_of_turn>user
{{ .System }}
<eos>
{{- end }}<start_of_turn>user
{{ .Prompt }}<eos>
<start_of_turn>model
{{ .Response }}<eos>
"""

PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER num_ctx 8192
PARAMETER stop "<start_of_turn>"
PARAMETER stop "<end_of_turn>"
PARAMETER stop "<eos>"
`,

  gemma3: `FROM {{model}}:{{tag}}

SYSTEM """
You are a helpful AI assistant.
"""

# Gemma 3 template with tool support
TEMPLATE """
{{- if .Messages }}
  {{- if or .System .Tools }}
<start_of_turn>user
{{- if .System }}
{{ .System }}
{{- end }}
{{- if .Tools }}
# Tools
You may call one or more functions to assist with the user query.
Provide function definitions as JSON within the following XML-like block:
<tools>
{{- range .Tools }}
{"type": "function", "function": {{ .Function }}}
{{- end }}
</tools>
For each function call, return a JSON object with the function name and arguments within:
<tool_call>
{"name": <function-name>, "arguments": <args-json-object>}
</tool_call>
{{- end }}
<end_of_turn>
  {{- end }}

{{- range $i, $_ := .Messages }}
  {{- $last := eq (len (slice $.Messages $i)) 1 -}}
  {{- if eq .Role "user" }}
<start_of_turn>user
{{ .Content }}<end_of_turn>
  {{ else if eq .Role "assistant" }}
<start_of_turn>model
{{ if .Content }}{{ .Content }}
{{- else if .ToolCalls }}
<tool_call>
{{- range .ToolCalls }}
{"name": "{{ .Function.Name }}", "arguments": {{ .Function.Arguments }}}
{{- end }}
</tool_call>
{{- end }}
{{ if not $last }}<end_of_turn>{{ end }}
  {{ else if eq .Role "tool" }}
<start_of_turn>user
<tool_response>
{{ .Content }}
</tool_response>
<end_of_turn>
  {{ end }}
  {{- if and (ne .Role "assistant") $last }}
<start_of_turn>model
  {{ end }}
{{- end }}
{{- else }}
  {{- if .System }}
<start_of_turn>user
{{ .System }}<end_of_turn>
  {{ end }}
  {{ if .Prompt }}
<start_of_turn>user
{{ .Prompt }}<end_of_turn>
  {{ end }}
<start_of_turn>model
{{ .Response }}{{ if .Response }}<end_of_turn>{{ end }}
{{- end }}"""

PARAMETER stop "<end_of_turn>"
PARAMETER temperature 0.1
`,

  deepseek: `FROM {{model}}:{{tag}}

SYSTEM """
You are a helpful AI assistant.
"""

# DeepSeek V3/R1 template
TEMPLATE """
{{- if .System }}{{ .System }}{{ end }}

{{- range $i, $_ := .Messages }}
{{- $last := eq (len (slice $.Messages $i)) 1 }}
{{- if eq .Role "user" }}<｜User｜>{{ .Content }}
{{- else if eq .Role "assistant" }}<｜Assistant｜>{{ .Content }}{{- if not $last }}<｜end of sentence｜>{{- end }}
{{- end }}
{{- if and $last (ne .Role "assistant") }}<｜Assistant｜>{{- end }}
{{- end }}"""

PARAMETER stop "<｜begin of sentence｜>"
PARAMETER stop "<｜end of sentence｜>"
PARAMETER stop "<｜User｜>"
PARAMETER stop "<｜Assistant｜>"

PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER num_ctx 16384
`,

  llama3: `FROM {{model}}:{{tag}}

SYSTEM """
You are a helpful AI assistant.
"""

# Llama 3 template
TEMPLATE """
<|begin_of_text|>{{ if .System }}<|start_header_id|>system<|end_header_id|>
{{ .System }}<|eot_id|>{{ end }}<|start_header_id|>user<|end_header_id|>
{{ .Prompt }}<|eot_id|><|start_header_id|>assistant<|end_header_id|>
{{ .Response }}<|eot_id|>
"""

PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER stop "<|start_header_id|>"
PARAMETER stop "<|end_header_id|>"
PARAMETER stop "<|eot_id|>"
`,

  llama3_1: `FROM {{model}}:{{tag}}

SYSTEM """
You are a helpful AI assistant.
"""

# Llama 3.1 template
TEMPLATE """
<|begin_of_text|>{{ if .System }}<|start_header_id|>system<|end_header_id|>
{{ .System }}<|eot_id|>{{ end }}<|start_header_id|>user<|end_header_id|>
{{ .Prompt }}<|eot_id|><|start_header_id|>assistant<|end_header_id|>
{{ .Response }}<|eot_id|>
"""

PARAMETER temperature 0.8
PARAMETER top_p 0.95
PARAMETER stop "<|start_header_id|>"
PARAMETER stop "<|end_header_id|>"
PARAMETER stop "<|eot_id|>"
PARAMETER stop "<|reserved_special_token|>"
`,

  phi: `FROM {{model}}:{{tag}}

SYSTEM """
You are a helpful AI assistant.
"""

# Phi-3 template
TEMPLATE """
{{ if .System }}<|system|>{{ .System }}<|end|>
{{ end }}{{ if .Prompt }}<|user|>{{ .Prompt }}<|end|>
{{ end }}<|assistant|>{{ .Response }}<|end|>
"""

PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER num_ctx 4096
PARAMETER stop "<|end|>"
`,

  granite: `FROM {{model}}:{{tag}}

SYSTEM """
You are a helpful AI assistant.
"""

# Granite 3/4 template with tool support
TEMPLATE """
{{- /* System message with tools */}}
{{- if .Tools }}
<|start_of_role|>system<|end_of_role|>{{ .System }}

You have access to the following tools:
{{- range .Tools }}
{{ . }}
{{- end }}<|end_of_text|>
{{- else if .System }}
<|start_of_role|>system<|end_of_role|>{{ .System }}<|end_of_text|>
{{- end }}

{{- /* Messages */}}
{{- range $i, $_ := .Messages }}
{{- if eq .Role "user" }}<|start_of_role|>user<|end_of_role|>{{ .Content }}<|end_of_text|>
{{- else if eq .Role "assistant" }}<|start_of_role|>assistant<|end_of_role|>{{ .Content }}<|end_of_text|>
{{- else if eq .Role "tool" }}<|start_of_role|>tool<|end_of_role|>{{ .Content }}<|end_of_text|>
{{- end }}
{{- end }}

{{- /* Generation prompt */}}
<|start_of_role|>assistant<|end_of_role|>
"""

PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER num_ctx 32768
PARAMETER stop "<|start_of_role|>"
PARAMETER stop "<|end_of_role|>"
PARAMETER stop "<|end_of_text|>"
`,

  rnj: `FROM {{model}}:{{tag}}

SYSTEM """
You are a helpful AI assistant.
"""

# RNJ-1 / Essential AI template with tool support
TEMPLATE """
<|begin_of_text|><|start_header_id|>system<|end_header_id|>
{{ .System }}
{{- if .Tools }}

# Tools

You may call one or more functions to assist with the user query.

You are provided with function signatures within <tools></tools> XML tags:
<tools>
{{- range .Tools }}
{{ . }}
{{- end }}
</tools>

For each function call, return a json object with function name and arguments within <tool_call></tool_call> XML tags:
<tool_call>
{"name": <function-name>, "arguments": <args-json-object>}
</tool_call>
{{- end }}<|eot_id|>
{{- range $i, $_ := .Messages }}
{{- if eq .Role "system" }}{{ continue }}{{ end }}
{{- $last := eq (len (slice $.Messages $i)) 1 }}
{{- if eq .Role "user" }}<|start_header_id|>user<|end_header_id|>
{{ .Content }}<|eot_id|>
{{- else if eq .Role "assistant" }}<|start_header_id|>assistant<|end_header_id|>
{{ if .Content }}{{ .Content }}{{ end }}
{{- if .ToolCalls }}
{{- range .ToolCalls }}
<tool_call>
{"name": "{{ .Function.Name }}", "arguments": {{ .Function.Arguments }}}
</tool_call>
{{- end }}
{{- end }}{{ if not $last }}<|eot_id|>{{ end }}
{{- else if eq .Role "tool" }}<|start_header_id|>user<|end_header_id|>
<tool_response>
{{ .Content }}
</tool_response><|eot_id|>
{{- end }}
{{- if and (ne .Role "assistant") $last }}<|start_header_id|>assistant<|end_header_id|>
{{ end }}
{{- end }}"""

PARAMETER temperature 0.2
PARAMETER stop "<|start_header_id|>"
PARAMETER stop "<|end_header_id|>"
PARAMETER stop "<|eot_id|>"
`,

  nomic: `FROM {{model}}:{{tag}}

# Embedding model - no chat template needed
`,

  llava: `FROM {{model}}:{{tag}}

SYSTEM """
You are a vision-enabled AI assistant. Describe images in detail when asked.
"""

# LLaVA uses Llama 3 template with vision
TEMPLATE """
<|begin_of_text|>{{ if .System }}<|start_header_id|>system<|end_header_id|>
{{ .System }}<|eot_id|>{{ end }}<|start_header_id|>user<|end_header_id|>
{{ .Prompt }}<|eot_id|><|start_header_id|>assistant<|end_header_id|>
{{ .Response }}<|eot_id|>
"""

PARAMETER temperature 0.7
PARAMETER num_ctx 4096
PARAMETER stop "<|start_header_id|>"
PARAMETER stop "<|end_header_id|>"
PARAMETER stop "<|eot_id|>"
`
};

function getTemplateForModel(modelName) {
  const lower = modelName.toLowerCase();
  
  if (lower.includes('rnj') || lower.includes('pupu')) return TEMPLATES.rnj;
  if (lower.includes('codellama')) return TEMPLATES.codellama;
  if (lower.includes('mistral') || lower.includes('mixtral')) return TEMPLATES.mistral;
  if (lower.includes('qwen2.5')) return TEMPLATES.qwen;
  if (lower.includes('qwen3')) return TEMPLATES.qwen3;
  if (lower.includes('gemma3')) return TEMPLATES.gemma3;
  if (lower.includes('gemma2')) return TEMPLATES.gemma;
  if (lower.includes('deepseek')) return TEMPLATES.deepseek;
  if (lower.includes('llama3.1') || lower.includes('llama3')) return TEMPLATES.llama3;
  if (lower.includes('phi3.5') || lower.includes('phi3')) return TEMPLATES.phi;
  if (lower.includes('phi')) return TEMPLATES.phi;
  if (lower.includes('granite3') || lower.includes('granite4') || lower.includes('granite')) return TEMPLATES.granite;
  if (lower.includes('nomic-embed')) return TEMPLATES.nomic;
  if (lower.includes('llava')) return TEMPLATES.llava;
  
  return TEMPLATES.default;
}

function fillTemplate(template, modelName, tag) {
  return template.replace(/\{\{model\}\}/g, modelName)
                 .replace(/\{\{tag\}\}/g, tag);
}
