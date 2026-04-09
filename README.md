# Modelfile Builder

CLI and Web UI tool for creating Ollama Modelfiles with an easy-to-use interface.

## Features

- **Auto-detection**: Automatically detects if Ollama is installed and lists your installed models
- **Fallback models**: If Ollama is not installed, provides a list of popular models to choose from
- **Smart templates**: Pre-configured templates for different model families (Llama3, Qwen, Mistral, CodeLlama, etc.)
- **CodeMirror editor**: Syntax-highlighted editor for Modelfile editing
- **Export options**: Download as file, copy to clipboard, or directly create in Ollama
- **Dark UI**: Modern dark theme inspired by shadcn/ui design

## Prerequisites

- Node.js 18+ 
- npm or yarn

## Installation

```bash
# Clone or download this repository
cd modelfile-builder

# Install dependencies
npm install

# Make cli.js executable (Linux/Mac)
# Not needed on Windows
```

## Usage

### Start the web server

```bash
# Using npm
npm start

# Using npx (without installing)
npx modelfile-builder serve

# With custom port
npx modelfile-builder serve --port 8080

# With verbose output
npx modelfile-builder serve --verbose
```

### Check Ollama status

```bash
npx modelfile-builder check
```

### Access the Web UI

After starting the server, open your browser and navigate to:
```
http://localhost:3000
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `modelfile-builder serve` | Start the web UI server |
| `modelfile-builder serve -p <port>` | Start server on custom port |
| `modelfile-builder serve -v` | Start with verbose output |
| `modelfile-builder check` | Check Ollama status and installed models |

## Web UI Workflow

1. **Select Base Model**: Choose from installed models or popular fallback models
2. **Select Version**: Pick a specific tag/version (latest, 8b, etc.)
3. **Edit Template**: Customize the Modelfile using the CodeMirror editor
4. **Save**: Enter a model name and choose an export option:
   - Download as `Modelfile` text file
   - Copy to clipboard
   - Create directly in Ollama (if available)

## Project Structure

```
modelfile-builder/
├── package.json          # Dependencies
├── cli.js                # CLI entry point (Commander)
├── server.js             # Express server
├── lib/
│   └── ollama-helper.js  # Ollama detection & model listing
├── public/
│   ├── index.html        # Main UI
│   ├── css/
│   │   └── style.css     # Dark theme styles
│   └── js/
│       ├── app.js        # Main application logic
│       ├── editor.js     # CodeMirror wrapper
│       ├── templates.js  # Modelfile templates
│       └── models.js     # API functions
└── README.md             # This file
```

## Troubleshooting

### Ollama not found

If Ollama is not in your PATH, the tool will automatically fall back to a list of popular models. You can still create Modelfiles, but won't be able to create them directly in Ollama.

To fix:
1. Install Ollama from https://ollama.com
2. Make sure it's added to your system PATH

### Port already in use

If port 3000 is already in use, specify a different port:

```bash
npx modelfile-builder serve --port 8080
```

### Cannot create model in Ollama

If you get an error when trying to create a model directly:
1. Make sure Ollama is running (`ollama serve`)
2. Check that you have enough disk space
3. Verify the model name is valid (lowercase, numbers, hyphens only)

## License

MIT