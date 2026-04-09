# Modelfile Builder - Examples

This document provides examples of how to use the Modelfile Builder and how to create custom Modelfiles for Ollama.

## Table of Contents

1. [Quick Start Example](#quick-start-example)
2. [Creating a Simple Custom Model](#creating-a-simple-custom-model)
3. [Creating a Code Assistant](#creating-a-code-assistant)
4. [Creating a Multi-language Chatbot](#creating-a-multi-language-chatbot)
5. [Using System Prompts](#using-system-prompts)
6. [Customizing Parameters](#customizing-parameters)
7. [Embedding Models](#embedding-models)
8. [Vision Models](#vision-models)

---

## Quick Start Example

### Step 1: Start the Server

```bash
npm start
```

### Step 2: Open Browser

Navigate to `http://localhost:3000`

### Step 3: Create a Model

1. Select a base model (e.g., `llama3:latest`)
2. Click "Continue to Editor"
3. Modify the template as needed
4. Click "Save Model"
5. Enter a name (e.g., `my-assistant`)
6. Choose "Create in Ollama"

### Step 4: Use the Model

```bash
ollama run my-assistant
```

---

## Creating a Simple Custom Model

### Example: Basic Assistant

This creates a simple assistant with a custom system prompt:

```
FROM llama3:latest

SYSTEM """
You are a helpful coding assistant. 
You provide clear, concise answers and always include code examples when relevant.
"""

TEMPLATE """
<|begin_of_text|>{{if .System}}<|start_header_id|>system<|end_header_id|>

{{.System}}<|eot_id|>{{end}}<|start_header_id|>user<|end_header_id|>

{{.Prompt}}<|eot_id|><|start_header_id|>assistant<|end_header_id|>

{{.Response}}<|eot_id|>
"""

PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER top_k 40
PARAMETER num_ctx 4096
```

### How to create in Modelfile Builder:

1. Select `llama3` from the model dropdown
2. Choose `latest` tag
3. Edit the SYSTEM prompt in the editor
4. Save as `my-coding-assistant`

---

## Creating a Code Assistant

### Example: Python Code Expert

```
FROM codellama:7b

SYSTEM """
You are an expert Python developer. Your role is to:
1. Write clean, well-documented Python code
2. Follow PEP 8 style guidelines
3. Explain your code with comments
4. Suggest improvements and optimizations
5. Help debug issues when provided with error messages

When writing code, always consider:
- Type hints for better code clarity
- Docstrings for functions and classes
- Error handling where appropriate
- Performance considerations
"""

PARAMETER temperature 0.1
PARAMETER top_p 0.9
PARAMETER top_k 100
PARAMETER num_ctx 8192
PARAMETER num_gpu 1
```

### Key Parameters for Code Generation:

| Parameter | Recommended Value | Description |
|-----------|-------------------|-------------|
| `temperature` | 0.1 - 0.3 | Lower for more deterministic code |
| `top_k` | 100 | Higher for better code completions |
| `num_ctx` | 8192+ | Larger context for longer code files |
| `top_p` | 0.9 | Nucleus sampling threshold |

---

## Creating a Multi-language Chatbot

### Example: Multilingual Assistant

```
FROM mistral:latest

SYSTEM """
You are a multilingual assistant fluent in English, Serbian, Croatian, and Bosnian.
You can switch between languages based on user preference.
Respond in the same language as the user uses in their message.
Always maintain a friendly and professional tone.
"""

TEMPLATE """
[INST] {{.System}}

{{.Prompt}} [/INST] {{.Response}}
"""

PARAMETER temperature 0.7
PARAMETER top_p 0.95
PARAMETER repeat_penalty 1.1
```

---

## Using System Prompts

### Example: Role-based Assistant

```
FROM qwen2.5:14b

SYSTEM """
You are Dr. Sarah, a friendly family doctor with 20 years of experience.
Your approach:
- Always start by asking about the patient's main concern
- Use simple, non-medical language when explaining conditions
- Never diagnose - always recommend seeing a doctor for proper diagnosis
- Provide general health tips and preventive care advice
- Be empathetic and patient

Remember: You are not a substitute for professional medical advice.
"""

PARAMETER temperature 0.8
PARAMETER top_p 0.8
PARAMETER num_ctx 8192
```

### System Prompt Best Practices:

1. **Be specific** - Define exact behavior and constraints
2. **Set boundaries** - Clearly state what the model should/shouldn't do
3. **Use examples** - Include few-shot examples in the prompt
4. **Keep it concise** - Too long prompts can be ignored

---

## Customizing Parameters

### Common Parameters Reference

```
# Generation parameters
PARAMETER temperature 0.7          # 0.0-2.0, higher = more creative
PARAMETER top_p 0.9               # Nucleus sampling (0.0-1.0)
PARAMETER top_k 40                # Token selection window
PARAMETER repeat_penalty 1.1      # Penalize repetition (1.0+)
PARAMETER frequency_penalty 0.0   # Penalize frequent tokens
PARAMETER presence_penalty 0.0    # Penalize repeated concepts

# Context parameters
PARAMETER num_ctx 4096            # Context window size
PARAMETER num_gpu 1               # GPU layers to use

# Model behavior
PARAMETER stop "Human:"           # Stop sequences
```

### Example: Creative Writing Model

```
FROM llama3:latest

SYSTEM """
You are a creative storyteller who writes engaging short stories.
"""

PARAMETER temperature 1.0          # High creativity
PARAMETER top_p 0.95              # Diverse word selection
PARAMETER top_k 0                 # Unlimited token pool
PARAMETER repeat_penalty 1.2      # Some repetition allowed
PARAMETER num_ctx 8192            # Long stories
```

---

## Embedding Models

### Example: Text Embedding Model

```
FROM nomic-embed-text:latest

# No template needed for embedding models
# Just base model configuration
```

### Using Embeddings:

```python
import ollama

response = ollama.embeddings(
  model='nomic-embed-text',
  prompt='The quick brown fox'
)

embedding = response['embedding']
print(f"Embedding dimension: {len(embedding)}")
```

---

## Vision Models

### Example: Image Description Assistant

```
FROM llava:latest

SYSTEM """
You are an AI vision assistant. Your task is to:
- Carefully analyze images provided by users
- Describe the image in detail
- Identify objects, people, text, and scene
- Provide context and insights about the image
- Answer questions about the image accurately

Be specific and thorough in your descriptions.
"""

PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER num_ctx 4096
```

### Using Vision Models:

```bash
# Using ollama CLI
ollama run llava "What's in this image?" --image photo.jpg
```

---

## Advanced Examples

### Example: RAG-enabled Assistant (Simulated)

```
FROM llama3:8b

SYSTEM """
You are a research assistant with access to a knowledge base.
When answering questions:
1. First analyze what the user is asking
2. Provide a clear, accurate answer
3. If uncertain, say so honestly
4. Cite sources when possible

You have expertise in: technology, science, history, and general knowledge.
"""

TEMPLATE """
<|begin_of_text|>{{if .System}}<|start_header_id|>system<|end_header_id|>

{{.System}}<|eot_id|>{{end}}<|start_header_id|>user<|end_header_id|>

Context: {{.Context}}
Question: {{.Prompt}}<|eot_id|><|start_header_id|>assistant<|end_header_id|>

{{.Response}}<|eot_id|>
"""

PARAMETER temperature 0.5
PARAMETER top_p 0.9
PARAMETER num_ctx 16384
```

### Example: JSON Output Mode

```
FROM qwen2.5-coder:14b

SYSTEM """
You are a programming assistant that outputs valid JSON.
When responding, always:
1. Start response with {
2. Use proper JSON syntax
3. End response with }
4. No additional text outside JSON

Example response format:
{"code": "...", "explanation": "...", "language": "..."}
"""

PARAMETER temperature 0.2         # Low temperature for consistent JSON
PARAMETER top_p 0.8
PARAMETER repeat_penalty 1.1
```

---

## Tips & Tricks

### 1. Test Your Modelfile

```bash
# Create the model
ollama create my-model -f Modelfile

# Test it
ollama run my-model "Hello, how can you help me?"

# Delete if needed
ollama rm my-model
```

### 2. Iterate Quickly

Use the "Copy to Clipboard" option to quickly copy your Modelfile, then manually edit and test.

### 3. Parameter Tuning

- Start with default values
- Adjust one parameter at a time
- Test with the same prompt each time

### 4. Model Selection Guide

| Use Case | Recommended Model |
|----------|-------------------|
| General chat | llama3, mistral, qwen2.5 |
| Code generation | codellama, qwen2.5-coder |
| Math/Reasoning | qwen3, deepseek-r1 |
| Embedding | nomic-embed-text |
| Vision | llava |
| Multi-language | qwen, aya |

---

## Troubleshooting

### Model not starting?

- Check Ollama is running: `ollama serve`
- Verify enough disk space: `ollama list`

### Responses not as expected?

- Adjust `temperature` parameter
- Review and refine your SYSTEM prompt

### Context issues?

- Increase `num_ctx` for longer conversations
- Note: Higher context = more memory required

### Slow responses?

- Reduce `num_ctx` if not needed
- Adjust `num_gpu` to use more GPU layers

---

## Further Reading

- [Ollama Documentation](https://github.com/ollama/ollama)
- [Modelfile Reference](https://github.com/ollama/ollama/blob/main/docs/modelfile.md)
- [Template Syntax](https://github.com/ollama/ollama/blob/main/docs/modelfile.md#template)